import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';
import { runTopicClassifierChain, TopicClassification } from '../../chains/runTopicClassifierChain';

export class TopicClassificationStep extends BaseStep {
  constructor() {
    super('TopicClassification');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    // Always execute if we don't have a classification yet
    return !input.classification;
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      // Get contextual items if available
      const contextualItems = input.context;
      
      // Run the topic classification chain
      const classification = await runTopicClassifierChain(input.message, contextualItems);
      
      const output = this.createOutput(input, { 
        classification,
        metadata: {
          ...input.metadata,
          classificationReason: contextualItems ? 'context-aware' : 'general'
        }
      });

      this.logStepEnd(input, output, Date.now() - startTime);
      return output;
    } catch (error) {
      return this.handleError(error, input);
    }
  }
} 