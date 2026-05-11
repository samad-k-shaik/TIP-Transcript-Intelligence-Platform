"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Brain, Info, Sparkles } from "lucide-react";
import { InteractiveCard } from "@/components/ui/card-modal";

const topics = [
  { id: 1, name: "Billing Disputes", count: 450, growth: "+22%", confidence: "98%", status: "critical" },
  { id: 2, name: "Migration Friction", count: 320, growth: "+12%", confidence: "95%", status: "high" },
  { id: 3, name: "Product Bugs", count: 280, growth: "-5%", confidence: "92%", status: "medium" },
  { id: 4, name: "Feature Requests", count: 210, growth: "+8%", confidence: "89%", status: "low" },
  { id: 5, name: "Renewal Risks", count: 150, growth: "+15%", confidence: "96%", status: "high" },
];

export default function TopicsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sunset-text flex items-center gap-2">
            Topic Intelligence Explorer
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground mt-1">
            Discovering and clustering conversation themes using semantic similarity.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search topics..." className="pl-9 bg-background" />
        </div>
      </div>

      {/* Topic Clustering Overview (Mocked with Cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.slice(0, 3).map((topic) => (
          <InteractiveCard 
            key={topic.id} 
            title={`Topic Cluster: ${topic.name}`}
            description={`${topic.count} associated transcripts. Analyzing top keywords and sentiment.`}
            detailContent={
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant={topic.status === "critical" ? "destructive" : "secondary"}>
                    Growth: {topic.growth}
                  </Badge>
                  <span className="text-sm font-semibold text-primary">Confidence: {topic.confidence}</span>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg border space-y-2 text-sm">
                  <p className="font-medium text-foreground/80">AI Insight</p>
                  <p className="text-muted-foreground leading-relaxed">
                    The &quot;{topic.name}&quot; cluster has shown significant activity recently. 
                    Most transcripts in this cluster display a {topic.status === "critical" ? "negative" : "mixed"} sentiment. 
                    Top conversational keywords include the ones tagged below.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Cluster Keywords</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">#pricing</Badge>
                    <Badge variant="outline">#invoice</Badge>
                    <Badge variant="outline">#refund</Badge>
                    <Badge variant="outline">#billing_error</Badge>
                  </div>
                </div>
              </div>
            }
          >
            <Card className="enterprise-card border-l-4 border-l-primary h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{topic.name}</CardTitle>
                  <Badge variant={topic.status === "critical" ? "destructive" : "secondary"}>
                    {topic.growth}
                  </Badge>
                </div>
                <CardDescription>{topic.count} associated transcripts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-semibold text-primary/80">AI Confidence: {topic.confidence}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px]">#pricing</Badge>
                  <Badge variant="outline" className="text-[10px]">#invoice</Badge>
                  <Badge variant="outline" className="text-[10px]">#refund</Badge>
                </div>
              </CardContent>
            </Card>
          </InteractiveCard>
        ))}
      </div>

      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Topic Distribution</CardTitle>
          <CardDescription>Detailed breakdown of detected conversation clusters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic Name</TableHead>
                <TableHead>Total Transcripts</TableHead>
                <TableHead>Growth (7d)</TableHead>
                <TableHead>AI Confidence</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">{topic.name}</TableCell>
                  <TableCell>{topic.count}</TableCell>
                  <TableCell className={topic.growth.startsWith("+") ? "text-emerald-500" : "text-rose-500"}>
                    {topic.growth}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: topic.confidence }}
                        />
                      </div>
                      <span className="text-xs">{topic.confidence}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={topic.status === "critical" ? "destructive" : "outline"} className="capitalize">
                      {topic.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="enterprise-card bg-muted/20">
        <CardContent className="pt-6 flex items-start gap-4">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Semantic Clustering Intelligence
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our AI engine uses embedding-based vector clustering to group transcripts. 
              Clusters are dynamically updated as new data flows through the pipeline. 
              The 'Growth' metric indicates frequency shifts compared to the previous 7-day window.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
