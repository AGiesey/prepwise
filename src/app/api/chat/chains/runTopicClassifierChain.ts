import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage, trimMessages } from '@langchain/core/messages';

import { v4 as uuidv4 } from "uuid";

const topicClassifyPromptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are to determine if the user's query is cooking 
    related or not cooking related. Your only response will be ether
    "cooking-related" or "not-cooking-related"`
  ],
  ["placeholder", "{messages}"]
])

const llm = new ChatOpenAI({
  model: "o3-mini-2025-01-31"
})

/*
The messages set up should have 
1. The current context of the app in JSON format (recipe, grocery list, etc...)
2. The topicClassifyPromptTemplate
3. The current question 
*/



export async function runTopicClassifierChain(message: string) {
  const messages = [
    new SystemMessage(`You are to determine if the user's query is cooking
      or food health related or not. Your only response will be ether
      "cooking-related" or "not-cooking-related"`),
    new HumanMessage(message)
  ]
  const response = await llm.invoke(messages);
  
  return response?.content ? response.content : "cooking-related";
}
