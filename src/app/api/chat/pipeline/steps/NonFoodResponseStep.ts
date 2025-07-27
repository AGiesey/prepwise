import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';

export class NonFoodResponseStep extends BaseStep {
  constructor() {
    super('NonFoodResponse');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    // Execute if classification is not-food-related
    return input.classification === 'not-food-related';
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      const result = "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?";
      
      const output = this.createOutput(input, { 
        result,
        metadata: {
          ...input.metadata,
          responseType: 'non-food-rejection'
        }
      });

      this.logStepEnd(input, output, Date.now() - startTime);
      return output;
    } catch (error) {
      return this.handleError(error, input);
    }
  }
} 