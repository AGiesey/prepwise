import { NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, trimMessages } from '@langchain/core/messages';
import { ChatPromptTemplate } from "@langchain/core/prompts";

import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";

import { v4 as uuidv4 } from "uuid";

const promptTemplate = ChatPromptTemplate.fromMessages([
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
  temperature: 0
});

const trimmer = trimMessages({
  maxTokens: 100,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const trimmedMessages = await trimmer.invoke(state.messages);
  const prompt = await promptTemplate.invoke({ messages: trimmedMessages });
  const response = await llm.invoke(prompt);
  return { messages: [response] };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

const config = { configurable: { thread_id: uuidv4() } };


export async function POST(request: Request): Promise<NextResponse<AIMessage | { error: string }>> {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 });
  }

  const output = await app.invoke({ messages: [message] }, config);

  return NextResponse.json(output.messages[output.messages.length - 1]);
}