// app/actions/messageActions.ts
'use server'

import prisma from "@/lib/prisma"
import { ably } from "@/lib/ably"

export async function fetchMessages(currentUserId: string, conversationId: string) {
  try {
    const fetchedMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: conversationId },
          { senderId: conversationId, receiverId: currentUserId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    return fetchedMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      timestamp: msg.createdAt
    }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(content: string, senderId: string, receiverId: string) {
  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId
      }
    })

    const channel = ably.channels.get(`conversation:${receiverId}`);
    await channel.publish("new-message", {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.senderId,
      timestamp: newMessage.createdAt
    });

    const userChannel = ably.channels.get(`user:${receiverId}`);
    await userChannel.publish("new-message", { senderId });

    return {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.senderId,
      timestamp: newMessage.createdAt
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}