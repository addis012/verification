#!/bin/bash

# GitHub Repository Setup Script
# Run this script to push the transaction scraper to GitHub

echo "🚀 Setting up GitHub repository for Transaction Data Scraper"
echo "========================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add remote repository
echo "Adding GitHub remote repository..."
git remote add origin https://github.com/addis012/verification.git
git remote set-url origin https://github.com/addis012/verification.git

# Add all files
echo "Adding files to git..."
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "feat: Initial commit - Transaction Data Scraper

✅ Multi-bank transaction extraction (Bank of Abyssinia, CBE)
✅ Enhanced CBE retry mechanism (5 attempts with delays)
✅ React frontend with Tailwind CSS and shadcn/ui
✅ Express.js backend with TypeScript
✅ Python scraping engine with multiple methods
✅ PostgreSQL database with Drizzle ORM
✅ Real-time job status tracking
✅ Data export capabilities (JSON/CSV)
✅ Comprehensive documentation and deployment guides

Core Features:
- BeautifulSoup, Selenium, Playwright scraping methods
- Intelligent retry logic for intermittent CBE accessibility
- Bot detection bypass for CBE URLs
- Transaction field extraction (sender, receiver, amount)
- Modern responsive UI with real-time updates
- RESTful API with proper error handling
- Type-safe database operations
- Production-ready deployment configuration"

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Repository successfully pushed to GitHub!"
echo "📋 Next steps:"
echo "   1. Visit https://github.com/addis012/verification"
echo "   2. Verify all files are uploaded correctly"
echo "   3. Set up GitHub Pages if needed"
echo "   4. Configure deployment secrets"
echo "   5. Review and merge any pull requests"

echo ""
echo "🔗 Repository URL: https://github.com/addis012/verification"
echo "📚 Documentation: See README.md for full setup instructions"
echo "🚀 Deployment: See DEPLOYMENT.md for deployment options"