# PrepWise — Claude Code Context

A recipe management app with an AI chat assistant. Users can manage recipes, and the chat system uses a LangChain pipeline to answer cooking questions, create recipes from natural language, and modify existing recipes.

## Commands

```bash
yarn dev          # start dev server (Next.js 15)
yarn test         # run Jest tests
yarn test:watch   # test watch mode
yarn build        # production build
docker-compose up -d  # start local dev with Docker (PostgreSQL)
npx prisma db push    # push schema changes
npx prisma studio     # browse database
```

## Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Auth**: Auth0 via `@auth0/nextjs-auth0`
- **Database**: PostgreSQL via Prisma ORM
- **AI**: LangChain + LangGraph + OpenAI (structured outputs for recipe parsing)
- **Styling**: Tailwind CSS v4 + `class-variance-authority`
- **Logging**: Winston + Logtail
- **Testing**: Jest + Testing Library

## Key Directories

```
src/
  app/
    api/
      chat/
        pipeline/       # ChatPipeline, BaseStep, step implementations
          steps/        # TopicClassification, ContextualResponse, GeneralCooking,
                        # NonFoodResponse, RecipeCreation
        chains/         # legacy chain runners (runTopicClassifierChain, etc.)
        route.ts        # POST /api/chat
        service.ts      # chat service layer
      recipes/          # CRUD API routes
      auth/             # /api/auth/me
      users/            # /api/users
  components/
    chat/               # chat UI components
    ui/                 # design system primitives (Button, etc.)
  services/
    recipeService.ts    # recipe CRUD business logic
  lib/
    auth0.ts            # Auth0 client setup
    db.ts               # Prisma client singleton
  utilities/
    getCurrentUser.ts   # extracts authenticated user from request
    userSync.ts         # syncs Auth0 user into local DB on login
    logger.ts           # Winston logger
  middleware.ts         # route protection (Auth0 session check)
  types/                # shared TypeScript types and DTOs
prisma/                 # schema.prisma + migrations
docs/                   # architecture docs, ADRs, requirements
```

## AI Pipeline Pattern

All chat requests flow through `ChatPipeline`. To add a new capability, create a new step:

1. Create `src/app/api/chat/pipeline/steps/MyNewStep.ts` extending `BaseStep`
2. Implement `canExecute(state)` — return true when this step should run
3. Implement `execute(state)` — return updated state
4. Register it in `ChatPipelineFactory.ts`

Steps are checked in order; the first step where `canExecute` returns true handles the request. See `RecipeCreationStep.ts` as a reference.

## Auth Pattern

- Auth0 handles login/logout/session
- `getCurrentUser(req)` in `src/utilities/getCurrentUser.ts` returns the local DB user from the session token — use this in API routes
- `middleware.ts` protects routes at the edge
- User is synced to local DB on first login via `userSync.ts`

## What's Built

- Recipe CRUD with user ownership
- Auth0 authentication with role-based access
- AI chat pipeline (topic classification → contextual/general/non-food routing)
- AI recipe creation from natural language (`RecipeCreationStep`)

## Actively In Progress

- Recipe modification via chat (save modified recipe as new; ADR 005)
- Recipe parsing from URLs/pasted text
- UI for recipe preview before saving

## Testing

Tests live alongside source in `__tests__/` directories. Run `yarn test` before committing. The pipeline has unit tests in `src/app/api/chat/pipeline/__tests__/`.
