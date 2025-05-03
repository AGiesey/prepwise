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

const contextSpecificPromptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system", 
    `You are a sous chef helping home cooks with specific recipes and cooking tasks.
    You have access to the following context: {context}
    
    Use this context to provide specific, detailed answers about the recipe or cooking task.
    Keep responses concise but informative. If more details would be helpful, end with 'Would you like more details?'`
  ],
  ["placeholder", "{messages}"],
]);

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
  verbose: true,
});

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

// This seems to be trimming the context and I don't want it to.
export async function runContextSpecificChain(message: string, context: any) {
  const contextString = JSON.stringify(context);
  
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const trimmedMessages = await trimmer.invoke(state.messages);
    const prompt = await contextSpecificPromptTemplate.invoke({ 
      messages: [...trimmedMessages, new AIMessage(message)],
      context: contextString
    });
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

  return await app.invoke({ 
    messages: [new AIMessage(message)]
  }, config);
} 