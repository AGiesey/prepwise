import { NextResponse } from 'next/server';
import { MessageContent } from '@langchain/core/messages';
import { ChatService } from './service';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ 
    message: 'Chat API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(request: Request): Promise<NextResponse<{ message: MessageContent } | { error: string }>> {
  console.log('Chat API called - method:', request.method);
  console.log('Chat API called - headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return NextResponse.json({ 
        error: 'Chat service is not properly configured. Please contact support.' 
      }, { status: 500 });
    }

    console.log('OPENAI_API_KEY is set, length:', process.env.OPENAI_API_KEY?.length);

    const { message, type, id } = await request.json();
    console.log('Request body:', { message: message?.substring(0, 50) + '...', type, id });

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    console.log('Creating ChatService...');
    const chatService = new ChatService();
    console.log('Processing message...');
    const response = await chatService.processMessage(message, type, id);
    console.log('Message processed successfully');

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's an OpenAI API key error
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ 
        error: 'Chat service is not properly configured. Please contact support.' 
      }, { status: 500 });
    }
    
    // Check for specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }, { status: 429 });
      }
      if (error.message.includes('quota_exceeded')) {
        return NextResponse.json({ 
          error: 'API quota exceeded. Please try again later.' 
        }, { status: 429 });
      }
      if (error.message.includes('invalid_api_key')) {
        return NextResponse.json({ 
          error: 'Invalid API configuration. Please contact support.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'An error occurred while processing your message. Please try again.' 
    }, { status: 500 });
  }
}