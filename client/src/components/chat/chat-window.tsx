import { useQuery } from "@tanstack/react-query";
import Message from "./message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Message as MessageType } from "@shared/schema";

export default function ChatWindow() {
  const { data: messages, isLoading } = useQuery<MessageType[]>({
    queryKey: ["/api/messages"]
  });

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="animate-pulse">Loading messages...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      {messages?.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </ScrollArea>
  );
}
