import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';
import { runContextSpecificChain } from '../../chains/runContextSpecificChain';

export class ContextualResponseStep extends BaseStep {
  constructor() {
    super('ContextualResponse');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    // Execute if classification is context-related and we have context
    return input.classification === 'context-related' && !!input.context;
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      // Run the context-specific chain
      const response = await runContextSpecificChain(input.message, input.context);
      
      // Extract the last message content as the result
      const lastMessage = response.messages[response.messages.length - 1];
      const result = lastMessage.content as string;
      
      const output = this.createOutput(input, { 
        result,
        metadata: {
          ...input.metadata,
          chainType: 'context-specific',
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