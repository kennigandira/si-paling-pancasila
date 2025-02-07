import { Card } from "@/components/ui/card";
import { type Message, type AIResponse } from "@shared/schema";
import { format } from "date-fns";

interface MessageProps {
  message: Message;
}

export default function Message({ message }: MessageProps) {
  const response = JSON.parse(message.response) as AIResponse;

  return (
    <div className="mb-6">
      <div className="flex items-start gap-4">
        <Card className="flex-1 p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-1">
            {format(new Date(message.timestamp), "MMM d, yyyy HH:mm")}
          </p>
          <p className="mb-4">{message.content}</p>
        </Card>
      </div>

      <div className="flex items-start gap-4 mt-2">
        <Card className="flex-1 p-4 bg-primary/5">
          <div className="prose prose-sm">
            <h4 className="text-lg font-semibold mb-2">Analysis</h4>
            <p>{response.analysis}</p>

            <h5 className="font-semibold mt-4 mb-2">Pancasila Principles</h5>
            <ul>
              {response.pancasilaPrinciples.map((principle: string, i: number) => (
                <li key={i}>{principle}</li>
              ))}
            </ul>

            <h5 className="font-semibold mt-4 mb-2">Constitutional References</h5>
            <ul>
              {response.constitutionalReferences.map((ref: string, i: number) => (
                <li key={i}>{ref}</li>
              ))}
            </ul>

            <h5 className="font-semibold mt-4 mb-2">Recommendation</h5>
            <p>{response.recommendation}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}