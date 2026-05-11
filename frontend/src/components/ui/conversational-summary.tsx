"use client";

import { useState, useEffect } from "react";
import { analyzeTranscript } from "@/lib/api";
import { RefreshCcw, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ConversationalSummary({ callId }: { callId: string }) {
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await analyzeTranscript(callId);
        if (isMounted) setAiSummary(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to analyze transcript");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, [callId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 p-8">
        <RefreshCcw className="h-6 w-6 text-primary animate-spin" />
        <p className="text-sm text-primary animate-pulse">Extracting conversational intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
        {error}
      </div>
    );
  }

  if (!aiSummary) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> Executive Summary
        </h4>
        <p className="text-sm leading-relaxed">
          {aiSummary.detailed_summary}
        </p>
      </div>

      {aiSummary.conversation && aiSummary.conversation.length > 0 && (
        <div className="space-y-3 pt-4 mt-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="h-3 w-3" /> Conversation Transcript
          </h4>
          <div className="space-y-4 p-4 rounded-xl bg-muted/20 border">
            {aiSummary.conversation.map((msg: any, i: number) => {
              const isAgent = msg.speaker.toLowerCase().includes("agent") || 
                              msg.speaker.toLowerCase().includes("smith") || 
                              msg.speaker.toLowerCase().includes("rep");
              return (
                <div key={i} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-muted-foreground mb-1 px-1">{msg.speaker}</span>
                  <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                    isAgent 
                      ? 'bg-primary/10 text-foreground border border-primary/20 rounded-tr-sm' 
                      : 'bg-background border shadow-sm rounded-tl-sm text-foreground/90'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
