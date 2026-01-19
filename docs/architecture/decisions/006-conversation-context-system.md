# Conversation Context System Architecture

## Status
Superseded by [007-unified-langgraph-migration.md](./007-unified-langgraph-migration.md)

**Note**: This decision was never implemented. It has been replaced by the unified LangGraph architecture which provides better memory consistency and eliminates the need for Redis.

## Context
The chat system currently creates a new conversation thread for every message, preventing the AI from maintaining context across multiple messages. Users cannot have coherent, multi-turn conversations about the same topic. The pipeline pattern is stateless and doesn't preserve conversation history.

### Use Cases to Support
The system must handle these conversation scenarios:
1. **Non-recipe food questions on recipe pages** - User asks general food questions while viewing a recipe
2. **Context switching** - User asks about recipe, then unrelated food question, then returns to recipe
3. **Recipe-based creation** - User asks recipe questions, then creates new recipe based on current recipe + conversation
4. **Recipe modification** - User modifies current recipe via chat (e.g., "make this vegan")
5. **Iterative recipe creation** - User creates recipe with questions, modifications, and refinements
6. **Cross-recipe references** - User compares or references other recipes
7. **Navigation persistence** - User navigates between recipes and maintains conversation context
8. **Ingredient substitution chains** - Multi-turn conversations about substitutions
9. **Recipe creation with clarification** - AI asks clarifying questions during recipe creation

## Decision
We will implement a session-based conversation context system using Redis (Upstash) to store conversation history. This system will:
- Maintain conversation threads per user per page context
- Store up to 15 messages per conversation (configurable)
- Automatically detect new conversations based on time gaps (>30 minutes)
- Use persistent thread IDs with LangGraph's MemorySaver
- Be cost-optimized by limiting message history
- Leverage Redis TTL for automatic cleanup (24 hours)

## Architecture Overview

### Thread ID Strategy
- Format: `user-{userId}-page-{pageType}`
- Same page type = same thread (e.g., all recipe pages share one thread)
- Example: `user-123-page-recipes` vs `user-123-page-dashboard`

### Storage Strategy
- Redis (Upstash) for session-based storage
- Key format: `conversation:{userId}:{pageType}`
- Value: JSON object with threadId, messages array, lastActivity timestamp
- Automatic cleanup via Redis TTL (24 hours)
- Fast read/write operations for conversation history
- **Note**: Regular Redis is chosen over Vector DB for MVP simplicity. Vector DB (Upstash Vector Database) could be added later for semantic search capabilities (see Future Enhancements).

### History Management
- Sliding window: Last 10-15 messages (configurable)
- Frontend sends recent messages; backend maintains full thread
- LangGraph MemorySaver uses persistent thread IDs

### New Conversation Detection
- Time-based: Gap > 30 minutes = new conversation
- Context switch: Different page type = new thread (automatic)

## Implementation Steps

