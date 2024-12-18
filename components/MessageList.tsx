import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Conversation = {
  id: string
  name: string
  type: 'individual' | 'group'
}

type MessageListProps = {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
}

export function MessageList({ conversations, selectedConversation, onSelectConversation }: MessageListProps) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`flex items-center p-2 rounded-lg cursor-pointer ${
            selectedConversation?.id === conversation.id ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${conversation.name}`} />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{conversation.name}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {conversation.type === 'group' ? 'Gruppe' : 'Einzelgespräch'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

