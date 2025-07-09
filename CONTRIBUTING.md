# Contributing to Transaction Data Scraper

## Welcome Contributors!

We appreciate your interest in contributing to this Ethiopian banking transaction data scraper. This guide will help you get started with contributing to the project.

## 🚀 Getting Started

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/verification.git`
3. Install dependencies: `npm install && pip install -r python-requirements.txt`
4. Set up environment variables: `cp .env.example .env`
5. Start development server: `npm run dev`

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express.js backend
│   ├── services/           # Python scraping services
│   ├── routes.ts           # API routes
│   └── storage.ts          # Database layer
├── shared/                 # Shared types and schemas
└── docs/                   # Documentation
```

## 🎯 How to Contribute

### 1. Bug Reports
- Use the GitHub issue tracker
- Include detailed reproduction steps
- Provide environment information
- Add relevant logs and screenshots

### 2. Feature Requests
- Open an issue with [Feature Request] prefix
- Explain the use case and benefits
- Provide examples if applicable
- Discuss implementation approach

### 3. Code Contributions
- Follow the existing code style
- Write comprehensive tests
- Update documentation
- Create meaningful commit messages

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict type checking
- **React**: Use functional components with hooks
- **Python**: Follow PEP 8 conventions
- **CSS**: Use Tailwind CSS classes
- **Formatting**: Prettier for JS/TS, Black for Python

### Testing
- Unit tests for utilities and helpers
- Integration tests for API endpoints
- E2E tests for critical user flows
- Python tests for scraping logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/bank-xyz-support

# Make your changes
git add .
git commit -m "feat: add Bank XYZ transaction extraction"

# Push to your fork
git push origin feature/bank-xyz-support

# Create Pull Request
```

## 🏦 Adding New Bank Support

### Step 1: Analyze Bank Transaction Format
- Study transaction receipt structure
- Identify key data fields
- Test URL accessibility patterns
- Document extraction requirements

### Step 2: Create Extraction Patterns
```python
# In server/services/scraper.py
def extract_bank_xyz_data(soup, url):
    """Extract specific data patterns for Bank XYZ"""
    patterns = {
        'transaction_id': r'Transaction ID:\s*(\w+)',
        'amount': r'Amount:\s*ETB\s*([\d,]+\.?\d*)',
        'from_account': r'From Account:\s*(\d+)',
        'to_account': r'To Account:\s*(\d+)',
        'date': r'Date:\s*(\d{2}/\d{2}/\d{4})'
    }
    
    extracted_data = {}
    html_text = soup.get_text()
    
    for field, pattern in patterns.items():
        match = re.search(pattern, html_text, re.IGNORECASE)
        if match:
            extracted_data[field] = match.group(1)
    
    return extracted_data
```

### Step 3: Add URL Detection
```python
# In auto_detect_method function
elif 'bankxyz.com' in url:
    return extract_bank_xyz_data(soup, url)
```

### Step 4: Test Thoroughly
- Test with real transaction URLs
- Verify data extraction accuracy
- Test retry mechanisms
- Check error handling

### Step 5: Update Documentation
- Add bank to supported list
- Document URL patterns
- Update API documentation
- Add usage examples

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
npm run test:server

# Python tests
python -m pytest

# E2E tests
npm run test:e2e
```

### Test Coverage
- Aim for 80%+ code coverage
- Test both success and failure scenarios
- Include edge cases and error conditions
- Test with real-world data when possible

## 📝 Documentation

### Code Documentation
- Document complex algorithms
- Explain business logic
- Add JSDoc comments for functions
- Include usage examples

### API Documentation
- Update OpenAPI specification
- Document request/response formats
- Include error codes and messages
- Provide example requests

## 🔒 Security Guidelines

### Data Protection
- Never commit sensitive data
- Use environment variables for secrets
- Validate all input data
- Sanitize extracted content

### Web Scraping Ethics
- Respect robots.txt files
- Implement reasonable delays
- Don't overwhelm target servers
- Handle rate limiting gracefully

## 📊 Performance Considerations

### Backend Performance
- Optimize database queries
- Implement proper caching
- Use connection pooling
- Monitor memory usage

### Frontend Performance
- Lazy load components
- Optimize bundle size
- Use React.memo for expensive components
- Implement proper loading states

## 🚀 Pull Request Process

### Before Submitting
1. Test your changes locally
2. Update relevant documentation
3. Add or update tests
4. Run linting and formatting
5. Ensure all tests pass

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process
- Maintain code quality standards
- Ensure backward compatibility
- Verify test coverage
- Check performance impact

## 🤝 Community

### Communication
- Be respectful and inclusive
- Provide constructive feedback
- Help other contributors
- Share knowledge and experiences

### Recognition
- Contributors are credited in releases
- Significant contributions highlighted
- Community appreciation events
- Mentorship opportunities

## 📞 Getting Help

### Resources
- GitHub Issues: Bug reports and feature requests
- Discussions: General questions and ideas
- Documentation: Comprehensive guides
- Code Comments: Implementation details

### Mentorship
- New contributors welcome
- Pair programming sessions available
- Code review feedback provided
- Best practices shared

## 🎉 Thank You!

Every contribution, no matter how small, helps improve this project. Whether it's fixing a typo, adding a feature, or improving documentation, your efforts are valued and appreciated.

Together, we're building a robust solution for Ethiopian banking transaction data extraction!