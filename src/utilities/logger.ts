import winston from 'winston';
import { BaseMessage } from '@langchain/core/messages';
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

// Helper function to safely format messages for logging
const formatMessageForLogging = (message: BaseMessage) => {
  return {
    type: message._getType(),
    content: message.content,
    // Only include additional fields if they exist and are not sensitive
    ...(message.name && { name: message.name }),
    ...(message.additional_kwargs && Object.keys(message.additional_kwargs).length > 0 && {
      additional_kwargs: Object.keys(message.additional_kwargs)
    })
  };
};

const logTailSourceToken = process.env.LOGTAIL_SOURCE_TOKEN || '';
const ingestingHost = process.env.LOGTAIL_INGESTING_HOST || '';
const logToLogtail = process.env?.LOGTAIL_ENABLED === 'true';

const transports: winston.transport[] = [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
  new winston.transports.File({ filename: 'logs/combined.log' })
]

if (logToLogtail) {
  const logtail = new Logtail(logTailSourceToken, {
    endpoint: `https://${ingestingHost}`
  });
  transports.push(new LogtailTransport(logtail))
}

const logLevel = process.env.LOG_LEVEL || 'info';

// Create a logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: transports
});

// Add a method to log chain class operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logChainOperation = (operation: string, data: any) => {
  //If data contains messages, format them for logging
  if (data.messages) {
    data.messages = data.messages.map(formatMessageForLogging);
  }
  
  logger.info('Chain Operation', {
    operation,
    data,
    timestamp: new Date().toISOString()
  });
};

// Add a method to log chain class errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logChainError = (error: any, context: string) => {
  logger.error('Chain Error', {
    error: error.message || error,
    context,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logInfo = (message: string, data?: any) => {
  logger.info(message, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export const logDebug = (message: string, data?: any) => {
  logger.debug(message, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

export default logger; 