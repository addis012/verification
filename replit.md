# Transaction Data Scraper

## Overview

This is a full-stack web application built for scraping transaction data from financial websites. The application uses a modern React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database with Drizzle ORM. The system supports multiple scraping methods including BeautifulSoup, Selenium, Playwright, and automatic method selection.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with hot module replacement
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **API Design**: RESTful endpoints for job management
- **Process Management**: Child processes for Python scraping scripts
- **Middleware**: Custom logging and error handling

### Database Architecture
- **Database**: PostgreSQL
- **ORM**: Drizzle with type-safe queries
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless driver

## Key Components

### Database Schema
- **scraping_jobs**: Stores scraping job metadata, status, and results
  - Supports multiple scraping methods (beautifulsoup, selenium, playwright, auto)
  - Tracks job lifecycle (pending, processing, completed, failed)
  - Stores raw HTML and extracted transaction data as JSONB
- **transactions**: Normalized transaction data extracted from scraping jobs
  - Financial transaction fields (amount, currency, accounts, dates)
  - Links back to originating scraping job

### API Endpoints
- `POST /api/validate-url`: URL validation and accessibility checking
- `POST /api/scrape`: Start new scraping jobs
- `GET /api/jobs`: List recent scraping jobs
- `GET /api/jobs/:id`: Get specific job details
- `GET /api/export/:format/:jobId`: Export transaction data (JSON/CSV)

### Frontend Components
- **ScrapingForm**: URL input and scraping method selection
- **ResultsTable**: Real-time job status and results display
- **StatusSidebar**: System metrics and recent job history
- **UI Components**: Complete shadcn/ui component library integration

### Python Scraping Engine
- **Multi-method support**: BeautifulSoup for static content, Selenium/Playwright for dynamic sites
- **Automatic method selection**: Intelligent fallback between scraping methods
- **Transaction extraction**: Pattern-based financial data extraction
- **Error handling**: Robust error reporting and status updates

## Data Flow

1. **Job Initiation**: User submits URL and selects scraping method through React form
2. **Validation**: Backend validates URL accessibility before creating job
3. **Job Creation**: New scraping job record created in database with "pending" status
4. **Async Processing**: Python scraper launched as child process
5. **Status Updates**: Job status updated throughout scraping lifecycle
6. **Data Extraction**: Raw HTML processed to extract transaction data
7. **Result Storage**: Extracted transactions stored in normalized database tables
8. **Real-time Updates**: Frontend polls for job status updates via React Query
9. **Export Options**: Completed data exportable in JSON/CSV formats

## External Dependencies

### Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **@radix-ui/***: Headless UI primitives for accessible components
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **zod**: Runtime type validation

### Python Dependencies (Inferred)
- **requests + beautifulsoup4**: HTTP requests and HTML parsing
- **selenium**: Browser automation for dynamic content
- **playwright**: Modern browser automation alternative

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development build tool with HMR
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR on client directory
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Neon Database with connection pooling
- **Scripts**: Integrated Python scraper execution

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Process Management**: Single Node.js process handles both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Port Configuration**: Configurable server port

## Changelog
- July 08, 2025: Initial setup
- July 08, 2025: Successfully implemented real transaction data extraction for Bank of Abyssinia URLs
- July 08, 2025: Added chromium headless browser automation with SSL bypass capabilities  
- July 08, 2025: BREAKTHROUGH - Successfully bypassed CBE bot detection with enhanced anti-detection methods
- July 08, 2025: CBE URLs now return 246K+ characters of HTML content vs previous 0 characters
- July 08, 2025: Both Bank of Abyssinia and CBE URLs now accessible for transaction data extraction
- July 08, 2025: Fixed JSON parsing issues with debug output and improved error handling
- July 08, 2025: Enhanced CBE data extraction patterns - now extracts 7/8 transaction fields successfully
- July 08, 2025: Confirmed consistent access to both Bank of Abyssinia and CBE with full HTML content retrieval
- July 08, 2025: Implemented robust retry mechanism (5 attempts) for intermittent CBE URL accessibility
- July 08, 2025: Added specific extraction patterns for sender name, sender account, amount, receiver account, and receiver name
- July 09, 2025: Completed comprehensive GitHub repository preparation with professional documentation
- July 09, 2025: Created production-ready deployment guides and contribution frameworks
- July 09, 2025: Finalized project structure with README, DEPLOYMENT.md, CONTRIBUTING.md, and LICENSE
- July 09, 2025: Established complete requirements documentation and setup instructions
- July 09, 2025: Repository now ready for GitHub deployment at https://github.com/addis012/verification

## User Preferences

Preferred communication style: Simple, everyday language.