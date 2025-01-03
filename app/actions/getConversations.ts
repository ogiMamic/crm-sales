// app/actions/getConversations.ts
'use server'

import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function getConversations(userId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const uniqueConversationPartners = new Set<string>();
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      uniqueConversationPartners.add(partnerId);
    });

    const conversations = await Promise.all(
      Array.from(uniqueConversationPartners).map(async (partnerId) => {
        const user = await clerkClient().users.getUser(partnerId);
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: partnerId },
              { senderId: partnerId, receiverId: userId }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        return {
          id: partnerId,
          name: `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
          imageUrl: user.imageUrl || '',
          email: user.emailAddresses[0]?.emailAddress || 'No email provided',
          hasNewMessages: lastMessage ? lastMessage.senderId !== userId && !lastMessage.read : false,
        };
      })
    );

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}