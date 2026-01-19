# Unified LangGraph Architecture Migration

## Status
Accepted (Replaces 006-conversation-context-system.md)

**Note**: This decision replaces the previously planned Redis-based conversation context system (006). The unified LangGraph approach provides better memory consistency, eliminates the need for Redis, and uses existing PostgreSQL infrastructure.

## Context
The current architecture uses a pipeline pattern with separate LangGraph chains, each with its own MemorySaver instance. This creates inconsistent state across chains - each chain generates a random UUID for thread_id, so memory is not shared. Users experience context loss when switching between different conversation types (recipe-specific → general cooking → recipe-specific).

**Previous Plan**: Decision 006 proposed a Redis-based conversation context system to solve this. However, that approach would have created a dual memory system (Redis + LangGraph MemorySaver) with potential inconsistency. This decision replaces 006 with a better solution.

## Decision
We will migrate to a unified LangGraph StateGraph architecture with PostgresSaver as the single source of truth for conversation memory. This will:
- Eliminate dual memory systems
- Provide consistent memory across all conversation types
- Use existing PostgreSQL database (no Redis needed)
- Simplify architecture while maintaining extensibility
- Enable better state management and debugging

## Current Architecture Issues

1. **Separate Chains with Random Thread IDs**
   - Each chain generates a new random UUID for thread_id
   - Memory not shared between chains
   - Context lost when switching chains
   - No conversation persistence

2. **Pipeline Complexity**
   - Linear execution with conditional routing
   - State passed between steps
   - Chains have separate state management
   - Each chain is isolated

3. **No Conversation Persistence**
   - Conversations don't persist across requests
   - Each message starts fresh
   - Cannot maintain multi-turn conversations

## Target Architecture

### Unified LangGraph StateGraph

```typescript
const workflow = new StateGraph(ChatState)
  .addNode("classify", classifyTopic)
  .addNode("recipe_context", handleRecipeContext)
  .addNode("recipe_modify", modifyRecipe)
  .addNode("recipe_create", createRecipe)
  .addNode("general_cooking", handleGeneralCooking)
  .addNode("non_food", handleNonFood)
  .addConditionalEdges("classify", routeBasedOnClassification)
  // ... routing logic
  .compile({ checkpointer: postgresSaver });
```

### Single Memory System
- PostgresSaver as checkpointer (uses existing PostgreSQL)
- Persistent thread IDs: `user-{userId}-page-{pageType}`
- All nodes share same state
- Conversation history automatically managed by LangGraph
- No Redis needed (cost savings)

### Benefits
- ✅ Single source of truth (PostgreSQL via PostgresSaver)
- ✅ Consistent memory across all conversation types
- ✅ No Redis needed (cost savings, uses existing PostgreSQL)
- ✅ Better state management (all state in one graph)
- ✅ Native conversation persistence (handled by LangGraph)
- ✅ Easier debugging (all state in one place)
- ✅ Simpler architecture (one graph instead of pipeline + chains)

## Migration Strategy

### Phase 1: Preparation (Day 1)
1. Install PostgresSaver dependency
2. Set up database schema for checkpoints
3. Create unified state interface
4. Test PostgresSaver connection

### Phase 2: Build Unified Graph (Day 2-3)
1. Define ChatState interface
2. Convert existing chains to graph nodes
3. Implement routing logic
4. Test individual nodes

### Phase 3: Integration (Day 4-5)
1. Replace pipeline with unified graph
2. Update ChatService to use new graph
3. Migrate thread ID strategy
4. Test end-to-end flow

### Phase 4: Cleanup (Day 6)
1. Remove old pipeline code
2. Remove Redis dependency
3. Update documentation
4. Final testing

## Implementation Details

### Step 1: Install Dependencies

```bash
yarn add @langchain/langgraph-checkpoint-postgres
```

### Step 2: Database Schema

PostgresSaver requires a checkpoints table. Run migration:

```sql
-- PostgresSaver will create this automatically, or you can create manually:
CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT NOT NULL DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  parent_checkpoint_id TEXT,
  checkpoint JSONB NOT NULL,
  metadata JSONB,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

CREATE INDEX IF NOT EXISTS checkpoints_thread_id_idx 
ON checkpoints(thread_id);
```

