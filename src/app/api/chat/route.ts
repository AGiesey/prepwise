import { NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from '@langchain/core/messages';


export async function POST(request: Request): Promise<NextResponse<AIMessage | { error: string }>> {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 });
  }

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
  });

  const response = await llm.invoke([{ role: "user", content: message }]);

  console.log(response);

  return NextResponse.json(response);
}