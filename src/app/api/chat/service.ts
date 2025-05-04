import { runTopicClassifierChain, TopicClassification } from './chains/runTopicClassifierChain';
import { runGeneralCookingChain } from './chains/runGeneralCookingChain';
import { runContextSpecificChain } from './chains/runContextSpecificChain';
import { logDebug } from '@/utilities/logger';
import { RecipeService } from '@/services/recipeService';

export class ChatService {
  private recipeService: RecipeService;

  constructor() {
    this.recipeService = new RecipeService();
  }

  private async getContextualItems(type: string, id?: string) {
    if (type === 'recipes' && id) {
      return await this.recipeService.getRecipeContextForChat(id);
    }
    return null;
  }

  private async classifyMessageContext(message: string, contextualItems: any): Promise<TopicClassification> {
    const result = await runTopicClassifierChain(message, contextualItems);
    return result;
  }

  async processMessage(message: string, type?: string, id?: string) {

    // First check if we have a specific entity context
    if (type && id) {
      const contextualItems = await this.getContextualItems(type, id);
      
      if (contextualItems) {
        const classification = await this.classifyMessageContext(message, contextualItems);
        
        logDebug("CLASSIFYING MESSAGE CONTEXT", {
          message,
          contextualItems,
          classification
        });
        
        switch (classification) {
          case 'context-related':
            const contextResponse = await runContextSpecificChain(message, contextualItems);
            return contextResponse.messages[contextResponse.messages.length - 1].content;
          
          case 'food-related':
            const cookingResponse = await runGeneralCookingChain(message);
            return cookingResponse.messages[cookingResponse.messages.length - 1].content;
          
          case 'not-food-related':
            return "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?";
        }
      }
    }

    // If no context is provided or context wasn't found, use general classification
    const classification = await runTopicClassifierChain(message);
    
    if (classification !== 'not-food-related') {
      const response = await runGeneralCookingChain(message);
      return response.messages[response.messages.length - 1].content;
    }

    return "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?";
  }
} 