import { DiagnosticEngine, type DiagnosticOptions } from '@/lib/core';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, options = {} } = body as { url: string; options?: DiagnosticOptions };

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const engine = new DiagnosticEngine({
            timeout: options.timeout || 10000,
            checkEndpoints: options.checkEndpoints !== false,
            checkSchemas: options.checkSchemas || false,
            verbose: options.verbose || false,
          });

          const report = await engine.diagnose(url, {
            onCheckStart: async (check) => {
              const message = `event: check-start\ndata: ${JSON.stringify({
                id: check.id,
                name: check.name,
              })}\n\n`;
              controller.enqueue(encoder.encode(message));
            },
            onCheckComplete: async (result) => {
              const message = `event: check-complete\ndata: ${JSON.stringify(result)}\n\n`;
              controller.enqueue(encoder.encode(message));
            },
          });

          const message = `event: complete\ndata: ${JSON.stringify({ report })}\n\n`;
          controller.enqueue(encoder.encode(message));
          controller.close();
        } catch (error) {
          const errorMessage = `event: error\ndata: ${JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
