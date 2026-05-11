"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, Scale, Sparkles } from "lucide-react";

export default function ValidationPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight sunset-text flex items-center gap-2">
          Validation & Trust Center
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </h2>
        <p className="text-muted-foreground mt-1">
          Governing AI accuracy, explainability, and pipeline evidence mapping.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="enterprise-card border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evidence Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42,109</div>
            <p className="text-xs text-muted-foreground mt-1">Linked to raw data</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conflict Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Human vs AI labels</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Verified Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,482</div>
            <p className="text-xs text-muted-foreground mt-1">Unique transcript IDs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Intelligence Explainability
            </CardTitle>
            <CardDescription>How the system resolves ambiguous signals during harmonization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Speaker ID Resolution</span>
                </div>
                <Badge variant="outline">Exact Match</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Sentiment Normalization</span>
                </div>
                <Badge variant="outline">Weighted Avg</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Topic Cross-Pollination</span>
                </div>
                <Badge variant="outline" className="text-amber-500">Multi-label Resolve</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              AI Validation Engine Status
            </CardTitle>
            <CardDescription>Current state of the AI governance layer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              "The validation engine is currently running **v2.4.1** of the Harmony Protocol. All incoming transcripts are cross-referenced against 12 known schema variants with a required confidence threshold of **0.85**. Conflicts are automatically logged to the Anomaly Monitor for manual engineering review."
            </p>
            <div className="pt-4 border-t border-primary/10">
              <h4 className="text-xs font-bold uppercase text-primary/60 mb-2">Last Audit: 12 minutes ago</h4>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium">No governance violations detected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="enterprise-card bg-muted/20">
        <CardContent className="pt-6 flex items-start gap-4">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Evidence-Driven Trust</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every insight generated by the platform includes a link to the original raw transcript moment. 
              This ensures full data lineage from discovery to Parquet output. 
              Explainability scores are calculated based on model attention weights and semantic similarity distance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
