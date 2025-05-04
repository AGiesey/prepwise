import { NextResponse } from 'next/server';
import { MessageContent } from '@langchain/core/messages';
import { ChatService } from './service';

export async function POST(request: Request): Promise<NextResponse<{ message: MessageContent } | { error: string }>> {
  const { message, type, id } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 });
  }

  const chatService = new ChatService();
  const response = await chatService.processMessage(message, type, id);

  return NextResponse.json({ message: response });
}