### Step 3: Create Unified State

**File**: `src/app/api/chat/graph/types.ts`

```typescript
import { BaseMessage } from '@langchain/core/messages';

export interface ChatState {
  messages: BaseMessage[];
  classification?: 'context-related' | 'food-related' | 'not-food-related' | 'create-recipe' | 'modify-recipe';
  recipeContext?: any;
  recipeInProgress?: any;
  currentTopic?: string;
  metadata?: Record<string, any>;
}
```

### Step 4: Create Unified Graph

**File**: `src/app/api/chat/graph/unifiedGraph.ts`

```typescript
import { StateGraph, START, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ChatState } from './types';
import { classifyTopic } from './nodes/classify';
import { handleRecipeContext } from './nodes/recipeContext';
import { handleGeneralCooking } from './nodes/generalCooking';
import { createRecipe } from './nodes/createRecipe';
import { modifyRecipe } from './nodes/modifyRecipe';
import { handleNonFood } from './nodes/nonFood';

// Initialize PostgresSaver
const checkpointer = new PostgresSaver({
  connectionString: process.env.DATABASE_URL,
});

// Define routing function
const routeBasedOnClassification = (state: ChatState) => {
  const classification = state.classification;
  
  switch (classification) {
    case 'create-recipe':
      return 'recipe_create';
    case 'modify-recipe':
      return 'recipe_modify';
    case 'context-related':
      return 'recipe_context';
    case 'food-related':
      return 'general_cooking';
    case 'not-food-related':
      return 'non_food';
    default:
      return 'general_cooking';
  }
};

// Build graph
const workflow = new StateGraph<ChatState>({
  channels: {
    messages: {
      reducer: (x: BaseMessage[], y: BaseMessage[]) => [...x, ...y],
      default: () => [],
    },
    classification: {
      default: () => undefined,
    },
    recipeContext: {
      default: () => undefined,
    },
    recipeInProgress: {
      default: () => undefined,
    },
    // ... other channels
  },
})
  .addNode("classify", classifyTopic)
  .addNode("recipe_context", handleRecipeContext)
  .addNode("recipe_modify", modifyRecipe)
  .addNode("recipe_create", createRecipe)
  .addNode("general_cooking", handleGeneralCooking)
  .addNode("non_food", handleNonFood)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", routeBasedOnClassification)
  .addEdge("recipe_context", END)
  .addEdge("recipe_modify", END)
  .addEdge("recipe_create", END)
  .addEdge("general_cooking", END)
  .addEdge("non_food", END);

// Compile with checkpointer
export const app = workflow.compile({ checkpointer });

// Helper to get thread ID
export function getThreadId(userId: string, pageType?: string): string {
  const type = pageType || 'general';
  return `user-${userId}-page-${type}`;
}
```

### Step 5: Convert Existing Chains to Nodes

**Example**: `src/app/api/chat/graph/nodes/generalCooking.ts`

```typescript
import { ChatState } from '../types';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a sous chef..."],
  ["placeholder", "{messages}"],
]);

export async function handleGeneralCooking(state: ChatState): Promise<Partial<ChatState>> {
  const promptValue = await prompt.invoke({ messages: state.messages });
  const response = await llm.invoke(promptValue);
  
  return {
    messages: [response],
  };
}
```

### Step 6: Update ChatService

**File**: `src/app/api/chat/service.ts`

```typescript
import { app, getThreadId } from './graph/unifiedGraph';
import { HumanMessage } from '@langchain/core/messages';
import { ChatState } from './graph/types';

export class ChatService {
  async processMessage(
    message: string,
    type?: string,
    id?: string,
    userId?: string
  ): Promise<Pick<PipelineOutput, 'result' | 'metadata'>> {
    // Generate thread ID
    const threadId = getThreadId(userId || 'anonymous', type);
    
    // Get recipe context if on recipe page
    const recipeContext = type === 'recipes' && id
      ? await this.getRecipeContext(id)
      : undefined;
    
    // Prepare initial state
    const initialState: Partial<ChatState> = {
      messages: [new HumanMessage(message)],
      recipeContext,
    };
    
    // Invoke graph with persistent thread ID
    const config = {
      configurable: {
        thread_id: threadId,
      },
    };
    
    const result = await app.invoke(initialState, config);
    
    // Extract response
    const lastMessage = result.messages[result.messages.length - 1];
    const responseText = lastMessage.content as string;
    
    return {
      result: responseText,
      metadata: {
        classification: result.classification,
        recipeInProgress: result.recipeInProgress,
        // ... other metadata
      },
    };
  }
}
```

