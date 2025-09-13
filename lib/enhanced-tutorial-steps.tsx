import { EnhancedTutorialStep } from '@/components/ui/enhanced-tutorial-overlay';
import { 
  Search, Users, Heart, Mail, Send, Trophy, 
  Sparkles, Target, BookOpen, Star, Zap,
  Clock, Brain, CheckCircle
} from 'lucide-react';

export const enhancedSearchPageTutorialSteps: EnhancedTutorialStep[] = [
  {
    id: 'welcome',
    title: '🎉 Welcome to Research Flow!',
    description: 'Ready to discover amazing professors and advance your research career? This quick tour will show you everything you need to know!',
    target: 'body',
    position: 'center',
    icon: <Sparkles className="w-6 h-6 text-[#0CF2A0]" />,
    confettiOnComplete: true,
    tip: 'This tutorial saves your progress, so you can come back anytime!'
  },
  {
    id: 'search-input',
    title: '🔍 Start Your Research Journey',
    description: 'Type any research topic that interests you - like "machine learning", "cancer research", or "climate change". Our AI will find the perfect professors for you!',
    target: '#ai-input-with-loading',
    position: 'bottom',
    offset: { x: 0, y: 15 },
    icon: <Search className="w-6 h-6 text-blue-500" />,
    action: 'input',
    pulseTarget: true,
    showPointer: true,
    tip: 'Try being specific! "Deep learning for medical imaging" gives better results than just "AI"'
  },
  {
    id: 'search-prompt',
    title: '⌨️ Let\'s Search Together!',
    description: 'Go ahead and search for your research interest! I\'ll show you the amazing features once we have some results.',
    target: '#ai-input-with-loading',
    position: 'bottom',
    offset: { x: 0, y: 15 },
    icon: <Target className="w-6 h-6 text-purple-500" />,
    action: 'input',
    pulseTarget: true
  },
];

export const enhancedPostSearchTutorialSteps: EnhancedTutorialStep[] = [
  {
    id: 'results-overview',
    title: '🎯 Great Search Results!',
    description: 'You\'ve found professors matching your interests! Let me show you how to make the most of these results.',
    target: 'body',
    position: 'center',
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    confettiOnComplete: true
  },
  {
    id: 'search-history',
    title: '📚 Your Search History',
    description: 'Like ChatGPT, we save all your searches! Click here anytime to revisit past searches or continue where you left off.',
    target: '[title="Search History"]',
    position: 'right',
    offset: { x: 15, y: 0 },
    icon: <Clock className="w-6 h-6 text-orange-500" />,
    action: 'hover',
    pulseTarget: true,
    tip: 'Your searches are saved automatically - even if you close the browser!'
  },
  {
    id: 'ai-recommendation',
    title: '🤖 AI-Powered Recommendations',
    description: 'Our AI analyzes each professor\'s research and suggests who to contact first, plus personalized tips for reaching out!',
    target: '[data-tutorial="ai-recommendation"]',
    position: 'top',
    offset: { x: 0, y: -15 },
    icon: <Brain className="w-6 h-6 text-purple-500" />,
    tip: 'These recommendations consider your research alignment, not just keywords!'
  },
  {
    id: 'professor-cards',
    title: '👨‍🎓 Professor Profiles at a Glance',
    description: 'Each card shows key info: research areas, publications, citations, and contact details. Everything you need to make informed decisions!',
    target: '[data-tutorial="professor-cards-container"]',
    position: 'top',
    offset: { x: 0, y: -20 },
    icon: <Users className="w-6 h-6 text-blue-500" />,
    action: 'hover',
    showPointer: true
  },
  {
    id: 'save-professor',
    title: '❤️ Build Your Dream List',
    description: 'Found someone interesting? Click "Save" to add them to your personal list. Access saved professors anytime from your profile!',
    target: '[data-tutorial="save-button"]',
    position: 'left',
    offset: { x: -15, y: 0 },
    icon: <Heart className="w-6 h-6 text-red-500" />,
    action: 'click',
    pulseTarget: true,
    tip: 'Save multiple professors to compare them later!'
  },
  {
    id: 'personalized-email',
    title: '✉️ AI-Generated Emails',
    description: 'Click "Personalized Email" to generate a professional outreach email tailored to each professor\'s research!',
    target: '[data-tutorial="personalized-email-button"]',
    position: 'top',
    offset: { x: 0, y: -15 },
    icon: <Mail className="w-6 h-6 text-indigo-500" />,
    action: 'click',
    pulseTarget: true,
    confettiOnComplete: true,
    tip: 'Our AI creates unique emails that highlight research alignment!'
  },
  {
    id: 'email-tab',
    title: '📧 Your Email Hub',
    description: 'Switch to the Email tab to see all your generated emails, edit them, and send directly through Gmail integration!',
    target: '[data-tutorial="email-tab"]',
    position: 'bottom',
    offset: { x: 0, y: 15 },
    icon: <Send className="w-6 h-6 text-green-500" />,
    action: 'click',
    showPointer: true
  },
  {
    id: 'complete',
    title: '🏆 You\'re a Pro Now!',
    description: 'Congratulations! You\'ve mastered Research Flow. Start connecting with professors and advance your research career!',
    target: 'body',
    position: 'center',
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    confettiOnComplete: true,
    tip: 'Come back anytime - your data is saved permanently!'
  },
];

