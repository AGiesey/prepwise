import { v4 as uuidv4 } from 'uuid';
import { PipelineInput, PipelineOutput, PipelineStep, PipelineConfig, PipelineContext } from './types';
import { logDebug, logChainError } from '@/utilities/logger';

export class ChatPipeline {
  private config: PipelineConfig;
  private context: PipelineContext;

  constructor(config: PipelineConfig) {
    this.config = {
      enableLogging: true,
      enableErrorHandling: true,
      ...config
    };
    this.context = {
      sessionId: uuidv4(),
      startTime: Date.now(),
      stepResults: new Map()
    };
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    const sessionId = input.sessionId || this.context.sessionId;
    let currentInput: PipelineInput = { ...input, sessionId };

    if (this.config.enableLogging) {
      logDebug('PIPELINE_START', {
        sessionId,
        message: currentInput.message,
        type: currentInput.type,
        id: currentInput.id
      });
    }

    try {
      for (const step of this.config.steps) {
        // Check if step can execute
        if (step.canExecute && !(await step.canExecute(currentInput))) {
          if (this.config.enableLogging) {
            logDebug('PIPELINE_STEP_SKIPPED', {
              sessionId,
              stepName: step.name,
              reason: 'Step cannot execute with current input'
            });
          }
          continue;
        }

        // Execute step
        const stepStartTime = Date.now();
        const stepOutput = await step.execute(currentInput);
        const stepDuration = Date.now() - stepStartTime;

        // Store step result in context
        this.context.stepResults.set(step.name, {
          output: stepOutput,
          duration: stepDuration,
          timestamp: Date.now()
        });

        if (this.config.enableLogging) {
          logDebug('PIPELINE_STEP_COMPLETED', {
            sessionId,
            stepName: step.name,
            duration: stepDuration,
            hasError: !!stepOutput.error
          });
        }

        // Update current input for next step
        currentInput = {
          ...currentInput,
          ...stepOutput
        };

        // Check if step wants to stop pipeline execution early
        // This is useful for action steps like recipe creation that should short-circuit
        if (stepOutput.metadata?.stopPipeline === true) {
          if (this.config.enableLogging) {
            logDebug('PIPELINE_STOPPED_EARLY', {
              sessionId,
              stepName: step.name,
              reason: 'Step requested pipeline stop'
            });
          }
          
          // Return early with the step's result
          const totalDuration = Date.now() - this.context.startTime;
          return {
            ...currentInput,
            result: currentInput.result || stepOutput.result
          };
        }

        // Handle step errors
        if (stepOutput.error && this.config.enableErrorHandling) {
          logChainError(new Error(stepOutput.error), `pipeline-step-${step.name}`);
          
          // Return error response
          return {
            ...currentInput,
            result: `I encountered an error processing your request: ${stepOutput.error}`,
            error: stepOutput.error
          };
        }
      }

      // Pipeline completed successfully
      const totalDuration = Date.now() - this.context.startTime;
      
      if (this.config.enableLogging) {
        logDebug('PIPELINE_COMPLETED', {
          sessionId,
          totalDuration,
          stepsExecuted: this.config.steps.length,
          result: currentInput.result
        });
      }

      return {
        ...currentInput,
        result: currentInput.result || "I'm specialized in cooking-related topics. Could you please ask me something about cooking or food?"
      };

    } catch (error) {
      logChainError(error, 'pipeline-execution');
      
      return {
        ...currentInput,
        result: "I encountered an unexpected error. Please try again.",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getContext(): PipelineContext {
    return { ...this.context };
  }

  addStep(step: PipelineStep): void {
    this.config.steps.push(step);
  }

  removeStep(stepName: string): void {
    this.config.steps = this.config.steps.filter(step => step.name !== stepName);
  }
} 