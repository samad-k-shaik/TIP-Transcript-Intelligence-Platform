import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { fetchStats, fetchSentiment, fetchCategories, fetchExecutiveSummary, fetchSentimentByType, fetchTopics, fetchIngestedDatasets } from "@/lib/api";
import { SentimentChart, CategoryChart, SentimentByTypeChart } from "@/components/charts/overview-charts";
import { DatasetFilter } from "@/components/dashboard/dataset-filter";

interface PageProps {
  searchParams: Promise<{ dataset?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { dataset } = await searchParams;
  const activeDataset = typeof dataset === "string" ? dataset : undefined;

  // Fetch data in parallel
  const [stats, sentimentTrend, issueCategories, executiveSummary, sentimentByType, topics, ingestedDatasets] = await Promise.all([
    fetchStats(activeDataset),
    fetchSentiment(activeDataset),
    fetchCategories(activeDataset),
    fetchExecutiveSummary(activeDataset),
    fetchSentimentByType(activeDataset),
    fetchTopics(activeDataset),
    fetchIngestedDatasets(),
  ]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden pb-2 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sunset-text">Executive Intelligence Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Synthesized operational insights from your global transcript pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DatasetFilter initialDatasets={ingestedDatasets || []} currentDataset={activeDataset || ""} />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl sunset-gradient sunset-glow text-white animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <KPICards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
        {/* Executive Summary */}
        <Card className="lg:col-span-3 enterprise-card bg-primary/5 border-primary/10 flex flex-col h-full overflow-hidden">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Executive Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Operational intelligence distilled from the recursive ingestion pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 overflow-y-auto flex-1 text-sm">
            <p className="leading-relaxed text-foreground/80">
              {executiveSummary.text}
            </p>
            <div className="space-y-1.5 mt-2">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase">Key Recommendations:</h4>
              <ul className="space-y-1.5">
                {executiveSummary.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded-md">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="leading-tight">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Top Issue Categories & Sentiment by Type */}
        <div className="col-span-1 lg:col-span-4 grid grid-cols-2 gap-4 h-full">
          <Card className="border-l-4 border-l-primary bg-primary/5 enterprise-glass flex flex-col h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 shrink-0">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Issue Categories
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-2 px-2 pt-0">
              <CategoryChart data={issueCategories} />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary bg-secondary/5 enterprise-glass flex flex-col h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 shrink-0">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Sentiment by Type
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-2 px-2 pt-0">
              <SentimentByTypeChart data={sentimentByType} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 min-h-[150px]">
        {/* Sentiment Trend */}
        <Card className="enterprise-card h-full flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 shrink-0">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Sentiment Intelligence Journey
              </CardTitle>
            </div>
            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary flex items-center gap-1 text-[10px] h-5 py-0">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              Real-time
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-0 pb-2 px-2">
            <SentimentChart data={sentimentTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
