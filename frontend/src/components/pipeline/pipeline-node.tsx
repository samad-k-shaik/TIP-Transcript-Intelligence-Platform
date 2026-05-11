"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export const PipelineNode = memo(({ data }: { data: any }) => {
  const isProcessing = data.status === "processing";
  const isError = data.status === "error";
  const isSuccess = data.status === "success";

  return (
    <div className={cn(
      "relative min-w-[240px] rounded-xl border bg-card/80 backdrop-blur-md p-4 transition-all duration-500 cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-xl hover:border-primary/40 group",
      isProcessing && "border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)] ring-1 ring-primary/30",
      isError && "border-destructive",
      isSuccess && "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
    )}>
      <Handle type="target" position={Position.Left} className="!bg-primary/50 !w-2.5 !h-2.5" />
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              {data.icon && <data.icon size={18} />}
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground/90">{data.label}</span>
          </div>
          {data.isAI && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 animate-pulse">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-primary">AI</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {isProcessing ? (
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : isError ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            <span>Progress</span>
            <span>{data.progress}%</span>
          </div>
          <Progress value={data.progress} className="h-1" />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground uppercase">Processed</span>
            <span className="text-xs font-mono font-medium">{data.metrics?.processed || 0}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground uppercase">Confidence</span>
            <Badge variant="outline" className="w-fit text-[10px] py-0 h-4 bg-background/50">
              {data.metrics?.confidence || "0%"}
            </Badge>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-primary/50 !w-2.5 !h-2.5" />
      
      {/* Background Glow for Active Nodes */}
      {isProcessing && (
        <div className="absolute inset-0 rounded-xl bg-primary/5 blur-xl -z-10 animate-pulse" />
      )}
    </div>
  );
});

PipelineNode.displayName = "PipelineNode";
