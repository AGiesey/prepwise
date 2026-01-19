# Unified LangGraph Migration Implementation Guide

This guide provides step-by-step instructions for migrating from the current pipeline architecture to a unified LangGraph StateGraph with PostgresSaver.

## Prerequisites

- PostgreSQL database running
- Existing chat system functional
- Understanding of LangGraph StateGraph concepts

## Migration Phases

---

## Phase 1: Preparation (Day 1)

### Step 1.1: Install Dependencies

```bash
yarn add @langchain/langgraph-checkpoint-postgres
```

### Step 1.2: Set Up Database Schema

PostgresSaver will automatically create the checkpoints table, but you can also create it manually:

**File**: `prisma/migrations/[timestamp]_add_langgraph_checkpoints/migration.sql`

```sql
-- Create checkpoints table for LangGraph PostgresSaver
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

CREATE INDEX IF NOT EXISTS checkpoints_parent_checkpoint_id_idx 
ON checkpoints(parent_checkpoint_id);
```

Or let PostgresSaver create it automatically on first use.

### Step 1.3: Test PostgresSaver Connection

**File**: `src/app/api/chat/graph/test-checkpointer.ts` (temporary test file)

```typescript
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

async function testCheckpointer() {
  const checkpointer = new PostgresSaver({
    connectionString: process.env.DATABASE_URL,
  });
  
  // Test connection
  try {
    await checkpointer.setup();
    console.log('✅ PostgresSaver connection successful');
  } catch (error) {
    console.error('❌ PostgresSaver connection failed:', error);
    throw error;
  }
}

testCheckpointer();
```

Run: `ts-node src/app/api/chat/graph/test-checkpointer.ts`

---

## Phase 2: Build Unified Graph (Day 2-3)

### Step 2.1: Define ChatState Interface

**File**: `src/app/api/chat/graph/types.ts`

```typescript
import { BaseMessage } from '@langchain/core/messages';
import { TopicClassification } from '../../chains/runTopicClassifierChain';
import { CreateRecipeDTO } from '@/types/dtos';

export interface ChatState {
  // Messages in conversation
  messages: BaseMessage[];
  
  // Classification result
  classification?: TopicClassification | 'modify-recipe';
  
  // Recipe context (if on recipe page)
  recipeContext?: any;
  
  // Recipe being created/modified
  recipeInProgress?: CreateRecipeDTO;
  
  // Current conversation topic
  currentTopic?: string;
  
  // Additional metadata
  metadata?: {
    hasContext?: boolean;
    contextType?: string;
    contextId?: string;
    [key: string]: any;
  };
}
```

### Step 2.2: Create Graph Configuration

**File**: `src/app/api/chat/graph/config.ts`

```typescript
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

export const checkpointer = new PostgresSaver({
  connectionString: process.env.DATABASE_URL,
});

export function getThreadId(userId: string, pageType?: string): string {
  const type = pageType || 'general';
  return `user-${userId}-page-${type}`;
}
```

### Step 2.3: Convert Classification to Node

**File**: `src/app/api/chat/graph/nodes/classify.ts`

```typescript
import { ChatState } from '../types';
import { runTopicClassifierChain } from '../../chains/runTopicClassifierChain';

export async function classifyTopic(state: ChatState): Promise<Partial<ChatState>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const messageContent = lastMessage.content as string;
  
  // Get recipe context if available
  const contextualItems = state.recipeContext
    ? [JSON.stringify(state.recipeContext)]
    : undefined;
  
  // Classify topic
  const classification = await runTopicClassifierChain(messageContent, contextualItems);
  
  return {
    classification,
  };
}
```

### Step 2.4: Convert Recipe Context Handler to Node

**File**: `src/app/api/chat/graph/nodes/recipeContext.ts`

```typescript
import { ChatState } from '../types';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { trimMessages } from '@langchain/core/messages';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a sous chef helping with specific recipes.
    Context: {context}
    Keep responses concise but informative.`,
  ],
  ["placeholder", "{messages}"],
]);

const trimmer = trimMessages({
  maxTokens: 4000,
  strategy: "last",
  tokenCounter: async (msgs) => {
    const tokenizer = await llm.getNumTokensFromMessages(msgs);
    return tokenizer.totalCount;
  },
  includeSystem: false,
  allowPartial: false,
  startOn: "human",
});

