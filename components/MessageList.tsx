import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Conversation = {
  id: string;
  name: string;
  imageUrl?: string;
  email: string;
}

type MessageListProps = {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export function MessageList({ conversations, selectedConversation, onSelectConversation }: MessageListProps) {
  return (
    <ul className="space-y-2">
      {conversations.map((conversation) => (
        <li 
          key={conversation.id}
          className={`flex items-center p-2 rounded-lg cursor-pointer ${
            selectedConversation?.id === conversation.id 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={conversation.imageUrl} alt={conversation.name} />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {conversation.name}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{conversation.email}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

