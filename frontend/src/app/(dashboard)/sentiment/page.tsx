import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SentimentChart } from "@/components/charts/overview-charts";
import { AlertCircle, Smile, Frown, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { fetchSentiment } from "@/lib/api";
import { InteractiveCard } from "@/components/ui/card-modal";

export default async function SentimentPage() {
  const sentimentTrend = await fetchSentiment();

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden pb-2 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sunset-text flex items-center gap-2">
            Sentiment Intelligence Center
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analyzing emotional and operational trends across all customer touchpoints.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs py-0.5 px-2">
            Overall: Positive (74/100)
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-3 shrink-0">
        <Card className="enterprise-card border-t-4 border-t-emerald-500 py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-muted-foreground">
              <Smile className="h-4 w-4 text-emerald-500" />
              Positive Sentiment
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold">62%</span>
            <span className="text-[10px] text-emerald-500 font-medium">+4% from last week</span>
          </div>
        </Card>

        <Card className="enterprise-card border-t-4 border-t-amber-500 py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Neutral / Mixed
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold">28%</span>
            <span className="text-[10px] text-amber-500 font-medium">-2% from last week</span>
          </div>
        </Card>

        <Card className="enterprise-card border-t-4 border-t-rose-500 py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-muted-foreground">
              <Frown className="h-4 w-4 text-rose-500" />
              Frustration / Negative
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold">10%</span>
            <span className="text-[10px] text-rose-500 font-medium">-2% from last week</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Chart */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Sentiment Journey Timeline Chart */}
        <Card className="enterprise-card flex flex-col h-full overflow-hidden">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Sentiment Journey Timeline
            </CardTitle>
            <CardDescription className="text-xs">
              Visualizing emotional resonance across the recursive processing timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-0 pb-3 px-3">
            <SentimentChart data={sentimentTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
