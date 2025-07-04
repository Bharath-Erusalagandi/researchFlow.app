#!/bin/bash

# Install required dependencies
npm install framer-motion lucide-react

# Create the necessary directories if they don't exist
mkdir -p components/blocks
mkdir -p components/ui
mkdir -p styles

# Message explaining the setup
echo "==============================================="
echo "Hero Component Installation"
echo "==============================================="
echo ""
echo "The following has been set up:"
echo "1. components/blocks/hero-section-nexus.tsx - Advanced hero with interactive canvas"
echo "2. components/ui/animated-hero.tsx - Simple animated hero component"
echo "3. Updated globals.css with shine animation"
echo ""
echo "You can use the components like this:"
echo ""
echo "import InteractiveHero from './components/blocks/hero-section-nexus';"
echo "// or"
echo "import { Hero } from './components/ui/animated-hero';"
echo ""
echo "// Then in your component:"
echo "<InteractiveHero />"
echo "// or"
echo "<Hero />"
echo ""
echo "===============================================" 