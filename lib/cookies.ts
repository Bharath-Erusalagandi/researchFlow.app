'use client'

export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const cookies = {
  set: (name: string, value: string, options: CookieOptions = {}) => {
    if (typeof document === 'undefined') return;

    const {
      expires,
      path = '/',
      domain,
      secure,
      httpOnly = false,
      sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Add expiration
    if (expires) {
      if (expires instanceof Date) {
        cookieString += `; expires=${expires.toUTCString()}`;
      } else {
        const expirationDate = new Date(Date.now() + expires * 1000);
        cookieString += `; expires=${expirationDate.toUTCString()}`;
      }
    }

    // Add path
    cookieString += `; path=${path}`;

    // Add domain
    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    // Add secure flag
    if (secure || (typeof window !== 'undefined' && window.location.protocol === 'https:')) {
      cookieString += '; secure';
    }

    // Add sameSite
    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  },

  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const nameEQ = encodeURIComponent(name) + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  remove: (name: string, options: CookieOptions = {}) => {
    const { path = '/', domain } = options;
    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      cookieString += '; secure';
    }

    document.cookie = cookieString;
  },

  // Specific methods for our app
  setUserSession: (sessionData: {
    userId?: string;
    email?: string;
    provider?: string;
    expiresAt?: number;
  }) => {
    const expirationTime = sessionData.expiresAt || (Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
    cookies.set('researchConnect_session', JSON.stringify(sessionData), {
      expires: expirationTime,
      secure: true,
      sameSite: 'lax'
    });
  },

  getUserSession: () => {
    const session = cookies.get('researchConnect_session');
    if (!session) return null;

    try {
      const sessionData = JSON.parse(session);
      // Check if session is expired
      if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
        cookies.remove('researchConnect_session');
        return null;
      }
      return sessionData;
    } catch {
      return null;
    }
  },

  clearUserSession: () => {
    cookies.remove('researchConnect_session');
  },

  setTutorialSeen: (tutorialKey: string) => {
    const seenTutorials = JSON.parse(cookies.get('researchConnect_seenTutorials') || '{}');
    seenTutorials[tutorialKey] = Date.now();
    cookies.set('researchConnect_seenTutorials', JSON.stringify(seenTutorials), {
      expires: 365 * 24 * 60 * 60 * 1000, // 1 year
      secure: true,
      sameSite: 'lax'
    });
  },

  hasSeenTutorial: (tutorialKey: string): boolean => {
    const seenTutorials = JSON.parse(cookies.get('researchConnect_seenTutorials') || '{}');
    return !!seenTutorials[tutorialKey];
  },

  clearTutorialHistory: () => {
    cookies.remove('researchConnect_seenTutorials');
  }
};
