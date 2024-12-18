import * as Ably from 'ably';
import { configureAbly } from "@ably-labs/react-hooks";

if (!process.env.ABLY_API_KEY) {
  throw new Error('ABLY_API_KEY is not set');
}

export const ably = configureAbly({ key: process.env.ABLY_API_KEY });