export const enhancedEmailTutorialSteps: EnhancedTutorialStep[] = [
  {
    id: 'email-welcome',
    title: '📧 Welcome to Email Composer!',
    description: 'Let\'s create the perfect outreach email that will get professors excited about your research!',
    target: 'body',
    position: 'center',
    icon: <Mail className="w-6 h-6 text-blue-500" />,
    confettiOnComplete: true
  },
  {
    id: 'fill-profile',
    title: '👤 Complete Your Profile',
    description: 'Fill in your information - name, research interests, university, and academic level. This helps personalize your email!',
    target: '[data-tutorial="profile-form"]',
    position: 'right',
    offset: { x: 15, y: 0 },
    icon: <BookOpen className="w-6 h-6 text-purple-500" />,
    action: 'input',
    pulseTarget: true,
    tip: 'Be specific about your research - it makes your email more compelling!'
  },
  {
    id: 'research-abstract',
    title: '📝 Your Research Story',
    description: 'Add your research title and a brief abstract. This is your chance to showcase what makes your work unique!',
    target: '[data-tutorial="research-fields"]',
    position: 'top',
    offset: { x: 0, y: -15 },
    icon: <Brain className="w-6 h-6 text-indigo-500" />,
    action: 'input',
    tip: 'Keep it concise but impactful - 3-4 sentences work best!'
  },
  {
    id: 'resume-upload',
    title: '📎 Add Your Resume (Optional)',
    description: 'Upload your CV or resume, or paste a link. This gives professors more context about your background!',
    target: '[data-tutorial="resume-section"]',
    position: 'bottom',
    offset: { x: 0, y: 15 },
    icon: <Zap className="w-6 h-6 text-orange-500" />,
    action: 'click',
    showPointer: true
  },
  {
    id: 'generate-magic',
    title: '✨ Generate Your Email',
    description: 'Click "Generate Personalized Email" and watch the magic happen! Our AI crafts a perfect, professional email in seconds.',
    target: '[data-tutorial="generate-button"]',
    position: 'top',
    offset: { x: 0, y: -15 },
    icon: <Sparkles className="w-6 h-6 text-[#0CF2A0]" />,
    action: 'click',
    pulseTarget: true,
    confettiOnComplete: true,
    tip: 'Each email is unique and highlights research alignment!'
  },
  {
    id: 'edit-perfect',
    title: '✏️ Make It Perfect',
    description: 'Review and edit the generated email. Add your personal touch or specific details to make it even better!',
    target: '[data-tutorial="email-editor"]',
    position: 'top',
    offset: { x: 0, y: -15 },
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    tip: 'Small personalizations can make a big difference!'
  },
  {
    id: 'send-options',
    title: '🚀 Ready to Send!',
    description: 'Connect Gmail to send directly, or copy the email to send from any email client. The choice is yours!',
    target: '[data-tutorial="send-section"]',
    position: 'bottom',
    offset: { x: 0, y: 15 },
    icon: <Send className="w-6 h-6 text-green-500" />,
    action: 'click',
    showPointer: true
  },
  {
    id: 'email-complete',
    title: '🎉 Email Master Achieved!',
    description: 'You\'re all set to reach out to professors! Remember to follow up if you don\'t hear back within a week.',
    target: 'body',
    position: 'center',
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    confettiOnComplete: true,
    tip: 'Save your sent emails to track responses!'
  }
];

export const quickStartTutorialSteps: EnhancedTutorialStep[] = [
  {
    id: 'quick-search',
    title: '⚡ Quick Start Guide',
    description: 'Search for any research topic to find professors instantly. Try "machine learning" or your specific interest!',
    target: '#ai-input-with-loading',
    position: 'bottom',
    offset: { x: 0, y: 15 },
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    action: 'input',
    pulseTarget: true
  },
  {
    id: 'quick-results',
    title: '🎯 Browse & Connect',
    description: 'Save professors you like, generate personalized emails, and start making valuable research connections!',
    target: 'body',
    position: 'center',
    icon: <Users className="w-6 h-6 text-blue-500" />,
    confettiOnComplete: true,
    tip: 'The more specific your search, the better your results!'
  },
];
