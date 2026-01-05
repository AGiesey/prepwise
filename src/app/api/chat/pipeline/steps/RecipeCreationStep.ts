import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';

export class RecipeCreationStep extends BaseStep {
  constructor() {
    super('RecipeCreation');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    // Detect recipe creation intent using simple pattern matching
    // This is a basic implementation that we can enhance later
    const message = input.message.toLowerCase().trim();
    
    // Common patterns for recipe creation intent
    const creationPatterns = [
      /^(create|make|add|generate|show me).*recipe/,
      /^recipe (for|to make|to cook)/,
      /^(i want|i need|i'd like).*recipe/,
      /^how (to|do i) make/,
      /^how (to|do i) cook/,
    ];

    return creationPatterns.some(pattern => pattern.test(message));
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

