'use server'

import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";

type ClerkUser = {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

export async function getClerkUsers(searchTerm: string): Promise<ClerkUser[]> {
  try {
    const usersResponse = await clerkClient().users.getUserList({
        query: searchTerm,
        limit: 10,
      });
    
    if ('data' in usersResponse && Array.isArray(usersResponse.data)) {
      return usersResponse.data.map((user: User) => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        imageUrl: user.imageUrl || '',
        email: user.emailAddresses[0]?.emailAddress || 'No email provided',
      }));
    } else if (Array.isArray(usersResponse)) {
      return usersResponse.map((user: User) => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        imageUrl: user.imageUrl || '',
        email: user.emailAddresses[0]?.emailAddress || 'No email provided',
      }));
    } else {
      console.error('Unexpected response format from Clerk API');
      return [];
    }
  } catch (error) {
    console.error('Error fetching Clerk users:', error);
    return [];
  }
}

