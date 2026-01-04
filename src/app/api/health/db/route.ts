import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import net from 'net';

export const runtime = "nodejs";

export async function GET() {
  try {
    // First test basic TCP connectivity
    console.log('Testing TCP connectivity...');
    const canConnect = await testTcpConnection('db.xlcqdxahfeixmohmynad.supabase.co', 5432);
    
    if (!canConnect) {
      // Test if we can reach any external service
      const canReachGoogle = await testTcpConnection('google.com', 80);
      
      return NextResponse.json({
        status: 'unhealthy',
        database: 'disconnected',
        error: 'Cannot establish TCP connection to database server',
        canReachExternal: canReachGoogle,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }, { status: 500 });
    }

    // Test database connection
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tcpConnection: 'successful',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}

function testTcpConnection(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 5000; // 5 seconds
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, host);
  });
} 