export async function handleRecipeContext(state: ChatState): Promise<Partial<ChatState>> {
  if (!state.recipeContext) {
    return {
      messages: [],
    };
  }
  
  const trimmedMessages = await trimmer.invoke(state.messages);
  const prompt = await promptTemplate.invoke({
    messages: trimmedMessages,
    context: JSON.stringify(state.recipeContext),
  });
  
  const response = await llm.invoke(prompt);
  
  return {
    messages: [response],
  };
}
```

### Step 2.5: Convert General Cooking to Node

**File**: `src/app/api/chat/graph/nodes/generalCooking.ts`

```typescript
import { ChatState } from '../types';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { trimMessages } from '@langchain/core/messages';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a sous chef helping with menu planning, recipe development, 
    and kitchen execution. Keep responses somewhat short.`,
  ],
  ["placeholder", "{messages}"],
]);

const trimmer = trimMessages({
  maxTokens: 1000,
  strategy: "last",
  tokenCounter: async (msgs) => {
    const tokenizer = await llm.getNumTokensFromMessages(msgs);
    return tokenizer.totalCount;
  },
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

export async function handleGeneralCooking(state: ChatState): Promise<Partial<ChatState>> {
  const trimmedMessages = await trimmer.invoke(state.messages);
  const prompt = await promptTemplate.invoke({ messages: trimmedMessages });
  const response = await llm.invoke(prompt);
  
  return {
    messages: [response],
  };
}
```

### Step 2.6: Convert Recipe Creation to Node

**File**: `src/app/api/chat/graph/nodes/createRecipe.ts`

```typescript
import { ChatState } from '../types';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { CreateRecipeDTO } from '@/types/dtos';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const systemMessage = `You are a recipe extraction assistant. Extract recipe information 
from the user's message and conversation history. Return ONLY valid JSON matching the 
recipe structure.`;

export async function createRecipe(state: ChatState): Promise<Partial<ChatState>> {
  const lastMessage = state.messages[state.messages.length - 1];
  
  // Include conversation history and recipe context if available
  const messages = [
    new SystemMessage(systemMessage),
    ...(state.recipeContext 
      ? [new SystemMessage(`Base recipe context: ${JSON.stringify(state.recipeContext)}`)]
      : []),
    ...state.messages.slice(0, -1), // All messages except last
    lastMessage, // Current message
  ];
  
  const response = await llm.invoke(messages);
  const content = response.content as string;
  
  try {
    const recipeData: CreateRecipeDTO = JSON.parse(content);
    
    return {
      messages: [response],
      recipeInProgress: recipeData,
      metadata: {
        ...state.metadata,
        recipeCreationIntent: true,
        recipeData,
      },
    };
  } catch (error) {
    // Return error message
    return {
      messages: [response],
      metadata: {
        ...state.metadata,
        parseError: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
```

### Step 2.7: Create Recipe Modification Node

**File**: `src/app/api/chat/graph/nodes/modifyRecipe.ts`

```typescript
import { ChatState } from '../types';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage } from '@langchain/core/messages';
import { CreateRecipeDTO } from '@/types/dtos';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

export async function modifyRecipe(state: ChatState): Promise<Partial<ChatState>> {
  if (!state.recipeContext) {
    return {
      messages: [],
      metadata: {
        error: "No recipe context available for modification",
      },
    };
  }
  
  const systemMessage = `Modify the following recipe based on the user's request and 
  conversation history. Return the complete modified recipe as JSON.`;
  
  const messages = [
    new SystemMessage(systemMessage),
    new SystemMessage(`Original recipe: ${JSON.stringify(state.recipeContext)}`),
    ...state.messages,
  ];
  
  const response = await llm.invoke(messages);
  const content = response.content as string;
  
  try {
    const modifiedRecipe: CreateRecipeDTO = JSON.parse(content);
    
    return {
      messages: [response],
      recipeInProgress: modifiedRecipe,
      metadata: {
        ...state.metadata,
        recipeModificationIntent: true,
        recipeData: modifiedRecipe,
      },
    };
  } catch (error) {
    return {
      messages: [response],
      metadata: {
        ...state.metadata,
        parseError: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
```

### Step 2.8: Create Non-Food Handler Node

**File**: `src/app/api/chat/graph/nodes/nonFood.ts`

```typescript
import { ChatState } from '../types';
import { AIMessage } from '@langchain/core/messages';

export async function handleNonFood(state: ChatState): Promise<Partial<ChatState>> {
  const response = new AIMessage(
    "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?"
  );
  
  return {
    messages: [response],
  };
}
```

### Step 2.9: Build Unified Graph

**File**: `src/app/api/chat/graph/unifiedGraph.ts`

```typescript
import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { ChatState } from './types';
import { checkpointer } from './config';
import { classifyTopic } from './nodes/classify';
import { handleRecipeContext } from './nodes/recipeContext';
import { handleGeneralCooking } from './nodes/generalCooking';
import { createRecipe } from './nodes/createRecipe';
import { modifyRecipe } from './nodes/modifyRecipe';
import { handleNonFood } from './nodes/nonFood';

// Define state channels
const stateDefinition = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => [...x, ...y],
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
  currentTopic: {
    default: () => undefined,
  },
  metadata: {
    value: (x: Record<string, any>, y: Record<string, any>) => ({ ...x, ...y }),
    default: () => ({}),
  },
};

// Routing function
const routeBasedOnClassification = (state: ChatState): string => {
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
const workflow = new StateGraph<ChatState>(stateDefinition)
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

// Export thread ID helper
export { getThreadId } from './config';
```

