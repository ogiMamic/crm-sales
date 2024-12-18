import * as Ably from "ably";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'Ably API key not set' }, { status: 500 });
  }

  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'crm-sales' });
  return NextResponse.json(tokenRequestData);
}

