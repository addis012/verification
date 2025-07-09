# Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- PostgreSQL 14+
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/addis012/verification.git
cd verification

# Install dependencies
npm install
pip install -r python-requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

## Production Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=5000
```

### Build and Run
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Database Setup
```bash
# Run migrations
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

## Replit Deployment

### Automatic Setup
1. Fork this repository
2. Import to Replit
3. Set environment variables in Replit secrets
4. Run `npm install`
5. Start with `npm run dev`

### Required Replit Secrets
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to `production`

## Docker Deployment

### Build Image
```bash
docker build -t transaction-scraper .
```

### Run Container
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e NODE_ENV=production \
  transaction-scraper
```

## Performance Optimization

### Database Indexing
```sql
-- Add indexes for better query performance
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_created_at ON scraping_jobs(created_at);
CREATE INDEX idx_transactions_job_id ON transactions(job_id);
```

### Connection Pooling
- Default pool size: 10 connections
- Adjust based on concurrent users
- Monitor connection usage

## Monitoring

### Health Check Endpoint
```bash
curl http://localhost:5000/health
```

### Logs
```bash
# View application logs
npm run logs

# View database logs
npm run db:logs
```

## Security

### SSL/TLS
- Use HTTPS in production
- Configure SSL certificates
- Enable HSTS headers

### Rate Limiting
- API rate limiting enabled
- Adjust limits based on usage
- Monitor for abuse

## Backup Strategy

### Database Backups
```bash
# Daily backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20250108.sql
```

### Application Backups
- Code repository: GitHub
- Environment configs: Secure storage
- Database: Daily automated backups

## Troubleshooting

### Common Issues
1. **Database connection failed**: Check DATABASE_URL
2. **Python script errors**: Verify python-requirements.txt
3. **Port conflicts**: Change PORT environment variable
4. **Memory issues**: Increase server memory allocation

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Log Analysis
```bash
# View recent errors
tail -f logs/error.log

# Search for specific issues
grep "CBE" logs/application.log
```

## Scaling

### Horizontal Scaling
- Load balancer configuration
- Multiple server instances
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching layer

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Database maintenance weekly
- Security patches immediately
- Performance monitoring daily

### Version Updates
```bash
# Update Node.js dependencies
npm update

# Update Python dependencies
pip install -r python-requirements.txt --upgrade
```