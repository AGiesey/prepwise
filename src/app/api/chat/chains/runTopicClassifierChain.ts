import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';


const llm = new ChatOpenAI({
  model: "o3-mini-2025-01-31"
})

export type TopicClassification = 'context-related' | 'food-related' | 'not-food-related' | 'create-recipe';

export async function runTopicClassifierChain(message: string, contextualItems?: string[]): Promise<TopicClassification> {
  
  const systemMessage = contextualItems
    ? `Given this context: ${JSON.stringify(contextualItems)}
       Determine if the user's query is:
       - "create-recipe" if they want to create, add, generate, or save a new recipe (e.g., "create a recipe for...", "how do I make...", "I need a recipe for..."), OR if their message contains a URL (they may be sharing a recipe link)
       - "context-related" if about this specific context but not recipe creation
       - "food-related" if about food/cooking but not this context and not recipe creation
       - "not-food-related" if not about food or cooking

       Respond with exactly one of: "create-recipe", "context-related", "food-related", or "not-food-related"`
    : `Determine if the user's query is:
       - "create-recipe" if they want to create, add, generate, or save a new recipe (e.g., "create a recipe for...", "how do I make...", "I need a recipe for...", "show me how to cook..."), OR if their message contains a URL (they may be sharing a recipe link)
       - "food-related" if about food/cooking but not recipe creation (questions, tips, advice)
       - "not-food-related" if not about food or cooking

       Respond with exactly one of: "create-recipe", "food-related", or "not-food-related"`;

  const messages = [
    new SystemMessage(systemMessage),
    new HumanMessage(message)
  ];
  
  const response = await llm.invoke(messages);
  return (response?.content || "not-food-related") as TopicClassification;
}
