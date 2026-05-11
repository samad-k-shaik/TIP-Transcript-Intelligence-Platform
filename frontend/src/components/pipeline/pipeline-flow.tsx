"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  ConnectionLineType,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { PipelineNode } from "./pipeline-node";
import { NodeDetailModal } from "./node-detail-modal";
import { fetchIngestionStatus, triggerIngestion, fetchAvailableDatasets } from "@/lib/api";
import {
  Search,
  FileJson,
  Layers,
  Users,
  Brain,
  Zap,
  TrendingUp,
  ShieldCheck,
  Database,
  Box,
  Sparkles,
  Play,
  Loader2,
  Activity,
  FolderTree
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const nodeTypes = {
  pipelineNode: PipelineNode,
};

const INITIAL_NODES: Node[] = [
  { id: "1", type: "pipelineNode", position: { x: 0, y: 0 }, data: { label: "Raw Dataset", icon: Box, status: "pending", progress: 0, metrics: { processed: "0", confidence: "N/A" } } },
  { id: "2", type: "pipelineNode", position: { x: 350, y: 0 }, data: { label: "Recursive Discovery", icon: Search, status: "pending", progress: 0, metrics: { processed: "0", confidence: "100%" } } },
  { id: "3", type: "pipelineNode", position: { x: 700, y: 0 }, data: { label: "Schema Classification", icon: FileJson, status: "pending", progress: 0, metrics: { processed: "0", confidence: "98.2%" } } },
  { id: "4", type: "pipelineNode", position: { x: 1050, y: 0 }, data: { label: "Harmonization", icon: Layers, status: "pending", progress: 0, metrics: { processed: "0", confidence: "99.1%" } } },
  { id: "5", type: "pipelineNode", position: { x: 1050, y: 250 }, data: { label: "Speaker Resolution", icon: Users, status: "pending", progress: 0, metrics: { processed: "0", confidence: "94%" } } },
  { id: "6", type: "pipelineNode", position: { x: 700, y: 250 }, data: { label: "AI Categorization", icon: Brain, status: "pending", progress: 0, isAI: true, metrics: { processed: "In-flight", confidence: "89%" } } },
  { id: "7", type: "pipelineNode", position: { x: 350, y: 250 }, data: { label: "Sentiment Intelligence", icon: Zap, status: "pending", progress: 0, isAI: true, metrics: { processed: "Analyzing", confidence: "92%" } } },
  { id: "10", type: "pipelineNode", position: { x: 0, y: 250 }, data: { label: "Parquet Dataset", icon: Database, status: "pending", progress: 0, metrics: { processed: "0", confidence: "100%" } } },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: false, style: { strokeWidth: 3 } },
  { id: "e2-3", source: "2", target: "3", animated: false, style: { strokeWidth: 3 } },
  { id: "e3-4", source: "3", target: "4", animated: false, style: { strokeWidth: 3 } },
  { id: "e4-5", source: "4", target: "5", animated: false, style: { strokeWidth: 3 } },
  { id: "e5-6", source: "5", target: "6", animated: false, style: { strokeWidth: 3 } },
  { id: "e6-7", source: "6", target: "7", animated: false, style: { strokeWidth: 3 } },
  { id: "e7-10", source: "7", target: "10", animated: false, style: { strokeWidth: 3 } },
];

