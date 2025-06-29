import { ChatPipeline } from '../ChatPipeline';
import { MockStep } from './MockStep';
import { PipelineInput } from '../types';

describe('ChatPipeline', () => {
  let pipeline: ChatPipeline;

  beforeEach(() => {
    pipeline = new ChatPipeline({
      steps: [],
      enableLogging: false, // Disable logging for tests
      enableErrorHandling: true
    });
  });

  describe('Basic Pipeline Execution', () => {
    it('should execute a single step successfully', async () => {
      const mockStep = new MockStep('test-step', true, 'Test result');
      pipeline.addStep(mockStep);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.result).toBe('Test result');
      expect(result.error).toBeUndefined();
    });

    it('should execute multiple steps in sequence', async () => {
      const step1 = new MockStep('step-1', true, 'Step 1 result');
      const step2 = new MockStep('step-2', true, 'Step 2 result');
      
      pipeline.addStep(step1);
      pipeline.addStep(step2);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.result).toBe('Step 2 result'); // Last step result
      expect(result.error).toBeUndefined();
    });

    it('should skip steps that cannot execute', async () => {
      const step1 = new MockStep('step-1', false); // Should be skipped
      const step2 = new MockStep('step-2', true, 'Step 2 result');
      
      pipeline.addStep(step1);
      pipeline.addStep(step2);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.result).toBe('Step 2 result');
      expect(result.error).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle step errors gracefully', async () => {
      const errorStep = new MockStep('error-step', true, undefined, true);
      pipeline.addStep(errorStep);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.error).toBe('Mock step error');
      expect(result.result).toBe('I encountered an error processing your request: Mock step error');
    });

    it('should stop execution on error', async () => {
      const errorStep = new MockStep('error-step', true, undefined, true);
      const afterErrorStep = new MockStep('after-error', true, 'Should not execute');
      
      pipeline.addStep(errorStep);
      pipeline.addStep(afterErrorStep);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.error).toBe('Mock step error');
      expect(result.result).toBe('I encountered an error processing your request: Mock step error');
      expect(result.result).not.toContain('Should not execute');
    });
  });

  describe('Input/Output Flow', () => {
    it('should pass data between steps', async () => {
      const step1 = new MockStep('step-1', true, 'Step 1 result');
      const step2 = new MockStep('step-2', true, 'Step 2 result');
      
      pipeline.addStep(step1);
      pipeline.addStep(step2);

      const input: PipelineInput = {
        message: 'Hello, world!',
        type: 'test',
        id: '123'
      };

      const result = await pipeline.execute(input);

      expect(result.message).toBe('Hello, world!');
      expect(result.type).toBe('test');
      expect(result.id).toBe('123');
      expect(result.result).toBe('Step 2 result');
    });

    it('should generate session ID if not provided', async () => {
      const mockStep = new MockStep('test-step', true, 'Test result');
      pipeline.addStep(mockStep);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.sessionId).toBeDefined();
      expect(typeof result.sessionId).toBe('string');
    });
  });

  describe('Pipeline Management', () => {
    it('should allow adding steps dynamically', async () => {
      const step1 = new MockStep('step-1', true, 'Step 1 result');
      pipeline.addStep(step1);

      const step2 = new MockStep('step-2', true, 'Step 2 result');
      pipeline.addStep(step2);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.result).toBe('Step 2 result');
    });

    it('should allow removing steps', async () => {
      const step1 = new MockStep('step-1', true, 'Step 1 result');
      const step2 = new MockStep('step-2', true, 'Step 2 result');
      
      pipeline.addStep(step1);
      pipeline.addStep(step2);
      pipeline.removeStep('step-2');

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      const result = await pipeline.execute(input);

      expect(result.result).toBe('Step 1 result');
    });
  });

  describe('Context Management', () => {
    it('should maintain execution context', async () => {
      const mockStep = new MockStep('test-step', true, 'Test result');
      pipeline.addStep(mockStep);

      const input: PipelineInput = {
        message: 'Hello, world!'
      };

      await pipeline.execute(input);
      const context = pipeline.getContext();

      expect(context.sessionId).toBeDefined();
      expect(context.startTime).toBeDefined();
      expect(context.stepResults.has('test-step')).toBe(true);
    });
  });
}); 