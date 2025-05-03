import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, BaseMessage, trimMessages } from '@langchain/core/messages';
import { v4 as uuidv4 } from "uuid";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { logChainOperation, logChainError } from "@/utilities/logger";

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
  temperature: 0.2, // lower the temperature the more predictible and "safe" the model is
  verbose: true,
});

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

const callModel = async (state: typeof MessagesAnnotation.State) => {
  try {
    const trimmedMessages = await trimmer.invoke(state.messages);
    const prompt = await sousChefPromptTemplate.invoke({ messages: trimmedMessages });
    const response = await llm.invoke(prompt);
    
    // Log successful model call with messages
    logChainOperation('model-call', {
      messageCount: state.messages.length,
      trimmedCount: trimmedMessages.length,
      model: llm.model,
      temperature: llm.temperature,
      messages: state.messages, // Include original messages
      trimmedMessages, // Include trimmed messages
      response: [response] // Include the response
    });
    
    return { messages: [response] };
  } catch (error) {
    // Log error with context and messages
    logChainError(error, 'model-call');
    return { messages: [new AIMessage("I'm sorry, I had an error processing your request. Please try again later.")] };
  }
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
const config = { configurable: { thread_id: uuidv4() } };

export async function runGeneralCookingChain(messages: BaseMessage[]) {
  try {
    // Log chain start with messages
    logChainOperation('chain-start', {
      messageCount: messages.length,
      threadId: config.configurable.thread_id,
      messages // Include the input messages
    });
    
    const result = await app.invoke({ messages }, config);
    
    // Log chain completion with result
    logChainOperation('chain-complete', {
      threadId: config.configurable.thread_id,
      result // Include the final result
    });
    
    return result;
  } catch (error) {
    // Log chain error
    logChainError(error, 'chain-execution');
    throw error;
  }
}
