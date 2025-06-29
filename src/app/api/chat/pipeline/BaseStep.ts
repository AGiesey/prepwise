import { PipelineInput, PipelineOutput, PipelineStep } from './types';
import { logDebug, logChainError } from '@/utilities/logger';

export abstract class BaseStep implements PipelineStep {
  constructor(public readonly name: string) {}

  abstract execute(input: PipelineInput): Promise<PipelineOutput>;
  abstract canExecute(input: PipelineInput): Promise<boolean>;

  protected logStepStart(input: PipelineInput): void {
    logDebug('STEP_START', {
      stepName: this.name,
      sessionId: input.sessionId,
      message: input.message
    });
  }

  protected logStepEnd(input: PipelineInput, output: PipelineOutput, duration: number): void {
    logDebug('STEP_END', {
      stepName: this.name,
      sessionId: input.sessionId,
      duration,
      hasError: !!output.error
    });
  }

  protected handleError(error: any, input: PipelineInput): PipelineOutput {
    logChainError(error, `step-${this.name}`);
    
    return {
      ...input,
      result: `Error in ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  protected createOutput(input: PipelineInput, updates: Partial<PipelineOutput>): PipelineOutput {
    return {
      ...input,
      result: input.result || "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?",
      ...updates
    };
  }
} 