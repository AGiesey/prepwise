import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';


const llm = new ChatOpenAI({
  model: "o3-mini-2025-01-31"
})

export type TopicClassification = 'context-related' | 'food-related' | 'not-food-related';

export async function runTopicClassifierChain(message: string, contextualItems?: string[]): Promise<TopicClassification> {
  
  const systemMessage = contextualItems 
    ? `Given this context: ${JSON.stringify(contextualItems)}
       Determine if the user's query is about this specific context ("context-related"),
       about food but not this context ("food-related"), or neither ("not-food-related").
       Respond with exactly one of: "context-related", "food-related", or "not-food-related"`
    : `Determine if the user's query is food-related or not.
       Respond with exactly one of: "food-related" or "not-food-related"`;

  const messages = [
    new SystemMessage(systemMessage),
    new HumanMessage(message)
  ];
  
  const response = await llm.invoke(messages);
  return (response?.content || "not-food-related") as TopicClassification;
}
