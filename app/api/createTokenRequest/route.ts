// app/api/createTokenRequest/route.ts
import * as Ably from "ably";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const client = new Ably.Realtime(process.env.ABLY_API_KEY!);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'ably-nextjs-demo' });
  return NextResponse.json(tokenRequestData);
}