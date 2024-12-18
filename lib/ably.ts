// lib/ably.ts
import * as Ably from 'ably';
import { configureAbly } from "@ably-labs/react-hooks";

export const ably = configureAbly({ authUrl: '/api/createTokenRequest' });