export function PipelineFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [availableDatasets, setAvailableDatasets] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data);
    setIsModalOpen(true);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await fetchIngestionStatus();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  }, []);

  const fetchDatasets = useCallback(async () => {
    try {
      const data = await fetchAvailableDatasets();
      setAvailableDatasets(data);
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchDatasets();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchDatasets]);

  useEffect(() => {
    if (!status) return;

    const isRunning = status.is_running;
    const currentStage = status.current_stage;
    const stageProgress = (status.stage_progress || 0) * 100;
    const totalFiles = status.total_files || 0;
    const processedFiles = status.processed_files || 0;
    const aiAnalyzed = status.ai_analyzed || 0;

    setNodes((nds) =>
      nds.map((node) => {
        let nodeStatus: "pending" | "processing" | "success" = "pending";
        let nodeProgress = 0;
        let metrics = { ...node.data.metrics };

        const isComplete = currentStage === "complete";

        switch (node.id) {
          case "1":
            nodeStatus = isRunning || totalFiles > 0 || isComplete ? "success" : "pending";
            nodeProgress = nodeStatus === "success" ? 100 : 0;
            metrics.processed = `${totalFiles} files`;
            break;
          case "2":
            if (isComplete || ["classification", "harmonization", "resolving", "ai_enrichment", "finalizing"].includes(currentStage)) {
              nodeStatus = "success";
              nodeProgress = 100;
            } else if (currentStage === "discovery") {
              nodeStatus = "processing";
              nodeProgress = Math.max(10, stageProgress);
            }
            metrics.processed = totalFiles > 0 ? `${totalFiles} files` : "Scanning...";
            break;
          case "3":
            if (isComplete || ["harmonization", "resolving", "ai_enrichment", "finalizing"].includes(currentStage)) {
              nodeStatus = "success";
              nodeProgress = 100;
            } else if (currentStage === "classification") {
              nodeStatus = "processing";
              nodeProgress = Math.max(10, stageProgress);
            }
            metrics.processed = totalFiles > 0 ? `${totalFiles} files` : "Classifying...";
            break;
          case "4":
            if (isComplete || ["resolving", "ai_enrichment", "finalizing"].includes(currentStage)) {
              nodeStatus = "success";
              nodeProgress = 100;
            } else if (currentStage === "harmonization") {
              nodeStatus = "processing";
              nodeProgress = Math.max(10, stageProgress);
            }
            metrics.processed = processedFiles.toString();
            break;
          case "5":
            if (isComplete || ["ai_enrichment", "finalizing"].includes(currentStage)) {
              nodeStatus = "success";
              nodeProgress = 100;
            } else if (currentStage === "resolving") {
              nodeStatus = "processing";
              nodeProgress = Math.max(10, stageProgress);
            }
            metrics.processed = processedFiles.toString();
            break;
          case "6":
            if (isComplete || currentStage === "finalizing") {
              nodeStatus = "success";
              nodeProgress = 100;
            } else if (currentStage === "ai_enrichment") {
              nodeStatus = "processing";
              nodeProgress = Math.max(10, stageProgress);
            }
            metrics.processed = aiAnalyzed > 0 ? aiAnalyzed.toString() : (currentStage === "ai_enrichment" ? "Analyzing..." : "0");
            break;
          case "7":
            if (isComplete || currentStage === "finalizing") {
              nodeStatus = "success";
              nodeProgress = 100;
            } else if (currentStage === "ai_enrichment") {
              nodeStatus = "processing";
              nodeProgress = Math.max(5, stageProgress);
            }
            metrics.processed = aiAnalyzed > 0 ? aiAnalyzed.toString() : (currentStage === "ai_enrichment" ? "Sentiment AI..." : "0");
            break;
          case "10":
            if (isComplete) {
              nodeStatus = "success";
              nodeProgress = 100;
            } else if (currentStage === "finalizing") {
              nodeStatus = "processing";
              nodeProgress = Math.max(10, stageProgress);
            }
            metrics.processed = processedFiles.toString();
            break;
        }

        return {
          ...node,
          data: {
            ...node.data,
            status: nodeStatus,
            progress: nodeProgress,
            metrics,
          },
        };
      })
    );
  }, [status, setNodes]);

  // Separate effect for edge animation based on current node states
  useEffect(() => {
    if (!status) return;
    const isRunning = status.is_running;

    setEdges((eds) =>
      eds.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        
        // Animate if source is done/processing and target is not done
        const isAnimated = isRunning && 
          (sourceNode?.data.status === "success" || sourceNode?.data.status === "processing") && 
          targetNode?.data.status !== "success";
          
        const isCompleted = sourceNode?.data.status === "success";

        return {
          ...edge,
          animated: isAnimated,
          style: {
            ...edge.style,
            stroke: isCompleted ? "oklch(0.65 0.18 25)" : "oklch(0.4 0.05 25)",
            strokeWidth: isCompleted || isAnimated ? 3 : 2,
            opacity: isCompleted || isAnimated ? 1 : 0.4,
          },
        };
      })
    );
  }, [nodes, status, setEdges]);

  const handleStartIngestion = async () => {
    setLoading(true);
    try {
      await triggerIngestion(selectedDataset || undefined);
      fetchStatus();
    } catch (error: any) {
      console.error("Failed to start pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const isRunning = status?.is_running;
  const progress = status?.total_files > 0 
    ? Math.round((status.processed_files / status.total_files) * 100) 
    : 0;

  return (
    <div className="relative h-full w-full bg-background rounded-xl border border-border/50 overflow-hidden shadow-inner">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/60 backdrop-blur-md border border-white/20">
          <FolderTree className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-2">Source:</span>
          <Select 
            options={availableDatasets} 
            value={selectedDataset} 
            onChange={setSelectedDataset}
            placeholder="Default (All)"
            disabled={isRunning || loading}
            className="w-48"
          />
        </div>

        <Button 
          onClick={handleStartIngestion} 
          disabled={isRunning || loading}
          className="sunset-gradient text-white border-none sunset-glow px-6"
        >
          {isRunning || loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4 fill-current" />
          )}
          {isRunning ? `Processing (${progress}%)` : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Trigger AI Pipeline</span>
            </div>
          )}
        </Button>
      </div>


      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-primary/20 text-primary">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isRunning ? "Intelligence Extraction In-Flight" : "System Ready"}
          </span>
        </div>
        
        {status?.status_message && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-md border border-primary/10 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-medium text-foreground/80 max-w-[200px] truncate">
              {status.status_message}
            </span>
          </div>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "hsl(var(--muted-foreground))",
          },
        }}
      >
        <Background color="oklch(0.72 0.14 25 / 0.1)" gap={20} size={1} />
        <Controls className="!bg-card/80 !backdrop-blur-sm !border-primary/20 !rounded-lg !shadow-xl" />
      </ReactFlow>

      <NodeDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nodeData={selectedNodeData}
        outcomes={status?.outcomes || []}
      />
    </div>
  );
}
