import { NextResponse } from 'next/server';
import { AIMessage, MessageContent } from '@langchain/core/messages';
import { runGeneralCookingChain } from './chains/runGeneralCookingChain';
import { runTopicClassifierChain } from './chains/runTopicClassifierChain';

export async function POST(request: Request): Promise<NextResponse<{ message: MessageContent } | { error: string }>> {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 });
  }

  const topicClassification = await runTopicClassifierChain(message);

  //return NextResponse.json(output.messages[output.messages.length - 1]);
  return NextResponse.json({ message: topicClassification })
}