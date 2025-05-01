import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, trimMessages } from '@langchain/core/messages';

import { v4 as uuidv4 } from "uuid";

import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";

const sousChefPromptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system", 
    `You are a sous chef helping home cookswith menu planning, recipe development, 
    and kitchen execution. You focus on healthy, flavorful cooking while 
    accommodating dietary needs. You're knowledgeable about global 
    cuisines, ingredient substitutions, and food science. Keep responses 
    to one short sentence, but if you think more details would be 
    helpful, end with 'Would you like more details?'`
  ],
  ["placeholder", "{messages}"],
]);

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2 // lower the temperature the more predictible and "safe" the model is
});

const trimmer = trimMessages({
  maxTokens: 100,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const trimmedMessages = await trimmer.invoke(state.messages);
  const prompt = await sousChefPromptTemplate.invoke({ messages: trimmedMessages });
  const response = await llm.invoke(prompt);
  return { messages: [response] };
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
const config = { configurable: { thread_id: uuidv4() } };

export async function runGeneralCookingChain(messages: AIMessage[]) {
  return await app.invoke({ messages }, config);
}
