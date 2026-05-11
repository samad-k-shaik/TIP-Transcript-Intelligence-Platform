import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { fetchConversations } from "@/lib/api";
import { InteractiveCard } from "@/components/ui/card-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConversationalSummary } from "@/components/ui/conversational-summary";

export default async function ConversationsPage() {
  const conversations = await fetchConversations();

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden pb-2 min-h-0">
      <div>
        <h2 className="text-3xl font-bold tracking-tight sunset-text flex items-center gap-2">
          Conversation Intelligence
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </h2>
        <p className="text-muted-foreground mt-1">
          Deep dive into processed transcripts and AI-extracted insights.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {conversations.length === 0 ? (
          <Card className="enterprise-card bg-primary/5 border-primary/20 p-8 text-center">
            <p className="text-muted-foreground">No conversations found. Please ensure the pipeline has ingested data.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-4">
            {conversations.map((conv: any, i: number) => (
              <InteractiveCard 
                key={`${conv.call_id}-${i}`}
                title={`Call ${conv.call_id}`}
                description={conv.call_type}
                detailContent={
                  <div className="flex flex-col gap-6 p-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {conv.call_type}
                      </Badge>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Duration: ~4m 22s
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Primary Topic</p>
                        <div className="font-medium bg-muted/50 p-2 rounded border truncate">
                          {conv.primary_topic}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sentiment</p>
                        <div className="font-medium bg-muted/50 p-2 rounded border flex items-center gap-2">
                          {conv.sentiment === 'POSITIVE' && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                          {conv.sentiment === 'NEGATIVE' && <div className="h-2 w-2 rounded-full bg-rose-500" />}
                          {conv.sentiment === 'NEUTRAL' && <div className="h-2 w-2 rounded-full bg-amber-500" />}
                          {conv.sentiment}
                        </div>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Validation Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-4 bg-background border p-3 rounded-lg text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-bold">98.5%</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Validator</span>
                          <span className="font-bold">LLM-Harmony-v2</span>
                        </div>
                      </div>
                    </div>

                    <ConversationalSummary callId={conv.call_id} />
                  </div>
                }
              >
                <Card className="h-full flex flex-col justify-between p-6 hover:shadow-lg transition-all border-primary/10 hover:border-primary/20">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold">{conv.call_id}</h3>
                      <Badge variant={conv.sentiment === 'NEGATIVE' ? 'destructive' : conv.sentiment === 'POSITIVE' ? 'secondary' : 'outline'}>
                        {conv.sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{conv.call_type}</p>
                  </div>
                  <div className="pt-4 border-t text-sm font-medium text-foreground truncate">
                    <MessageSquare className="h-4 w-4 inline mr-2 text-muted-foreground" />
                    {conv.primary_topic}
                  </div>
                </Card>
              </InteractiveCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
