import { logDebug } from '@/utilities/logger';
import { RecipeService } from '@/services/recipeService';
import { transformRecipeForChat } from './recipeTransformer';
import { ChatPipelineFactory } from './pipeline';
import { PipelineOutput } from './pipeline/types';

export class ChatService {
  private recipeService: RecipeService;

  constructor() {
    this.recipeService = new RecipeService();
  }

  private async getContextualItems(type: string, id?: string) {
    if (type === 'recipes' && id) {
      const recipe = await this.recipeService.getRecipeContextForChat(id);
      return recipe ? transformRecipeForChat(recipe) : null;
    }
    return null;
  }

  async processMessage(message: string, type?: string, id?: string): Promise<Pick<PipelineOutput, 'result' | 'metadata'>> {
    // Guard against empty messages
    if (!message || message.trim() === '') {
      return { result: "Please provide a message to process." };
    }

    // Get contextual items if available
    const contextualItems = type ? await this.getContextualItems(type, id) : null;
    
    // Create pipeline based on whether we have context
    const pipeline = ChatPipelineFactory.createPipeline(!!contextualItems);
    
    // Prepare pipeline input
    const pipelineInput = {
      message: message.trim(),
      type,
      id,
      context: contextualItems,
      metadata: {
        hasContext: !!contextualItems,
        contextType: type,
        contextId: id
      }
    };

    logDebug("PROCESSING_MESSAGE_WITH_PIPELINE", {
      message,
      hasContext: !!contextualItems,
      contextType: type,
      contextId: id
    });

    // Execute pipeline
    const result = await pipeline.execute(pipelineInput);
    
    return {
      result: result.result,
      metadata: result.metadata
    };
  }
} 