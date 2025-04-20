
export interface Message {
  role: MessageRole;
  content: string;
}

export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}