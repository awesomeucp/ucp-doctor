import { NextResponse } from 'next/server';
import { DiagnosticEngine, type DiagnosticOptions } from '@/lib/core';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, options = {} } = body as { url: string; options?: DiagnosticOptions };

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const engine = new DiagnosticEngine({
      timeout: options.timeout || 10000,
      checkEndpoints: options.checkEndpoints !== false,
      checkSchemas: options.checkSchemas || false,
      verbose: options.verbose || false,
    });

    const report = await engine.diagnose(url);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