## Migration Checklist

### Preparation
- [ ] Install `@langchain/langgraph-checkpoint-postgres`
- [ ] Set up database schema for checkpoints
- [ ] Test PostgresSaver connection
- [ ] Create ChatState interface

### Graph Construction
- [ ] Create unified graph file
- [ ] Convert TopicClassificationStep to classify node
- [ ] Convert ContextualResponseStep to recipe_context node
- [ ] Convert GeneralCookingResponseStep to general_cooking node
- [ ] Convert RecipeCreationStep to recipe_create node
- [ ] Create RecipeModificationStep as recipe_modify node
- [ ] Convert NonFoodResponseStep to non_food node
- [ ] Implement routing logic
- [ ] Test each node individually

### Integration
- [ ] Update ChatService to use unified graph
- [ ] Update API route (minimal changes needed)
- [ ] Update thread ID generation
- [ ] Test end-to-end conversations
- [ ] Test context switching scenarios
- [ ] Test recipe creation/modification

### Cleanup
- [ ] Remove old pipeline code
- [ ] Remove old chain files
- [ ] Remove Redis dependency
- [ ] Remove ConversationManager (no longer needed)
- [ ] Update documentation
- [ ] Remove Redis environment variables

## Testing Strategy

### Unit Tests
- Test each node independently
- Test routing logic
- Test state transitions

### Integration Tests
- Test full conversation flow
- Test context switching
- Test recipe creation/modification
- Test thread ID persistence

### Manual Testing
- Multi-turn conversations
- Context switching (recipe → general → recipe)
- Recipe-based creation
- Recipe modification
- Navigation between pages

## Rollback Plan

If issues arise:
1. Keep old pipeline code in separate branch
2. Feature flag to switch between old/new
3. PostgresSaver checkpoints can be exported if needed
4. Can revert to pipeline architecture if critical

## Relationship to Decision 006

This decision replaces [006-conversation-context-system.md](./006-conversation-context-system.md), which proposed a Redis-based conversation context system. That approach was never implemented. This unified LangGraph approach is superior because:

1. **No dual memory systems** - Single source of truth (PostgresSaver)
2. **No Redis dependency** - Uses existing PostgreSQL
3. **Better memory consistency** - All nodes share same state
4. **Simpler architecture** - One graph instead of pipeline + Redis + chains
5. **Native LangGraph patterns** - Uses framework as intended

## Benefits After Migration

1. **Simplified Architecture**
   - Single graph instead of pipeline + multiple chains
   - Easier to understand and maintain

2. **Consistent Memory**
   - All nodes share same state
   - No context loss when switching conversation types

3. **Cost Savings**
   - No Redis needed
   - Uses existing PostgreSQL

4. **Better State Management**
   - All state in one place
   - Easier debugging
   - Native persistence

5. **Easier Extensibility**
   - Add new nodes to graph
   - Routing handled automatically
   - State automatically shared

## Potential Challenges

1. **Learning Curve**
   - LangGraph StateGraph is more complex than simple chains
   - Need to understand state management

2. **Migration Effort**
   - Significant refactoring required
   - Need to test thoroughly

3. **State Schema Changes**
   - Need to define ChatState carefully
   - Changes require migration

## Success Criteria

- [ ] All conversation scenarios work correctly
- [ ] Context persists across conversation types
- [ ] No Redis dependency
- [ ] Performance is acceptable
- [ ] Code is simpler and more maintainable
- [ ] All tests pass

## Timeline

- **Week 1**: Preparation and graph construction
- **Week 2**: Integration and testing
- **Week 3**: Cleanup and documentation

Total estimated time: 2-3 weeks for full migration with testing.
