import { TopicClassification } from '../chains/runTopicClassifierChain';

export interface PipelineInput {
  message: string;
  type?: string;
  id?: string;
  context?: any;
  classification?: TopicClassification;
  result?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface PipelineOutput {
  message: string;
  type?: string;
  id?: string;
  context?: any;
  classification?: TopicClassification;
  result: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface PipelineStep {
  name: string;
  execute(input: PipelineInput): Promise<PipelineOutput>;
  canExecute?(input: PipelineInput): Promise<boolean>;
}

export interface PipelineConfig {
  steps: PipelineStep[];
  enableLogging?: boolean;
  enableErrorHandling?: boolean;
}

export interface PipelineContext {
  sessionId: string;
  startTime: number;
  stepResults: Map<string, any>;
} 