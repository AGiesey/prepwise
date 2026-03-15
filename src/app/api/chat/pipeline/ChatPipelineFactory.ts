import { ChatPipeline } from './ChatPipeline';
import { PipelineConfig } from './types';
import {
  TopicClassificationStep,
  ContextualResponseStep,
  GeneralCookingResponseStep,
  NonFoodResponseStep,
  RecipeCreationStep,
  RecipeUrlParsingStep
} from './steps';

export class ChatPipelineFactory {
  static createPipeline(hasContext: boolean = false): ChatPipeline {
    const steps = [
      new TopicClassificationStep(),
      new RecipeCreationStep(),
      new RecipeUrlParsingStep()
    ];

    // Add response steps based on whether we have context
    if (hasContext) {
      // With context, we can handle context-specific responses
      steps.push(
        new ContextualResponseStep(),
        new GeneralCookingResponseStep(),
        new NonFoodResponseStep()
      );
    } else {
      // Without context, only general cooking and non-food responses
      steps.push(
        new GeneralCookingResponseStep(),
        new NonFoodResponseStep()
      );
    }

    const config: PipelineConfig = {
      steps,
      enableLogging: true,
      enableErrorHandling: true
    };

    return new ChatPipeline(config);
  }
} 