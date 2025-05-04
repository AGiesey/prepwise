import { NextResponse } from 'next/server';
import { AIMessage, MessageContent } from '@langchain/core/messages';
import { runGeneralCookingChain } from './chains/runGeneralCookingChain';
import { runTopicClassifierChain, TopicClassification } from './chains/runTopicClassifierChain';
import { runContextSpecificChain } from './chains/runContextSpecificChain';


const getContextualItems = async (type: string, id?: string) => {
  if (type === 'recipe') {
    return await prisma.recipe.findUnique({
      where: { id }
    })
  }
}

const classifyMessageContext = async (
  message: string,  
  contextualItems: string[]
): Promise<TopicClassification> => {
  const result = await runTopicClassifierChain(message, contextualItems);
  return result;
}

export async function POST(request: Request): Promise<NextResponse<{ message: MessageContent } | { error: string }>> {
  const { message, type, id } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 });
  }

  // First check if we have a specific entity context
  if (type && id) {
    const contextualItems = await getContextualItems(type, id);
    
    if (contextualItems) {
      console.log("CONTEXTUAL ITEMS", contextualItems)
      console.log("MESSAGE", message)
      const classification = await classifyMessageContext(message, contextualItems);
      console.log("CLASSIFICATION", classification);
      
      switch (classification) {
        case 'context-related':
          const contextResponse = await runContextSpecificChain(message, contextualItems);
          return NextResponse.json({ message: contextResponse.messages[contextResponse.messages.length - 1].content });
        
        case 'food-related':
          const cookingResponse = await runGeneralCookingChain(message);
          return NextResponse.json({ message: cookingResponse.messages[cookingResponse.messages.length - 1].content });
        
        case 'not-food-related':
          return NextResponse.json({ 
            message: "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?" 
          });
      }
    }
  }

  // If no context is provided or context wasn't found, use general classification
  const classification = await runTopicClassifierChain(message);
  
  if (classification !== 'not-food-related') {
    const response = await runGeneralCookingChain(message);
    return NextResponse.json({ message: response.messages[response.messages.length - 1].content });
  }

  return NextResponse.json({ 
    message: "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?" 
  });
}