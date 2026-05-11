"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileJson, Sparkles, AlertCircle, CheckCircle2, RefreshCcw, FileText, Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeTranscript } from "@/lib/api";

interface FileOutcome {
  file_name: string;
  call_id: string;
  type: string;
  status: string;
  error_message?: string;
}

interface NodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: any;
  outcomes: FileOutcome[];
}

export function NodeDetailModal({ isOpen, onClose, nodeData, outcomes }: NodeDetailModalProps) {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Filter outcomes relevant to the current node stage
  const relevantOutcomes = React.useMemo(() => {
    if (!outcomes || outcomes.length === 0) return [];
    
    let filtered = outcomes;
    
    // For raw dataset / discovery, show everything discovered
    if (nodeData?.label.includes("Raw") || nodeData?.label.includes("Discovery")) {
      filtered = outcomes;
    }
    // For Classification, group by type
    else if (nodeData?.label.includes("Classification")) {
      filtered = outcomes;
    }
    // For Harmonization, focus on transcripts
    else if (nodeData?.label.includes("Harmonization") || nodeData?.label.includes("Parquet")) {
      filtered = outcomes.filter(o => o.type === "transcript");
    }
    // For AI Enrichment or Sentiment, focus on what has been successfully processed
    else if (nodeData?.isAI) {
       filtered = outcomes.filter(o => o.type === "transcript" && o.status !== "error");
    }

    return [...filtered].sort((a, b) => {
      // Sort primarily by call_id number if possible, or string comparison
      const numA = parseInt(a.call_id.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.call_id.replace(/\D/g, '')) || 0;
      if (numA !== numB) return numA - numB;
      return a.call_id.localeCompare(b.call_id);
    });
  }, [outcomes, nodeData]);

  const handleAnalyze = async (callId: string) => {
    setIsLoadingAi(true);
    setSelectedCallId(callId);
    setAiSummary(null); // Clear previous summary while loading
    try {
      const data = await analyzeTranscript(callId);
      setAiSummary(data);
    } catch (error: any) {
      console.error("Failed to analyze:", error);
      setAiSummary({ error: error.message || "Failed to analyze transcript" });
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (!nodeData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                {nodeData.icon && <nodeData.icon size={24} />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {nodeData.label} Details
                  {nodeData.isAI && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">AI Stage</Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  Showing {relevantOutcomes.length} relevant files for this stage
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 h-[55vh] min-h-[400px]">
          {/* File List */}
          <div className="flex flex-col border rounded-xl overflow-hidden bg-card/50 h-full">
            <div className="bg-muted/50 p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b flex justify-between shrink-0">
              <span>File Tracker</span>
              <span>Count: {relevantOutcomes.length}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-2 space-y-1.5">
                  {relevantOutcomes.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                      <RefreshCcw className="h-6 w-6 animate-spin opacity-20" />
                      Waiting for data to flow into this stage...
                    </div>
                  ) : (
                    relevantOutcomes.map((outcome, idx) => (
                      <div 
                        key={`${outcome.call_id}-${outcome.file_name}-${idx}`}
                        className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-colors hover:bg-muted/50 cursor-pointer ${selectedCallId === outcome.call_id ? 'border-primary/50 bg-primary/5' : 'border-transparent'}`}
                        onClick={() => handleAnalyze(outcome.call_id)}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {outcome.status === "error" ? (
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                          ) : outcome.status === "skipped" ? (
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                          <div className="flex flex-col truncate">
                            <span className="font-medium truncate">{outcome.file_name}</span>
                            <span className="text-[10px] text-muted-foreground">{outcome.call_id}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter ml-2 shrink-0">
                          {outcome.type.replace("SchemaType.", "")}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* AI Detail Panel */}
          <div className="flex flex-col border rounded-xl overflow-hidden bg-card/50 h-full">
             <div className="bg-muted/50 p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b flex items-center gap-2 shrink-0">
              <Brain className="h-3 w-3" />
              AI Deep Dive
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full w-full [&>div>div]:h-full">
                <div className="p-4 h-full">
                  {!selectedCallId ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50 p-6">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm">Click any transcript on the left to generate or view a detailed AI summary.</p>
                    </div>
              ) : isLoadingAi ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6">
                  <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-primary animate-pulse">Vertex AI extracting deep intelligence...</p>
                </div>
              ) : aiSummary?.error ? (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
                  {aiSummary.error}
                </div>
              ) : aiSummary ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                      {aiSummary.call_id}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {aiSummary.utterance_count} Utterances
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3 w-3" /> Executive Summary
                    </h4>
                    <p className="text-sm leading-relaxed bg-background p-3 rounded-lg border border-border/50 shadow-sm">
                      {aiSummary.detailed_summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sentiment</h4>
                      <div className="text-sm font-medium p-2 rounded-md bg-background border flex items-center gap-2">
                        {aiSummary.sentiment === 'POSITIVE' && <div className="h-2 w-2 rounded-full bg-emerald-500"/>}
                        {aiSummary.sentiment === 'NEGATIVE' && <div className="h-2 w-2 rounded-full bg-destructive"/>}
                        {aiSummary.sentiment === 'NEUTRAL' && <div className="h-2 w-2 rounded-full bg-amber-500"/>}
                        {aiSummary.sentiment}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary Topic</h4>
                      <div className="text-sm font-medium p-2 rounded-md bg-background border truncate">
                        {aiSummary.primary_topic}
                      </div>
                    </div>
                  </div>

                  {aiSummary.participants && aiSummary.participants.length > 0 && (
                     <div className="space-y-1 pt-2">
                       <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resolved Speakers</h4>
                       <div className="flex flex-wrap gap-1">
                         {aiSummary.participants.map((p: string) => (
                           <Badge key={p} variant="secondary" className="text-[10px] py-0">{p}</Badge>
                         ))}
                       </div>
                     </div>
                  )}

                  {aiSummary.conversation && aiSummary.conversation.length > 0 && (
                    <div className="space-y-3 pt-4 mt-2 border-t border-border/50">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Conversation Transcript
                      </h4>
                      <div className="space-y-4 p-4 rounded-xl bg-muted/20 border">
                        {aiSummary.conversation.map((msg: any, i: number) => {
                          const isAgent = msg.speaker.toLowerCase().includes("agent") || msg.speaker.toLowerCase().includes("smith") || msg.speaker.toLowerCase().includes("rep");
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
              ) : null}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