---

## Phase 3: Integration (Day 4-5)

### Step 3.1: Update ChatService

**File**: `src/app/api/chat/service.ts`

```typescript
import { app, getThreadId } from './graph/unifiedGraph';
import { HumanMessage } from '@langchain/core/messages';
import { ChatState } from './graph/types';
import { RecipeService } from '@/services/recipeService';
import { transformRecipeForChat } from './recipeTransformer';

export class ChatService {
  private recipeService: RecipeService;

  constructor() {
    this.recipeService = new RecipeService();
  }

  private async getRecipeContext(id: string) {
    const recipe = await this.recipeService.getRecipeContextForChat(id);
    return recipe ? transformRecipeForChat(recipe) : null;
  }

  async processMessage(
    message: string,
    type?: string,
    id?: string,
    userId?: string
  ): Promise<{ result: string; metadata?: any }> {
    if (!message || message.trim() === '') {
      return { result: "Please provide a message to process." };
    }

    // Generate thread ID
    const threadId = getThreadId(userId || 'anonymous', type);
    
    // Get recipe context if on recipe page
    const recipeContext = type === 'recipes' && id
      ? await this.getRecipeContext(id)
      : undefined;
    
    // Prepare initial state
    const initialState: Partial<ChatState> = {
      messages: [new HumanMessage(message.trim())],
      recipeContext,
      metadata: {
        hasContext: !!recipeContext,
        contextType: type,
        contextId: id,
      },
    };
    
    // Invoke graph with persistent thread ID
    const config = {
      configurable: {
        thread_id: threadId,
      },
    };
    
    try {
      const result = await app.invoke(initialState, config);
      
      // Extract response
      const lastMessage = result.messages[result.messages.length - 1];
      const responseText = lastMessage.content as string;
      
      return {
        result: responseText,
        metadata: {
          ...result.metadata,
          classification: result.classification,
          recipeInProgress: result.recipeInProgress,
        },
      };
    } catch (error) {
      return {
        result: "I encountered an error processing your request. Please try again.",
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
```

### Step 3.2: Update API Route (Minimal Changes)

**File**: `src/app/api/chat/route.ts`

The route should work with minimal changes since ChatService interface is similar:

```typescript
// Remove messageHistory parameter (no longer needed)
const response = await chatService.processMessage(message, type, id, dbUser.id);
```

### Step 3.3: Test End-to-End

1. Test basic conversation
2. Test context switching
3. Test recipe creation
4. Test recipe modification
5. Test multi-turn conversations

---

## Phase 4: Cleanup (Day 6)

### Step 4.1: Remove Old Code

- Delete `src/app/api/chat/pipeline/` directory
- Delete `src/app/api/chat/chains/` directory (or keep for reference)
- Delete `src/services/conversationManager.ts` (no longer needed)
- Remove Redis dependency from `package.json`

### Step 4.2: Remove Redis Environment Variables

Remove from `.env` files:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Step 4.3: Update Documentation

- Update architecture docs
- Update implementation guides
- Remove Redis references

---

## Testing Checklist

### Unit Tests
- [ ] Each node works independently
- [ ] Routing logic works correctly
- [ ] State transitions are correct

### Integration Tests
- [ ] Full conversation flow
- [ ] Context switching (recipe → general → recipe)
- [ ] Recipe creation with conversation history
- [ ] Recipe modification
- [ ] Thread ID persistence

### Manual Testing
- [ ] Multi-turn conversations
- [ ] All 9 use cases from decision doc
- [ ] Navigation between pages
- [ ] Server restart (state persists)

---

## Troubleshooting

### Issue: PostgresSaver connection fails
- Check DATABASE_URL environment variable
- Verify database is accessible
- Check table permissions

### Issue: State not persisting
- Verify thread ID is consistent
- Check checkpoints table has data
- Verify checkpointer is configured correctly

### Issue: Context loss
- Verify all nodes use same thread ID
- Check state channels are defined correctly
- Verify messages are being added to state

---

## Rollback Plan

If critical issues arise:
1. Keep old code in separate branch
2. Use feature flag to switch between implementations
3. PostgresSaver checkpoints can be exported
4. Can revert to pipeline architecture if needed

---

## Success Criteria

- [ ] All conversation scenarios work
- [ ] Context persists across conversation types
- [ ] No Redis dependency
- [ ] Performance is acceptable
- [ ] Code is simpler and maintainable
- [ ] All tests pass