### Step 1: Set Up Redis (Upstash)
1. Create a free account at [Upstash](https://upstash.com)

2. **Create separate Redis databases for each environment** (recommended):
   - `prepwise-dev` - Development environment
   - `prepwise-staging` - Staging environment (optional)
   - `prepwise-prod` - Production environment
   
   **Why separate instances?**
   - Prevents data leakage between environments
   - Allows independent scaling and configuration
   - Easier debugging and monitoring
   - Can use different regions for performance
   - Free tier allows multiple databases

3. For each database, copy the REST URL and token

4. Add to `.env` files:
   - **`.env.local`** (development):
   ```bash
   UPSTASH_REDIS_REST_URL=https://prepwise-dev.upstash.io
   UPSTASH_REDIS_REST_TOKEN=dev-token-here
   ```
   
   - **`.env.production`** (production):
   ```bash
   UPSTASH_REDIS_REST_URL=https://prepwise-prod.upstash.io
   UPSTASH_REDIS_REST_TOKEN=prod-token-here
   ```

5. Install dependency:
```bash
yarn add @upstash/redis
```

### Step 2: Create Redis Client
**File**: `src/lib/redis.ts`

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
```

### Step 3: ConversationManager Service
**File**: `src/services/conversationManager.ts`

Create service to manage conversation storage and retrieval:
- `generateThreadId(userId, pageType)` - Creates thread ID
- `generateRedisKey(userId, pageType)` - Creates Redis key
- `getConversationHistory(userId, pageType)` - Retrieves from Redis
- `saveConversationHistory(userId, pageType, messages, threadId)` - Saves to Redis with TTL
- `addMessage(userId, pageType, role, content)` - Adds message to history
- `convertToLangChainMessages(history)` - Converts Redis format to LangChain format
- `shouldStartNewConversation(history)` - Checks time gap
- `clearConversation(userId, pageType)` - Clears conversation from Redis
- `addRecipeContext(userId, pageType, recipeData)` - Stores recipe context in conversation
- `getRecipeContext(userId, pageType)` - Retrieves recipe context from conversation
- `addRecipeInProgress(userId, pageType, recipeData)` - Stores recipe being created/modified
- `getRecipeInProgress(userId, pageType)` - Retrieves recipe in progress

**Key Configuration**:
- `MAX_MESSAGES = 15` (configurable)
- `NEW_CONVERSATION_THRESHOLD = 30 * 60 * 1000` (30 minutes)
- `CONVERSATION_TTL = 24 * 60 * 60 * 1000` (24 hours)

### Step 4: Update ChatService
**File**: `src/app/api/chat/service.ts`

Modify `processMessage` to:
1. Accept `userId` and `messageHistory` parameters
2. Generate thread ID using `ConversationManager.generateThreadId()`
3. Retrieve existing conversation history from Redis
4. Check if new conversation needed (time gap)
5. Merge frontend messages with stored history
6. **Include recipe context in conversation history** (if on recipe page)
7. **Include recipe-in-progress** (if creating/modifying recipe)
8. Pass thread ID, history, and context to pipeline
9. Save updated conversation after processing
10. **Store recipe context** in conversation if recipe data is in response

### Step 5: Update API Route
**File**: `src/app/api/chat/route.ts`

Modify POST handler to:
1. Extract user from Auth0 session
2. Get database user via `getOrCreateUserFromAuth0()`
3. Accept `messageHistory` from request body
4. Pass `userId` and `messageHistory` to ChatService

### Step 6: Update LangGraph Chains
**Files**: 
- `src/app/api/chat/chains/runContextSpecificChain.ts`
- `src/app/api/chat/chains/runGeneralCookingChain.ts`
- `src/app/api/chat/chains/runTopicClassifierChain.ts`

Modify chains to:
1. Accept `threadId` parameter (instead of generating random UUID)
2. **Accept `conversationHistory` parameter** (from Redis)
3. Use persistent thread ID in LangGraph config
4. **Initialize with existing messages** from conversation history
5. Pass conversation history to prompt

**Key Changes**:
```typescript
// Before:
const config = { configurable: { thread_id: uuidv4() } };
return await app.invoke({ messages: [new HumanMessage(message)] }, config);

// After:
const config = { configurable: { thread_id: threadId } };
const initialState = existingMessages && existingMessages.length > 0
  ? { messages: existingMessages }
  : { messages: [] };
return await app.invoke(initialState, config);
```

**Critical**: All chains must use the same thread ID to share conversation memory.

### Step 7: Update Pipeline Steps
**Files**: Pipeline step files in `src/app/api/chat/pipeline/steps/`

Update steps to:
1. Accept and pass through `threadId` and `conversationHistory`
2. Initialize chains with existing history if available
3. Return updated conversation state

**Special Requirements**:

**RecipeCreationStep**:
- Accept `conversationHistory` and `recipeContext` from input
- Include conversation history in LLM messages
- Include recipe context if available (for "based on" scenarios)
- Store recipe-in-progress in conversation context
- Support clarifying questions for missing information

**RecipeModificationStep** (NEW - to be created):
- Accept `conversationHistory` and `recipeContext` (required)
- Modify recipe based on conversation history
- Return modified recipe JSON
- Store recipe-in-progress in conversation context

**ContextualResponseStep**:
- Include recipe context in conversation messages (not just system prompt)
- Ensure recipe context persists in conversation history

### Step 8: Update Frontend
**File**: `src/components/chat/ChatContainer.tsx`

Modify `handleSendMessage` to:
1. Send `messageHistory` array in request body
2. Include recent messages (last 10-15) from local state
3. Format: `[{ role: 'user' | 'assistant', content: string }]`

### Step 9: Cleanup (Automatic)
Redis TTL automatically handles cleanup - no additional job needed. Conversations expire after 24 hours.

## Data Flow

```
1. User sends message
   ↓
2. Frontend sends: { message, type, id, messageHistory[] }
   ↓
3. API Route extracts userId from Auth0 session
   ↓
4. ChatService:
   - Generates threadId: user-{userId}-page-{type}
   - Retrieves conversation from Redis
   - Checks if new conversation needed (time gap)
   - Merges frontend messages with stored history
   ↓
5. Pipeline executes with threadId and history
   ↓
6. LangGraph chains use persistent threadId
   ↓
7. Response generated with full context
   ↓
8. ChatService saves updated conversation to Redis (with TTL)
   ↓
9. Response returned to frontend
```

## Configuration

### Environment Variables
**Important**: Use separate Redis instances for each environment.

Add to environment-specific `.env` files:

**Development** (`.env.local`):
```bash
UPSTASH_REDIS_REST_URL=https://prepwise-dev.upstash.io
UPSTASH_REDIS_REST_TOKEN=dev-token-here
```

**Production** (`.env.production` or platform environment variables):
```bash
UPSTASH_REDIS_REST_URL=https://prepwise-prod.upstash.io
UPSTASH_REDIS_REST_TOKEN=prod-token-here
```

**Benefits of separate instances:**
- Data isolation between environments
- Independent scaling and monitoring
- Can use different regions for performance
- Easier debugging (no production data in dev)
- Free tier supports multiple databases

### Constants (in ConversationManager)
```typescript
const MAX_MESSAGES = 15; // Maximum messages per conversation
const NEW_CONVERSATION_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const CONVERSATION_TTL = 24 * 60 * 60 * 1000; // 24 hours
```

## Cost Optimization

- **Token Budget**: ~2-4K tokens per request (10-15 messages)
- **Model**: gpt-4o-mini (already in use)
- **Estimated Cost**: ~$0.01-0.02 per conversation turn
- **History Limit**: 15 messages prevents token bloat

## Testing Strategy

1. **Unit Tests**:
   - ConversationManager methods
   - Thread ID generation
   - Time-based conversation detection

2. **Integration Tests**:
   - Full conversation flow
   - Message persistence
   - Thread ID consistency

3. **Manual Testing**:
   - Multi-turn conversations
   - Page navigation (context switching)
   - Time-based new conversation detection

## Migration Notes

- Existing conversations: None (fresh start)
- Backward compatibility: API accepts optional `messageHistory`
- No breaking changes to existing endpoints

## Architectural Enhancements for Use Cases

### Enhancement 1: Recipe Context in Conversation History
**Problem**: Recipe context only in system prompt, not in conversation messages
**Solution**: Include recipe summary in conversation messages when recipe context is active
**Impact**: Enables recipe-based creation and modification scenarios

### Enhancement 2: Unified Thread IDs Across Chains
**Problem**: Different chains use separate thread IDs, memory not shared
**Solution**: All chains use same persistent thread ID from Redis
**Impact**: Enables context switching and topic return scenarios

### Enhancement 3: Recipe Modification Step
**Problem**: No capability to modify existing recipes via chat
**Solution**: Implement `RecipeModificationStep` that accepts recipe context and conversation history
**Impact**: Enables recipe modification use case

### Enhancement 4: Recipe-in-Progress State
**Problem**: No way to track recipe being created/modified across turns
**Solution**: Store recipe-in-progress in conversation context
**Impact**: Enables iterative recipe creation and refinement

### Enhancement 5: Enhanced RecipeCreationStep
**Problem**: RecipeCreationStep doesn't have conversation history or recipe context
**Solution**: 
- Accept conversation history from pipeline
- Accept recipe context for "based on" scenarios
- Support clarifying questions
- Store recipe-in-progress
**Impact**: Enables recipe-based creation and iterative refinement

### Enhancement 6: Cross-Recipe Access (Future)
**Problem**: Cannot reference other recipes in conversation
**Solution**: Add capability to load other recipes when referenced
**Impact**: Enables cross-recipe comparison scenarios

## Future Enhancements

1. **Summarization**: Compress old messages into summaries
2. **Semantic Search**: Find relevant past conversations
   - **Vector Database Option**: Consider Upstash Vector Database for semantic search across conversation history
   - Use case: "Find my past conversations about Italian recipes"
   - Would enable similarity matching and cross-conversation context
   - Hybrid approach: Keep regular Redis for current conversation storage, add Vector DB for semantic search
   - Requires embeddings generation (additional API calls/cost)
3. **Cross-Page Context**: Option to maintain context across pages
4. **Persistent Storage**: Option to save conversations across browser sessions
5. **Conversation Export**: Allow users to export conversation history
6. **Cross-Recipe References**: Access to user's other recipes for comparisons
7. **Recipe Recommendations**: Suggest recipes based on conversation context

## Dependencies

- Existing: LangGraph
- New: `@upstash/redis` package
- Infrastructure: Upstash Redis (free tier available)

## Rollback Plan

If issues arise:
1. Remove Redis environment variables
2. Remove ConversationManager usage
3. Chains revert to random UUIDs
4. Frontend stops sending messageHistory
5. Redis data will auto-expire after 24 hours

## Success Criteria

### Core Functionality
- [ ] Users can have multi-turn conversations
- [ ] Context persists within same page type
- [ ] New conversations start after 30-minute gap
- [ ] Token usage stays within budget (~2-4K per request)
- [ ] No performance degradation
- [ ] Conversations clean up after 24 hours

### Use Case Coverage
- [ ] Non-recipe food questions on recipe pages work correctly
- [ ] Context switching (recipe → general → recipe) maintains context
- [ ] Recipe-based creation incorporates conversation history and recipe context
- [ ] Recipe modification works with conversation history
- [ ] Iterative recipe creation maintains recipe-in-progress state
- [ ] Navigation between recipes maintains appropriate context
- [ ] Ingredient substitution chains work across multiple turns
- [ ] Recipe creation with clarifying questions works
