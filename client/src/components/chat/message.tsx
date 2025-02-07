import { Card } from "@/components/ui/card";
import { type Message, type AIResponse } from "@shared/schema";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <div className="prose prose-sm max-w-none">
            {/* Research Section */}
            {response.research && response.research.references && response.research.references.length > 0 && (
              <Collapsible>
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0">
                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    </Button>
                  </CollapsibleTrigger>
                  <h4 className="text-lg font-semibold mb-0">Research References</h4>
                </div>
                <CollapsibleContent>
                  <ScrollArea className="h-[200px] mt-2">
                    {response.research.references.map((ref, i) => (
                      <div key={i} className="mb-3 p-2 bg-background/50 rounded-sm">
                        <p className="font-medium text-xs uppercase text-muted-foreground">
                          {ref.type}
                        </p>
                        <p className="text-sm font-medium text-primary">{ref.source}</p>
                        <p className="text-sm mt-1">{ref.content}</p>
                      </div>
                    ))}
                  </ScrollArea>
                  {response.research.summary && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {response.research.summary}
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Analysis Section */}
            {response.analysis && (
              <>
                <h4 className="text-lg font-semibold mt-4 mb-2">Analysis</h4>
                <p>{response.analysis}</p>
              </>
            )}

            {/* Pancasila Principles Section */}
            {response.pancasilaPrinciples && response.pancasilaPrinciples.length > 0 && (
              <>
                <h5 className="font-semibold mt-4 mb-2">Pancasila Principles</h5>
                <ul>
                  {response.pancasilaPrinciples.map((principle: string, i: number) => (
                    <li key={i}>{principle}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Constitutional References Section */}
            {response.constitutionalReferences && response.constitutionalReferences.length > 0 && (
              <>
                <h5 className="font-semibold mt-4 mb-2">Constitutional References</h5>
                <ul>
                  {response.constitutionalReferences.map((ref: string, i: number) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Recommendation Section */}
            {response.recommendation && (
              <>
                <h5 className="font-semibold mt-4 mb-2">Recommendation</h5>
                <p>{response.recommendation}</p>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}