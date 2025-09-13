import { supabase } from './supabaseClient';

export interface UserPreferences {
  id?: number;
  user_id: string;
  tutorials_completed: Record<string, boolean>;
  tutorial_last_seen?: string;
  preferred_search_filters: Record<string, any>;
  search_history: Array<{
    id: string;
    query: string;
    timestamp: number;
    results_count: number;
  }>;
  saved_professors: Array<{
    id: string;
    name: string;
    university: string;
    saved_at: number;
  }>;
  email_preferences: Record<string, any>;
  last_login_at?: string;
  login_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface SearchSession {
  id?: number;
  user_id: string;
  session_id: string;
  query: string;
  results_count: number;
  ai_suggestion?: string;
  professors_found: any[];
  created_at?: string;
}

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  private userPreferences: UserPreferences | null = null;
  private isInitialized = false;

  static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  async initializeUser(userId: string): Promise<UserPreferences> {
    try {
      // Try to get existing preferences
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingPrefs && !fetchError) {
        // Update login tracking
        const { data: updatedPrefs, error: updateError } = await supabase
          .from('user_preferences')
          .update({
            last_login_at: new Date().toISOString(),
            login_count: (existingPrefs.login_count || 0) + 1
          })
          .eq('user_id', userId)
          .select()
          .single();

        this.userPreferences = updatedPrefs || existingPrefs;
        this.isInitialized = true;
        return this.userPreferences as UserPreferences;
      }

      // Create new user preferences if they don't exist
      const defaultPreferences: Partial<UserPreferences> = {
        user_id: userId,
        tutorials_completed: {},
        preferred_search_filters: {},
        search_history: [],
        saved_professors: [],
        email_preferences: {},
        login_count: 1,
        last_login_at: new Date().toISOString()
      };

      const { data: newPrefs, error: insertError } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user preferences:', insertError);
        throw insertError;
      }

      this.userPreferences = newPrefs;
      this.isInitialized = true;
      return newPrefs;
    } catch (error) {
      console.error('Error initializing user preferences:', error);
      throw error;
    }
  }

  async getTutorialStatus(tutorialKey: string): Promise<boolean> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    return this.userPreferences.tutorials_completed[tutorialKey] || false;
  }

  async markTutorialCompleted(tutorialKey: string): Promise<void> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    const updatedTutorials = {
      ...this.userPreferences.tutorials_completed,
      [tutorialKey]: true
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        tutorials_completed: updatedTutorials,
        tutorial_last_seen: new Date().toISOString()
      })
      .eq('user_id', this.userPreferences.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tutorial status:', error);
      throw error;
    }

    this.userPreferences = data;
  }

  async hasSeenAnyTutorial(): Promise<boolean> {
    if (!this.userPreferences) {
      return false;
    }

    return Object.keys(this.userPreferences.tutorials_completed).length > 0;
  }

  async addToSearchHistory(query: string, resultsCount: number): Promise<void> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    const newSearchEntry = {
      id: Date.now().toString(),
      query,
      timestamp: Date.now(),
      results_count: resultsCount
    };

    // Keep only last 50 searches
    const updatedHistory = [newSearchEntry, ...this.userPreferences.search_history].slice(0, 50);

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        search_history: updatedHistory
      })
      .eq('user_id', this.userPreferences.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating search history:', error);
      throw error;
    }

    this.userPreferences = data;
  }

  async saveSearchSession(sessionData: Omit<SearchSession, 'user_id'>): Promise<void> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    const { error } = await supabase
      .from('search_sessions')
      .insert({
        ...sessionData,
        user_id: this.userPreferences.user_id
      });

    if (error) {
      console.error('Error saving search session:', error);
      throw error;
    }
  }

  async getRecentSearchSessions(limit: number = 10): Promise<SearchSession[]> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    const { data, error } = await supabase
      .from('search_sessions')
      .select('*')
      .eq('user_id', this.userPreferences.user_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching search sessions:', error);
      throw error;
    }

    return data || [];
  }

  async saveProfessor(professor: { id: string; name: string; university: string }): Promise<void> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    const savedProfessor = {
      ...professor,
      saved_at: Date.now()
    };

    // Check if already saved
    const isAlreadySaved = this.userPreferences.saved_professors.some(p => p.id === professor.id);
    if (isAlreadySaved) {
      return;
    }

    const updatedSaved = [...this.userPreferences.saved_professors, savedProfessor];

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        saved_professors: updatedSaved
      })
      .eq('user_id', this.userPreferences.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error saving professor:', error);
      throw error;
    }

    this.userPreferences = data;
  }

  async removeSavedProfessor(professorId: string): Promise<void> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    const updatedSaved = this.userPreferences.saved_professors.filter(p => p.id !== professorId);

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        saved_professors: updatedSaved
      })
      .eq('user_id', this.userPreferences.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error removing saved professor:', error);
      throw error;
    }

    this.userPreferences = data;
  }

  getSavedProfessors(): Array<{ id: string; name: string; university: string; saved_at: number }> {
    return this.userPreferences?.saved_professors || [];
  }

  isProfessorSaved(professorId: string): boolean {
    return this.userPreferences?.saved_professors.some(p => p.id === professorId) || false;
  }

  async updateEmailPreferences(preferences: Record<string, any>): Promise<void> {
    if (!this.userPreferences) {
      throw new Error('User preferences not initialized');
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        email_preferences: {
          ...this.userPreferences.email_preferences,
          ...preferences
        }
      })
      .eq('user_id', this.userPreferences.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    }

    this.userPreferences = data;
  }

  getSearchHistory(): Array<{ id: string; query: string; timestamp: number; results_count: number }> {
    return this.userPreferences?.search_history || [];
  }

  getUserPreferences(): UserPreferences | null {
    return this.userPreferences;
  }

  isUserInitialized(): boolean {
    return this.isInitialized && this.userPreferences !== null;
  }

  // Clear all data (for logout)
  clearUserData(): void {
    this.userPreferences = null;
    this.isInitialized = false;
  }

  // Migration helper: Import data from localStorage
  async migrateFromLocalStorage(): Promise<void> {
    if (!this.userPreferences || typeof window === 'undefined') {
      return;
    }

    try {
      // Migrate tutorial completion
      const hasSeenTutorial = localStorage.getItem('researchConnect_hasSeenTutorial');
      if (hasSeenTutorial === 'true') {
        await this.markTutorialCompleted('main_search_tutorial');
      }

      // Migrate saved professors from localStorage if any
      const savedProfessorsLocal = localStorage.getItem('researchConnect_savedProfessors');
      if (savedProfessorsLocal) {
        try {
          const savedData = JSON.parse(savedProfessorsLocal);
          // Process and save to database...
          console.log('Migrated local saved professors:', savedData);
        } catch (e) {
          console.warn('Could not parse saved professors from localStorage');
        }
      }

      // Clear old localStorage data after migration
      localStorage.removeItem('researchConnect_hasSeenTutorial');
      localStorage.removeItem('researchConnect_savedProfessors');
      
      console.log('Successfully migrated user data from localStorage to database');
    } catch (error) {
      console.error('Error migrating from localStorage:', error);
    }
  }
}

// Export singleton instance
export const userPrefsService = UserPreferencesService.getInstance();
