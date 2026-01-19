# Conversation Context Implementation Guide

This guide provides step-by-step instructions for implementing the conversation context system.

## Prerequisites

- Upstash Redis account (free tier available)
- Redis REST URL and token
- Auth0 authentication working
- Existing chat pipeline functional

## Implementation Order

Follow these steps in order. Each step is designed to be completed independently.

---

## Day 1: Redis Setup & Core Service

### Step 1.1: Set Up Upstash Redis

1. **Create Upstash Account**:
   - Go to [https://upstash.com](https://upstash.com)
   - Sign up for a free account

2. **Create Separate Redis Databases for Each Environment** (Recommended):
   - **Development**: Create database named `prepwise-dev`
   - **Production**: Create database named `prepwise-prod`
   - **Staging** (optional): Create database named `prepwise-staging`
   
   **Why separate instances?**
   - Prevents data leakage between environments
   - Allows independent scaling and configuration
   - Easier debugging (no production data in dev)
   - Can use different regions for optimal performance
   - Free tier supports multiple databases

3. **Get Credentials for Each Database**:
   - For each database, copy the REST URL (e.g., `https://prepwise-dev.upstash.io`)
   - Copy the REST token for each

4. **Add Environment Variables**:
   
   **Development** (`.env.local`):
   ```bash
   UPSTASH_REDIS_REST_URL=https://prepwise-dev.upstash.io
   UPSTASH_REDIS_REST_TOKEN=dev-token-here
   ```
   
   **Production** (`.env.production` or platform environment variables like Vercel):
   ```bash
   UPSTASH_REDIS_REST_URL=https://prepwise-prod.upstash.io
   UPSTASH_REDIS_REST_TOKEN=prod-token-here
   ```
   
   **Note**: For production deployments (Vercel, Railway, etc.), set these as environment variables in your platform's dashboard, not in `.env` files.

4. **Install Dependency**:
   ```bash
   yarn add @upstash/redis
   ```

### Step 1.2: Create Redis Client

**File**: `src/lib/redis.ts`

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
```

### Step 1.3: Create ConversationManager Service

**File**: `src/services/conversationManager.ts`

Create the service with these methods:

```typescript
import { redis } from '@/lib/redis';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { logDebug, logError } from '@/utilities/logger';

export interface ConversationMessage {
  role: 'human' | 'ai';
  content: string;
  timestamp: number;
}

export interface ConversationHistory {
  messages: ConversationMessage[];
  lastActivity: number;
  threadId: string;
  pageType: string;
}

// Configuration
const MAX_MESSAGES = 15;
const NEW_CONVERSATION_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const CONVERSATION_TTL = 24 * 60 * 60 * 1000; // 24 hours

export class ConversationManager {
  static generateThreadId(userId: string, pageType: string | undefined): string {
    const type = pageType || 'general';
    return `user-${userId}-page-${type}`;
  }

  static generateRedisKey(userId: string, pageType: string | undefined): string {
    const type = pageType || 'general';
    return `conversation:${userId}:${type}`;
  }

  static async getConversationHistory(
    userId: string,
    pageType: string | undefined
  ): Promise<ConversationHistory | null> {
    // Implementation: Get from Redis, check time gap, return history
  }

  static async saveConversationHistory(
    userId: string,
    pageType: string | undefined,
    threadId: string,
    messages: ConversationMessage[]
  ): Promise<void> {
    // Implementation: Save to Redis with TTL
  }

  static convertToLangChainMessages(
    history: ConversationHistory | null
  ): BaseMessage[] {
    // Implementation: Convert DB format to LangChain messages
  }

  static shouldStartNewConversation(
    history: ConversationHistory | null
  ): boolean {
    // Implementation: Check if time gap > threshold
  }

  static async clearConversation(
    userId: string,
    pageType: string | undefined
  ): Promise<void> {
    // Implementation: Delete conversation from Redis
  }
}
```

**Implementation Details**:

1. `getConversationHistory`:
   - Generate Redis key: `generateRedisKey(userId, pageType)`
   - Get from Redis: `await redis.get<ConversationHistory>(key)`
   - If null, return null (new conversation)
   - Check `lastActivity` vs current time
   - If gap > 30 minutes, delete key and return null (new conversation)
   - Return formatted history

2. `saveConversationHistory`:
   - Limit messages to last `MAX_MESSAGES`
   - Generate Redis key: `generateRedisKey(userId, pageType)`
   - Create history object: `{ messages, lastActivity: Date.now(), threadId, pageType, recipeContext?, recipeInProgress? }`
   - Save with TTL: `await redis.setex(key, CONVERSATION_TTL / 1000, history)`
   - TTL is in seconds, so divide milliseconds by 1000

3. `convertToLangChainMessages`:
   - Map `ConversationMessage[]` to `BaseMessage[]`
   - Use `HumanMessage` for 'human' role
   - Use `AIMessage` for 'ai' role
   - **Include recipe context as system message** if present

4. `shouldStartNewConversation`:
   - Return `true` if history is null
   - Return `true` if `Date.now() - history.lastActivity > NEW_CONVERSATION_THRESHOLD`
   - Otherwise return `false`

5. `clearConversation`:
   - Generate Redis key: `generateRedisKey(userId, pageType)`
   - Delete: `await redis.del(key)`

6. `addRecipeContext`:
   - Get current conversation history
   - Add recipe summary to conversation messages (as system message)
   - Store recipe data in history.recipeContext
   - Save updated history

7. `getRecipeContext`:
   - Get conversation history
   - Return history.recipeContext if exists

8. `addRecipeInProgress`:
   - Get current conversation history
   - Store recipe data in history.recipeInProgress
   - Save updated history

9. `getRecipeInProgress`:
   - Get conversation history
   - Return history.recipeInProgress if exists

---

## Day 2: Update Backend Services

### Step 2.1: Update ChatService

**File**: `src/app/api/chat/service.ts`

Modify `processMessage` method signature:
```typescript
async processMessage(
  message: string,
  type?: string,
  id?: string,
  userId?: string,
  messageHistory?: ConversationMessage[]
): Promise<Pick<PipelineOutput, 'result' | 'metadata'>>
```

Add conversation management logic:
1. Generate thread ID: `ConversationManager.generateThreadId(userId, type)`
2. Get existing history: `ConversationManager.getConversationHistory(userId, type)`
3. Check if new conversation: `ConversationManager.shouldStartNewConversation(history)`
4. If new conversation, clear old one
5. Merge frontend messages with stored history
6. **Get recipe context** (if on recipe page): `ConversationManager.getRecipeContext(userId, type)`
7. **Get recipe-in-progress** (if creating/modifying): `ConversationManager.getRecipeInProgress(userId, type)`
8. **Include recipe context in conversation** if available
9. Convert to LangChain messages
10. Pass thread ID, history, recipe context, and recipe-in-progress to pipeline
11. After pipeline execution:
    - Save updated conversation
    - **Store recipe context** if recipe data in response metadata
    - **Store recipe-in-progress** if recipe creation/modification in progress

### Step 2.2: Update API Route

**File**: `src/app/api/chat/route.ts`

1. Import Auth0 utilities:
```typescript
import { auth0 } from '@/lib/auth0';
import { getOrCreateUserFromAuth0 } from '@/utilities/userSync';
import { ConversationMessage } from '@/services/conversationManager';
```

2. In POST handler:
   - Get session: `await auth0.getSession(request)`
   - Get DB user: `await getOrCreateUserFromAuth0(session.user)`
   - Extract `messageHistory` from request body
   - Pass `userId` and `messageHistory` to ChatService

### Step 2.3: Update Pipeline Types

**File**: `src/app/api/chat/pipeline/types.ts`

Add to `PipelineInput`:
```typescript
threadId?: string;
conversationHistory?: BaseMessage[];
recipeContext?: any; // Current recipe data if on recipe page
recipeInProgress?: any; // Recipe being created/modified
```

Add to `PipelineOutput`:
```typescript
threadId?: string;
recipeInProgress?: any; // Updated recipe-in-progress state
```

---

## Day 3: Update LangGraph Chains

### Step 3.1: Update runContextSpecificChain

**File**: `src/app/api/chat/chains/runContextSpecificChain.ts`

1. Modify function signature:
```typescript
export async function runContextSpecificChain(
  message: string,
  context: any,
  threadId: string,
  existingMessages?: BaseMessage[]
)
```

2. Update config to use provided threadId (CRITICAL - must be persistent):
```typescript
const config = { configurable: { thread_id: threadId } };
```

3. **Include recipe context in conversation messages** (not just system prompt):
```typescript
// Add recipe context as system message if available
const messagesWithContext = context
  ? [new SystemMessage(`Current recipe context: ${JSON.stringify(context)}`), ...existingMessages]
  : existingMessages || [];
```

4. If `existingMessages` provided, include them in initial state:
```typescript
const initialState = messagesWithContext.length > 0
  ? { messages: messagesWithContext }
  : { messages: [] };
```

5. Invoke with initial state:
```typescript
return await app.invoke(initialState, config);
```

**Important**: Recipe context must be in conversation messages, not just system prompt variable, so it persists in conversation history.

### Step 3.2: Update runGeneralCookingChain

**File**: `src/app/api/chat/chains/runGeneralCookingChain.ts`

Apply same changes as Step 3.1.

### Step 3.3: Update runTopicClassifierChain

**File**: `src/app/api/chat/chains/runTopicClassifierChain.ts`

Apply same changes as Step 3.1 (if it uses LangGraph).

### Step 3.4: Update Pipeline Steps

**Files**: All step files in `src/app/api/chat/pipeline/steps/`

Update each step to:
1. Accept `threadId`, `conversationHistory`, `recipeContext`, and `recipeInProgress` from input
2. Pass them to chain functions
3. Return `threadId` and updated `recipeInProgress` in output

**ContextualResponseStep**:
```typescript
async execute(input: PipelineInput): Promise<PipelineOutput> {
  const response = await runContextSpecificChain(
    input.message,
    input.context || input.recipeContext,
    input.threadId || 'default-thread',
    input.conversationHistory
  );
  // ... rest of implementation
}
```

**RecipeCreationStep** (CRITICAL ENHANCEMENT):
```typescript
async execute(input: PipelineInput): Promise<PipelineOutput> {
  // Include conversation history in messages
  const messages = [
    new SystemMessage(systemMessage),
    ...(input.conversationHistory || []), // Include conversation history
    ...(input.recipeContext ? [new SystemMessage(`Base recipe: ${JSON.stringify(input.recipeContext)}`)] : []),
    ...(input.recipeInProgress ? [new SystemMessage(`Recipe in progress: ${JSON.stringify(input.recipeInProgress)}`)] : []),
    new HumanMessage(input.message)
  ];
  
  // ... rest of implementation
  
  // Store recipe-in-progress in output
  return {
    ...output,
    recipeInProgress: recipeData
  };
}
```

**RecipeModificationStep** (NEW - to be created):
```typescript
async execute(input: PipelineInput): Promise<PipelineOutput> {
  // Recipe context is REQUIRED for modification
  if (!input.recipeContext) {
    return { ...input, result: "I need to know which recipe you want to modify.", error: "No recipe context" };
  }
  
  // Include conversation history and recipe context
  const messages = [
    new SystemMessage(`Modify this recipe: ${JSON.stringify(input.recipeContext)}`),
    ...(input.conversationHistory || []),
    new HumanMessage(input.message)
  ];
  
  // ... implementation to modify recipe
  
  // Store modified recipe as recipe-in-progress
  return {
    ...output,
    recipeInProgress: modifiedRecipeData
  };
}
```

---

## Day 4: Create RecipeModificationStep

### Step 4.1: Create RecipeModificationStep

**File**: `src/app/api/chat/pipeline/steps/RecipeModificationStep.ts` (new)

Create new step similar to RecipeCreationStep but:
- Requires recipe context (from input.recipeContext)
- Incorporates conversation history
- Modifies existing recipe based on user request
- Returns modified recipe JSON
- Stores as recipe-in-progress

### Step 4.2: Add RecipeModificationStep to Pipeline

**File**: `src/app/api/chat/pipeline/ChatPipelineFactory.ts`

Add RecipeModificationStep to pipeline when recipe context is available:
```typescript
if (hasContext) {
  steps.push(
    new RecipeModificationStep(), // Add before RecipeCreationStep
    new RecipeCreationStep(),
    // ... rest
  );
}
```

## Day 5: Update Frontend & Testing

### Step 5.1: Update ChatContainer

**File**: `src/components/chat/ChatContainer.tsx`

1. Modify `handleSendMessage` to include message history:
```typescript
const messageHistory = messages.slice(-15).map(msg => ({
  role: msg.role === MessageRole.USER ? 'human' as const : 'ai' as const,
  content: msg.content,
  timestamp: Date.now() // or use actual timestamp if available
}));

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message, 
    type, 
    id,
    messageHistory 
  }),
});
```

2. Ensure messages are properly formatted before sending.

### Step 5.2: Testing

**Manual Testing Checklist**:

1. **Basic Conversation**:
   - [ ] Send multiple messages in sequence
   - [ ] Verify AI remembers previous messages
   - [ ] Check Redis for stored conversation (use Upstash console)

2. **Page Context**:
   - [ ] Start conversation on recipes page
   - [ ] Navigate to different recipe
   - [ ] Verify same conversation continues
   - [ ] Navigate to dashboard
   - [ ] Verify new conversation starts

3. **Time-Based Detection**:
   - [ ] Start conversation
   - [ ] Wait 31 minutes (or modify threshold for testing)
   - [ ] Send new message
   - [ ] Verify new conversation starts

4. **Message Limit**:
   - [ ] Send 20+ messages
   - [ ] Verify only last 15 are stored
   - [ ] Check token usage

5. **Error Handling**:
   - [ ] Test with invalid userId
   - [ ] Test with Redis connection issues
   - [ ] Verify graceful degradation (conversation continues without history)

### Step 5.3: Cleanup (Automatic)

Redis TTL automatically handles cleanup - no additional job needed. Conversations expire after 24 hours based on the TTL set when saving.

**Note**: If you need to manually clear conversations, you can use the Upstash console or add a utility function:
```typescript
// Optional: Manual cleanup utility
export async function clearAllConversations() {
  // This would require scanning keys, which is expensive
  // Better to let TTL handle it automatically
}
```

---

## Troubleshooting

### Issue: Conversations not persisting
- Check Redis connection (verify UPSTASH_REDIS_REST_URL and token)
- Check Redis key format matches in get/set operations
- Verify TTL is being set correctly
- Check conversation is being saved in ChatService
- Use Upstash console to inspect stored data

### Issue: Thread ID mismatch
- Verify thread ID generation logic
- Check userId is being passed correctly
- Ensure pageType is consistent

### Issue: Too many tokens
- Reduce MAX_MESSAGES constant
- Check message content length
- Verify trimming is working

### Issue: New conversation not starting
- Check time threshold logic
- Verify lastActivity is being updated in Redis
- Check shouldStartNewConversation logic
- Verify Redis TTL hasn't expired (check in Upstash console)

### Issue: Redis connection errors
- Verify environment variables are set correctly
- Check Upstash dashboard for rate limits (free tier: 10K requests/day)
- Ensure REST URL and token are correct
- Check network connectivity to Upstash

---

## Configuration Tuning

After implementation, you can tune these constants in `ConversationManager`:

- `MAX_MESSAGES`: Increase for longer context, decrease for cost savings
- `NEW_CONVERSATION_THRESHOLD`: Adjust based on user behavior
- `CONVERSATION_TTL`: Adjust based on storage needs (affects Redis TTL)

**Upstash Free Tier Limits**:
- 10,000 requests per day
- 256 MB storage
- Consider upgrading if you exceed these limits

---

## Next Steps After Implementation

1. Monitor token usage
2. Collect user feedback
3. Consider adding summarization for very long conversations
4. Add analytics for conversation length and patterns
5. Consider persistent storage option for power users
