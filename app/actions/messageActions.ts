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
    // First, mark all previous messages as read
    await markAllMessagesAsRead(senderId, receiverId)

    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        read: false
      }
    })

    const messageData = {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      timestamp: newMessage.createdAt,
      read: newMessage.read
    };

    // Create a unique channel name for this conversation
    const channelName = `conversation:${[senderId, receiverId].sort().join(':')}`
    const conversationChannel = ably.channels.get(channelName);
    
    await Promise.all([
      conversationChannel.publish("new-message", messageData),
      ably.channels.get(`user:${receiverId}`).publish("new-message", { senderId })
    ]);

    return messageData;
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export async function markAllMessagesAsRead(currentUserId: string, conversationId: string) {
  try {
    // Get unread messages before updating
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: currentUserId,
        senderId: conversationId,
        read: false
      },
      select: {
        id: true
      }
    })

    if (unreadMessages.length > 0) {
      // Update messages to read
      await prisma.message.updateMany({
        where: {
          receiverId: currentUserId,
          senderId: conversationId,
          read: false
        },
        data: {
          read: true
        }
      })

      // Publish to the unique conversation channel
      const messageIds = unreadMessages.map(m => m.id)
      const updateData = { readerId: currentUserId, messageIds }
      const channelName = `conversation:${[currentUserId, conversationId].sort().join(':')}`
      
      await ably.channels.get(channelName).publish('messages-read', updateData)
    }

    return { success: true, count: unreadMessages.length }
  } catch (error) {
    console.error('Error marking messages as read:', error)
    throw error
  }
}

