import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';

export class MockStep extends BaseStep {
  constructor(
    name: string,
    private shouldExecute: boolean = true,
    private mockResult?: string,
    private shouldError: boolean = false
  ) {
    super(name);
  }

  async canExecute(): Promise<boolean> {
    return this.shouldExecute;
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      if (this.shouldError) {
        throw new Error('Mock step error');
      }

      const result = this.mockResult || `Processed by ${this.name}`;
      const output = this.createOutput(input, { result });

      this.logStepEnd(input, output, Date.now() - startTime);
      return output;
    } catch (error) {
      return this.handleError(error, input);
    }
  }
} 