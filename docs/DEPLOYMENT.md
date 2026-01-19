# Deployment Guide

## Platform Choice
PrepWise is currently deployed on Render.

## Development
```bash
docker-compose up -d
```

## Production Deployment

### Phase 1: Initial Setup (Vercel + Supabase + Upstash)

#### 1.1 Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

**Environment Variables to Set:**
```bash
DATABASE_URL=postgresql://[supabase-connection-string]
UPSTASH_REDIS_REST_URL=https://[your-redis-url]
UPSTASH_REDIS_REST_TOKEN=[your-redis-token]
NEXTAUTH_SECRET=[your-secret]
NEXTAUTH_URL=https://[your-domain]
```

#### 1.2 Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings > Database
3. Run migrations:
```bash
npx prisma db push
npx prisma generate
```

#### 1.3 Upstash Setup
1. Create Redis database at [upstash.com](https://upstash.com)
   - **Recommended**: Create separate databases for each environment:
     - `prepwise-dev` for development
     - `prepwise-prod` for production
     - `prepwise-staging` for staging (optional)
   - This ensures data isolation between environments
2. Get REST URL and token for each database
3. Update environment variables:
   - **Development** (`.env.local`): Use dev database credentials
   - **Production** (Vercel environment variables): Use prod database credentials

### Phase 2: Monitoring & Alerts

#### 2.1 Database Monitoring
- Set up Supabase dashboard alerts
- Monitor database size (500MB limit)
- Track query performance

#### 2.2 Redis Monitoring
- Monitor Upstash request count (10K/day limit)
- Set up alerts for approaching limits
- Track memory usage patterns

#### 2.3 Application Monitoring
- Vercel Analytics for performance
- Error tracking with Vercel
- Function timeout monitoring (10s limit)

### Phase 3: Backup Procedures

#### 3.1 Database Backups
```bash
# Export Supabase data
pg_dump [connection-string] > backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backup_$DATE.sql"
```

#### 3.2 Redis Backups
- Upstash provides automatic backups
- Export data via REST API if needed

### Phase 4: Migration Triggers

#### 4.1 When to Migrate to Railway ($5/month)
- Database approaching 500MB limit
- Redis requests exceeding 10K/day
- Want simplified single-platform management

**Migration Steps:**
1. Create Railway project
2. Import PostgreSQL data from Supabase
3. Set up Redis on Railway
4. Update environment variables
5. Deploy application

#### 4.2 When to Migrate to DigitalOcean ($35-42/month)
- Need more control over infrastructure
- Require higher limits
- Want managed services with more flexibility

**Migration Steps:**
1. Set up DigitalOcean App Platform
2. Create managed PostgreSQL database
3. Set up managed Redis
4. Update Docker configuration
5. Deploy with Docker

#### 4.3 Hybrid Upgrades
- Upgrade only Supabase to Pro ($25/month) for larger database
- Upgrade only Upstash for more Redis requests
- Keep Vercel for hosting

## Environment Variables Reference

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://[connection-string]

# Redis
UPSTASH_REDIS_REST_URL=https://[url]
UPSTASH_REDIS_REST_TOKEN=[token]

# Authentication
NEXTAUTH_SECRET=[secret]
NEXTAUTH_URL=https://[domain]

# OpenAI (for AI features)
OPENAI_API_KEY=[key]
```

### Optional Variables
```bash
# Logging
LOG_LEVEL=info

# Feature flags
ENABLE_CHAT=true
ENABLE_RECIPE_MODIFICATION=true
```

## Troubleshooting

### Common Issues
1. **Function Timeout**: Increase timeout or optimize code
2. **Database Connection**: Check Supabase connection string
3. **Redis Errors**: Verify Upstash credentials
4. **Build Failures**: Check environment variables

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Documentation](https://docs.upstash.com)
```

**docs/README.md**:
```markdown
# Documentation

## Overview
This directory contains all project documentation, including requirements, architecture, and decision records.

## Contents
- `ARCHITECTURE.md`: Technical architecture and implementation details
- `requirements.md`: Feature requirements and user stories
- `CHANGELOG.md`: Record of changes and updates
- `DEPLOYMENT.md`: Deployment instructions
- `architecture/`: Detailed technical documentation
  - `decisions/`: Architectural Decision Records (ADRs)
  - `PIVOTS.md`: Documentation of major architectural changes
  - `diagrams/`: Architecture diagrams and visualizations

## How to Use
1. Start with `requirements.md` for feature understanding
2. Refer to `ARCHITECTURE.md` for technical implementation
3. Check `CHANGELOG.md` for recent changes
4. Review ADRs for specific decision rationales
5. Consult `PIVOTS.md` for major architectural changes

## Contributing
- Update relevant documents when making changes
- Create new ADRs for significant decisions
- Update CHANGELOG.md for all changes
- Keep diagrams up to date
```

**docs/architecture/decisions/001-pipeline-pattern.md**:
```markdown
# Pipeline Pattern for Chain Orchestration

## Status
Accepted

## Context
The application needs to handle multiple types of conversations (recipe-specific, general cooking, etc.) while maintaining context and enabling easy addition of new capabilities.

## Decision
We will implement a pipeline pattern for chain orchestration with the following characteristics:
- Linear flow of data through the system
- Clear input/output contracts for each step
- Support for both sequential and conditional execution
- Easy integration of new chains

## Consequences
### Positive
- Clear separation of concerns
- Easy to test individual components
- Simplified addition of new capabilities
- Better error handling

### Negative
- Additional complexity in setup
- Need for careful state management
- Potential performance overhead

## Alternatives Considered
1. Event-driven architecture
   - Rejected due to complexity in maintaining conversation context
2. Simple if-else routing
   - Rejected due to scalability concerns
3. Microservices approach
   - Rejected due to overhead for this scale

## Implementation Notes
- Each chain becomes a pipeline step
- State is passed between steps
- Error handling at each step
- Monitoring capabilities built-in
```

**docs/architecture/PIVOTS.md**:
```markdown
# Architecture Pivots

## What is a Pivot?
A pivot is a significant change in the architecture that affects multiple components or the overall system design.

## How to Handle Pivots

### 1. Documentation Updates
- Create a new ADR explaining the pivot
- Update ARCHITECTURE.md with new patterns
- Mark deprecated patterns clearly
- Update implementation phases

### 2. Code Migration
- Create migration guides
- Document breaking changes
- Provide backward compatibility where possible
- Set clear timelines for deprecation

### 3. Communication
- Document the rationale for the pivot
- List affected components
- Provide migration paths
- Set expectations for timeline

## Example Pivot: Memory System Enhancement
### Before
- Simple StateGraph memory
- In-memory storage only
- Limited context retention

### After
- Multi-layered memory system
- Redis Stack integration
- Vector-based semantic search

### Migration Path
1. Implement new memory system alongside existing
2. Gradually migrate chains to new system
3. Monitor performance and usage
4. Remove old system once migration complete
```

Would you like me to:
1. Show you the commands to create these files?
2. Help you verify the content after creation?
3. Add any additional ADRs or documentation?