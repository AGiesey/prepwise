import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';


const llm = new ChatOpenAI({
  model: "o3-mini-2025-01-31"
})

export type TopicClassification = 'context-related' | 'food-related' | 'not-food-related' | 'create-recipe' | 'parse-recipe-url';

export async function runTopicClassifierChain(message: string, contextualItems?: string[]): Promise<TopicClassification> {

  const systemMessage = contextualItems
    ? `Given this context: ${JSON.stringify(contextualItems)}
       Determine if the user's query is:
       - "parse-recipe-url" if the message contains a URL (e.g. https://...) — the user may be sharing a recipe link
       - "create-recipe" if they want to create, add, or generate a new recipe from a description (e.g., "create a recipe for...", "make me a recipe for...", "I feel like cooking...")
       - "context-related" if about this specific context but not recipe creation
       - "food-related" if about food/cooking but not this context and not recipe creation
       - "not-food-related" if not about food or cooking

       Respond with exactly one of: "parse-recipe-url", "create-recipe", "context-related", "food-related", or "not-food-related"`
    : `Determine if the user's query is:
       - "parse-recipe-url" if the message contains a URL (e.g. https://...) — the user may be sharing a recipe link
       - "create-recipe" if they want to create, add, or generate a new recipe from a description (e.g., "create a recipe for...", "make me a recipe for...", "I feel like cooking something sweet")
       - "food-related" if about food/cooking but not recipe creation (questions, tips, advice)
       - "not-food-related" if not about food or cooking

       Respond with exactly one of: "parse-recipe-url", "create-recipe", "food-related", or "not-food-related"`;

  const messages = [
    new SystemMessage(systemMessage),
    new HumanMessage(message)
  ];
  
  const response = await llm.invoke(messages);
  return (response?.content || "not-food-related") as TopicClassification;
}
