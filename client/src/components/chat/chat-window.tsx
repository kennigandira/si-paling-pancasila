import { useQuery } from "@tanstack/react-query";
import Message from "./message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Message as MessageType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

export default function ChatWindow() {
  const { data: messages, isLoading } = useQuery<MessageType[]>({
    queryKey: ["/api/messages"],
  });

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="animate-pulse">Loading messages...</div>
      </div>
    );
  }

  const clearChat = async () => {
    await fetch("/api/messages", { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={clearChat} variant="destructive" size="sm">
          Clear Chat
        </Button>
      </div>
      <ScrollArea className="h-[500px] pr-4">
        {messages?.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </ScrollArea>
    </div>
  );
}
