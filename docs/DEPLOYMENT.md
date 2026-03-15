# Deployment Guide

## Platform

PrepWise is deployed on **Render**. Vercel was evaluated but had issues with database connectivity and running migrations at build time.

## Development

```bash
docker-compose up -d  # starts PostgreSQL locally
yarn dev              # starts Next.js dev server
```

## Production Deployment (Render)

### Web Service Setup

1. Connect your GitHub repo in the Render dashboard
2. Set the following:
   - **Environment**: Node
   - **Build command**: `yarn install && yarn prisma generate && yarn build`
   - **Start command**: `yarn start`

### Database

Render provides a managed PostgreSQL service. After creating one:

1. Copy the **Internal Database URL** from the Render database dashboard
2. Set it as `DATABASE_URL` in your web service's environment variables
3. Run migrations — either via a pre-deploy command in Render or manually:
   ```bash
   npx prisma migrate deploy
   ```

### Environment Variables

Set these in the Render web service dashboard:

```bash
# Database
DATABASE_URL=postgresql://[render-internal-db-url]

# Auth0
AUTH0_SECRET=[long-random-secret]
AUTH0_BASE_URL=https://[your-render-app-url]
AUTH0_ISSUER_BASE_URL=https://[your-auth0-domain]
AUTH0_CLIENT_ID=[your-client-id]
AUTH0_CLIENT_SECRET=[your-client-secret]

# OpenAI
OPENAI_API_KEY=[your-key]

# Logging (optional)
LOG_LEVEL=info
```

> Note: `AUTH0_BASE_URL` must match the public URL of your Render web service exactly, and must also be added to the **Allowed Callback URLs** and **Allowed Logout URLs** in your Auth0 application settings.

## Troubleshooting

### Build failures
- Check that all environment variables are set before deploying
- Prisma generate must run before the Next.js build — confirm it's in the build command

### Database connection errors
- Use the **Internal** database URL (not external) when the web service and database are both on Render
- Check that `DATABASE_URL` is set correctly in the web service environment

### Auth0 redirect errors
- Verify `AUTH0_BASE_URL` matches the exact public URL Render assigned your service
- Check Auth0 dashboard: Application > Settings > Allowed Callback URLs should include `[your-url]/api/auth/callback`
