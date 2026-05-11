import { PipelineFlow } from "@/components/pipeline/pipeline-flow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Info, Sparkles } from "lucide-react";
import { InteractiveCard } from "@/components/ui/card-modal";

export default function PipelinePage() {
  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden pb-2 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sunset-text flex items-center gap-2">
            Backend Intelligence Pipeline
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground mt-1">
            Visualizing the end-to-end intelligence extraction lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">
            System Healthy
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 flex gap-2">
            <Activity className="h-3 w-3 animate-pulse" />
            Live Processing
          </Badge>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <PipelineFlow />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InteractiveCard 
          title="Pipeline Latency" 
          description="Average processing time per transcript."
          detailContent={
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">This metric tracks the average time it takes for a raw transcript to be discovered, classified, and harmonized into Parquet format.</p>
              <div className="p-4 bg-muted/20 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">Current Latency Breakdown</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between"><span>Discovery:</span> <span>0.2s</span></li>
                  <li className="flex justify-between"><span>Classification:</span> <span>0.4s</span></li>
                  <li className="flex justify-between"><span>Harmonization:</span> <span>0.6s</span></li>
                  <li className="flex justify-between font-medium text-foreground pt-2 border-t mt-2"><span>Total:</span> <span>1.2s</span></li>
                </ul>
              </div>
            </div>
          }
        >
          <Card className="enterprise-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Pipeline Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2s</div>
              <p className="text-xs text-muted-foreground mt-1">Average processing time per transcript.</p>
            </CardContent>
          </Card>
        </InteractiveCard>
        
        <InteractiveCard 
          title="Throughput" 
          description="Real-time ingestion rate from discovery."
          detailContent={
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">The current number of transcript messages processed successfully per second through the ingestion pipeline.</p>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                  <Activity className="h-4 w-4" /> System Optimal
                </div>
                <p className="text-sm">The pipeline is running efficiently without backpressure. Current capacity allows for up to 150 msg/sec before horizontal scaling is triggered.</p>
              </div>
            </div>
          }
        >
          <Card className="enterprise-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Throughput
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42 msg/sec</div>
              <p className="text-xs text-muted-foreground mt-1">Real-time ingestion rate from discovery.</p>
            </CardContent>
          </Card>
        </InteractiveCard>

        <InteractiveCard 
          title="Schema Drift" 
          description="Minor field variations detected in 'Harmonization'."
          detailContent={
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Schema drift occurs when incoming data slightly deviates from the expected structure but can still be processed with fallback mapping.</p>
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <h4 className="font-semibold text-amber-500 text-sm mb-1">Warning: Missing 'Agent_ID' field</h4>
                  <p className="text-xs text-muted-foreground">Detected in 45 files from 'Vendor B' batch. Automatically mapped to 'null' to prevent pipeline failure.</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <h4 className="font-semibold text-amber-500 text-sm mb-1">Warning: Unknown timestamp format</h4>
                  <p className="text-xs text-muted-foreground">Detected ISO-8601 instead of UNIX epoch in 12 files. Coerced automatically by Harmonization Engine.</p>
                </div>
              </div>
            </div>
          }
        >
          <Card className="enterprise-card border-amber-500/20 bg-amber-500/5 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Schema Drift
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">2 Warnings</div>
              <p className="text-xs text-muted-foreground mt-1">Minor field variations detected in 'Harmonization'.</p>
            </CardContent>
          </Card>
        </InteractiveCard>
      </div>
    </div>
  );
}
