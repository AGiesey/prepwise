import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';
import { runGeneralCookingChain } from '../../chains/runGeneralCookingChain';

export class GeneralCookingResponseStep extends BaseStep {
  constructor() {
    super('GeneralCookingResponse');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    // Execute if classification is food-related
    return input.classification === 'food-related';
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      // Run the general cooking chain
      const response = await runGeneralCookingChain(input.message);
      
      // Extract the last message content as the result
      const lastMessage = response.messages[response.messages.length - 1];
      const result = lastMessage.content as string;
      
      const output = this.createOutput(input, { 
        result,
        metadata: {
          ...input.metadata,
          chainType: 'general-cooking',
          messageCount: response.messages.length
        }
      });

      this.logStepEnd(input, output, Date.now() - startTime);
      return output;
    } catch (error) {
      return this.handleError(error, input);
    }
  }
} 