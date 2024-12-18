'use server'

import prisma from '@/lib/prisma'
import { clerkClient } from "@clerk/nextjs/server"

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
      distinct: ['senderId', 'receiverId'],
    });

    const conversations = await Promise.all(
      messages.map(async (msg) => {
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const user = await clerkClient().users.getUser(otherUserId);
        return {
          id: otherUserId,
          name: `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
          imageUrl: user.imageUrl || '',
          email: user.emailAddresses[0]?.emailAddress || 'No email provided',
        };
      })
    );

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function sendMessage(content: string, senderId: string, receiverId: string) {
  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      }
    });
    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getMessages(userId: string, otherUserId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

