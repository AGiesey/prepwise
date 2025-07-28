# Deployment Platform Choice

## Status
Accepted

## Context
PrepWise needs to be deployed to a cloud platform that supports:
- Next.js application hosting
- PostgreSQL database
- Redis for memory management
- Docker containerization
- CI/CD pipelines
- Cost-effective pricing for personal projects

## Decision
Use **Vercel + Supabase + Upstash** as the initial deployment platform.

## Consequences

### Positive
- **Cost**: $0/month for initial deployment
- **Next.js Integration**: Native Vercel support for Next.js applications
- **Database**: Supabase provides PostgreSQL with real-time features
- **Memory System**: Upstash provides Redis with serverless pricing
- **Developer Experience**: Excellent DX with automatic deployments
- **Scalability**: Can upgrade individual services as needed

### Negative
- **Complexity**: Multiple service providers to manage
- **Limits**: Free tier limitations on database size and Redis requests
- **Vendor Lock-in**: Each service has its own ecosystem

## Platform Details

### Vercel (Hosting)
- **Plan**: Hobby (Free)
- **Features**: 
  - Automatic deployments from Git
  - Edge functions support
  - Global CDN
  - 10-second function timeout limit
- **Cost**: $0/month

### Supabase (Database)
- **Plan**: Free tier
- **Features**:
  - PostgreSQL database
  - 500MB storage limit
  - Real-time subscriptions
  - Built-in authentication (optional)
- **Cost**: $0/month

### Upstash (Redis)
- **Plan**: Free tier
- **Features**:
  - Redis with serverless pricing
  - 10K requests/day limit
  - Data persistence
  - Global distribution
- **Cost**: $0/month

## Migration Paths

### Option 1: Railway (Simplified)
- **When**: Hit free tier limits or want simplified management
- **Cost**: $5/month for everything
- **Benefits**: Single platform, easier management
- **Migration**: Export data from Supabase, import to Railway PostgreSQL

### Option 2: DigitalOcean App Platform
- **When**: Need more control and predictable pricing
- **Cost**: $35-42/month minimum
- **Benefits**: More control, higher limits, managed services
- **Migration**: Docker-based deployment, managed PostgreSQL/Redis

### Option 3: Hybrid Upgrade
- **When**: Only specific services hit limits
- **Options**:
  - Upgrade Supabase to Pro ($25/month) for larger database
  - Upgrade Upstash to paid plan for more Redis requests
  - Keep Vercel for hosting

## Data Safety Considerations
- Set up automated backups for Supabase
- Regular data exports
- Environment variable management for easy provider switching
- Git-based deployment ensures code safety

## Monitoring Strategy
- Track database size usage
- Monitor Redis request counts
- Set up alerts for approaching limits
- Regular cost reviews

## Implementation Timeline
1. **Phase 1**: Deploy to Vercel + Supabase + Upstash
2. **Phase 2**: Set up monitoring and alerts
3. **Phase 3**: Implement backup procedures
4. **Phase 4**: Plan migration triggers and procedures 