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
      receiverId: msg.receiverId,
      timestamp: msg.createdAt,
      read: msg.read
    }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

export async function sendMessage(content: string, senderId: string, receiverId: string) {
  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        read: false
      }
    })

    const channel = ably.channels.get(`conversation:${receiverId}`);
    await channel.publish("new-message", {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      timestamp: newMessage.createdAt,
      read: newMessage.read
    });

    const userChannel = ably.channels.get(`user:${receiverId}`);
    await userChannel.publish("new-message", { senderId });

    return {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      timestamp: newMessage.createdAt,
      read: newMessage.read
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    })

    const channel = ably.channels.get(`conversation:${updatedMessage.senderId}`)
    await channel.publish('message-read', { messageId: updatedMessage.id })

    return updatedMessage
  } catch (error) {
    console.error('Error marking message as read:', error)
    throw error
  }
}

