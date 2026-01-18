# Conversation Context System Architecture

## Status
Accepted

## Context
The chat system currently creates a new conversation thread for every message, preventing the AI from maintaining context across multiple messages. Users cannot have coherent, multi-turn conversations about the same topic. The pipeline pattern is stateless and doesn't preserve conversation history.

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
2. Create a new Redis database
3. Copy the REST URL and token
4. Add to `.env`:
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
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

**Key Configuration**:
- `MAX_MESSAGES = 15` (configurable)
- `NEW_CONVERSATION_THRESHOLD = 30 * 60 * 1000` (30 minutes)
- `CONVERSATION_TTL = 24 * 60 * 60 * 1000` (24 hours)

### Step 4: Update ChatService
**File**: `src/app/api/chat/service.ts`

Modify `processMessage` to:
1. Accept `userId` and `messageHistory` parameters
2. Generate thread ID using `ConversationManager.generateThreadId()`
3. Retrieve existing conversation history from DB
4. Check if new conversation needed (time gap)
5. Merge frontend messages with stored history
6. Pass thread ID and history to pipeline
7. Save updated conversation after processing

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
2. Use persistent thread ID in LangGraph config
3. Load existing messages from MemorySaver if available
4. Pass conversation history to prompt

**Key Change**:
```typescript
// Before:
const config = { configurable: { thread_id: uuidv4() } };

// After:
const config = { configurable: { thread_id: threadId } };
```

### Step 7: Update Pipeline Steps
**Files**: Pipeline step files in `src/app/api/chat/pipeline/steps/`

Update steps to:
1. Accept and pass through `threadId` and `conversationHistory`
2. Initialize chains with existing history if available
3. Return updated conversation state

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
Add to `.env`:
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

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

- [ ] Users can have multi-turn conversations
- [ ] Context persists within same page type
- [ ] New conversations start after 30-minute gap
- [ ] Token usage stays within budget (~2-4K per request)
- [ ] No performance degradation
- [ ] Conversations clean up after 24 hours
