# Personalized Email Feature

## Overview

The Personalized Email feature allows users to generate customized emails to professors based on their own research information. This feature helps create more professional and targeted outreach emails that are likely to get better responses from professors.

## How It Works

### 1. User Input
Users provide:
- **Full Name**: Their complete name for professional correspondence
- **Research Title**: The title of their current research paper or project  
- **Research Abstract**: A detailed summary of their research work, methodology, and findings

### 2. Email Generation
The system generates a personalized email that includes:
- Professional greeting using the professor's title and name
- Introduction of the user and their research background
- Specific mention of the professor's research area and university
- Clear research abstract and collaboration opportunities
- Professional closing with next steps

### 3. Email Customization
- The generated email can be edited before sending
- All user information is saved locally for future use
- Users can generate multiple personalized emails without re-entering information

## Features

### 🧠 Smart Email Generation
- Automatically incorporates professor's research field and university
- Creates professional, structured emails
- Suggests specific collaboration opportunities

### 💾 Local Storage
- User research information is saved locally
- No need to re-enter information for future emails
- Privacy-focused approach

### 🎨 Modern UI
- Beautiful modal interface with smooth animations
- Step-by-step process (input → generation → review)
- Mobile-responsive design

### ⚡ Easy Integration
- Available on both Search and Professors pages
- One-click access from professor cards
- Seamless workflow integration

## Where to Find It

### Search Page (`/search`)
- Click "Personalized Email" button on any professor card after searching
- Located next to the "Quick Email" button

### Professors Page (`/professors`)  
- Click "Personalized Email" button on any saved professor card
- Primary action button with prominent placement

### Test Page (`/test-email`)
- Dedicated test page to try the feature
- Useful for testing and development

## Usage Instructions

1. **Navigate** to either the Search or Professors page
2. **Find** a professor you want to contact
3. **Click** the "Personalized Email" button
4. **Fill in** your research information:
   - Enter your full name
   - Add your research paper/project title
   - Provide a detailed research abstract
5. **Generate** the personalized email
6. **Review** and edit the generated email if needed
7. **Send** the email directly through your email client

## Technical Implementation

### Components
- `PersonalizedEmailModal.tsx`: Main modal component
- Integrated into `pages/search.tsx` and `pages/professors.tsx`

### State Management
- React hooks for modal state
- localStorage for persistent user data
- Professor data passed as props

### Styling
- Consistent with existing app design
- Dark theme with green accent color (`#0CF2A0`)
- Framer Motion animations

## Benefits

### For Students/Researchers
- **Professional Communication**: Well-structured, professional emails
- **Time Saving**: No need to write emails from scratch
- **Higher Response Rate**: Personalized content more likely to get responses
- **Consistency**: Maintains professional tone across all outreach

### For Professors
- **Clear Information**: Structured emails with all relevant details
- **Research Context**: Immediate understanding of student's work
- **Professional Approach**: Demonstrates seriousness and preparation

## Future Enhancements

- **AI Integration**: Use GPT/Claude API for even smarter email generation
- **Template System**: Multiple email templates for different purposes
- **Email Tracking**: Track email open rates and responses
- **Research Field Matching**: Auto-suggest professors based on research abstract
- **Collaboration History**: Track past communications and follow-ups

## Development Notes

The feature is designed to be:
- **Modular**: Easy to integrate into new pages
- **Extensible**: Can be enhanced with AI services
- **User-Friendly**: Intuitive workflow with clear steps
- **Privacy-Focused**: All data stored locally

This feature significantly enhances the research connection workflow by providing a professional, efficient way to reach out to potential collaborators and mentors. 