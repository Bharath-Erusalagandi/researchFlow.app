import { TutorialStep } from '@/components/ui/tutorial-overlay';

export const searchPageTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Research Flow!',
    description: 'Let\'s take a quick tour of how to find and connect with professors for your research interests. This will only take a minute!',
    target: 'body',
    position: 'center',
  },
  {
    id: 'search-input',
    title: 'Let\'s Start with a Search!',
    description: 'Type your research topic here! Try "machine learning", "cancer research", or "environmental science". Go ahead and search now - we\'ll show you the other features once we have results!',
    target: '#ai-input-with-loading',
    position: 'bottom',
    offset: { x: 0, y: 10 },
  },
  {
    id: 'search-prompt',
    title: 'Please Search First',
    description: 'Please type a research topic and search to continue the tutorial. We need to show you real professor results to demonstrate the features!',
    target: '#ai-input-with-loading',
    position: 'bottom',
    offset: { x: 0, y: 10 },
  },
];

// Steps to show after user has searched and has results
export const postSearchTutorialSteps: TutorialStep[] = [
  {
    id: 'search-history',
    title: 'Search History',
    description: 'Great! Now you can see your search results. Click here anytime to view your previous searches - like ChatGPT, we save all your search sessions.',
    target: '[title="Search History"]',
    position: 'right',
    offset: { x: 10, y: 0 },
  },
  {
    id: 'ai-recommendation',
    title: 'AI Recommendations',
    description: 'Our AI has analyzed the results and recommends the best professors to contact, along with personalized outreach tips.',
    target: '[data-tutorial="ai-recommendation"]',
    position: 'top',
    offset: { x: 0, y: -10 },
  },
  {
    id: 'professor-cards',
    title: 'Professor Profiles',
    description: 'Browse through professor profiles with their research areas, universities, and contact information. Click on any card to learn more!',
    target: '[data-tutorial="professor-cards-container"]',
    position: 'top',
    offset: { x: 0, y: -20 },
  },
  {
    id: 'save-professor',
    title: 'Save Professors',
    description: 'Click the heart icon to save professors you\'re interested in. You can access your saved list anytime from the navigation.',
    target: '[data-tutorial="save-button"]',
    position: 'left',
    offset: { x: -10, y: 0 },
  },
  {
    id: 'email-tab',
    title: 'Personalized Emails',
    description: 'Switch to the Email tab to generate AI-powered, personalized outreach emails to professors. We\'ll help you craft the perfect message!',
    target: '[data-tutorial="email-tab"]',
    position: 'bottom',
    offset: { x: 0, y: 10 },
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'That\'s it! You now know how to find professors, save them, and generate personalized emails. Remember, you can always restart this tutorial from the search history sidebar. Happy researching!',
    target: 'body',
    position: 'center',
  },
];

export const quickTutorialSteps: TutorialStep[] = [
  {
    id: 'quick-search',
    title: 'Quick Start',
    description: 'Type your research topic in the search bar to find relevant professors instantly!',
    target: '#ai-input-with-loading',
    position: 'bottom',
    offset: { x: 0, y: 10 },
  },
  {
    id: 'quick-results',
    title: 'Browse Results',
    description: 'We\'ll show you 30+ professors with AI recommendations. Save the ones you like and generate personalized emails!',
    target: 'body',
    position: 'center',
  },
];
