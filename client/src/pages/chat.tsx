import ChatWindow from "@/components/chat/chat-window";
import ChatInput from "@/components/chat/chat-input";
import { Card } from "@/components/ui/card";

export default function Chat() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-4xl mx-auto">
        <div className="p-6">
          <ChatWindow />
          <ChatInput />
        </div>
      </Card>
    </div>
  );
}
