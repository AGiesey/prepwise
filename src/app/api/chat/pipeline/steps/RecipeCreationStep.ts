import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';

export class RecipeCreationStep extends BaseStep {
  constructor() {
    super('RecipeCreation');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    // Execute if the topic classification detected recipe creation intent
    return input.classification === 'create-recipe';
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      // For now, just return a placeholder message indicating intent was detected
      // This allows us to validate intent detection before implementing parsing
      const result = "I detected you want to create a recipe! (Recipe creation parsing not yet implemented)";
      
      const output = this.createOutput(input, {
        result,
        metadata: {
          ...input.metadata,
          recipeCreationIntent: true,
          stepType: 'recipe-creation',
          stopPipeline: true // Stop pipeline execution - we've handled the recipe creation intent
        }
      });

      this.logStepEnd(input, output, Date.now() - startTime);
      return output;
    } catch (error) {
      return this.handleError(error, input);
    }
  }
}

