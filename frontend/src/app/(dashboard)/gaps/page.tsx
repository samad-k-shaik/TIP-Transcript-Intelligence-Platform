import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, TrendingUp, Users, Clock, Sparkles } from "lucide-react";
import { InteractiveCard } from "@/components/ui/card-modal";
import { fetchGaps } from "@/lib/api";

export default async function FeatureGapsPage() {
  const gaps = await fetchGaps();

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden pb-2 min-h-0">
      <div>
        <h2 className="text-3xl font-bold tracking-tight sunset-text flex items-center gap-2">
          Feature Gap Intelligence
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </h2>
        <p className="text-muted-foreground mt-1">
          Identifying unmet customer needs and high-impact product opportunities.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 pb-4">
        <div className="grid gap-6 md:grid-cols-2">
          {gaps.map((gap: any) => (
            <InteractiveCard
              key={gap.id}
              title={gap.title}
              description={`Impact Level: ${gap.impact}`}
              detailContent={
                <div className="flex flex-col gap-4 p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs uppercase tracking-wider">
                      {gap.theme}
                    </Badge>
                    <Badge variant={gap.impact === "Critical" ? "destructive" : "secondary"}>
                      {gap.impact} Impact
                    </Badge>
                  </div>
                  <div className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase text-muted-foreground">Demand Signal</p>
                      <div className="flex items-center gap-3">
                        <Progress value={gap.demand} className="h-2 flex-1" />
                        <span className="text-sm font-bold w-12">{gap.demand}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase text-muted-foreground">Frustration Index</p>
                      <div className="flex items-center gap-3">
                        <Progress value={gap.frustration} className="h-2 flex-1" />
                        <span className="text-sm font-bold w-12">{gap.frustration}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" /> AI Context
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      This feature gap was identified across {gap.occurrences} interactions. Based on semantic clustering of user utterances, addressing this capability is projected to significantly reduce support escalations related to {gap.theme.toLowerCase()}.
                    </p>
                  </div>
                </div>
              }
            >
              <Card className="enterprise-card overflow-hidden h-full flex flex-col hover:shadow-lg transition-all border-primary/10 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider mb-2">
                        {gap.theme}
                      </Badge>
                      <CardTitle>{gap.title}</CardTitle>
                    </div>
                    <Badge variant={gap.impact === "Critical" ? "destructive" : gap.impact === "High" ? "default" : "secondary"}>
                      {gap.impact}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col justify-end">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Demand</p>
                      <div className="flex items-center gap-2">
                        <Progress value={gap.demand} className="h-1.5" />
                        <span className="text-xs font-bold">{gap.demand}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Frustration</p>
                      <div className="flex items-center gap-2">
                        <Progress value={gap.frustration} className="h-1.5" />
                        <span className="text-xs font-bold">{gap.frustration}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Mentions</p>
                      <p className="text-sm font-bold">{gap.occurrences}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{Math.floor(gap.occurrences * 0.8)} accounts</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Live Intel</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-primary flex items-center gap-1">
                      Details <TrendingUp className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </InteractiveCard>
          ))}
        </div>

        <Card className="enterprise-card bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              PM Intelligence Recommendation
            </CardTitle>
            <CardDescription>Synthesized opportunity scoring for product roadmap planning.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 leading-relaxed">
              "Automating **Proactive Usage Alerts** should be the #1 priority for Q3. While demand is high for multiple features, the billing-related frustration currently accounts for 42% of support ticket escalations. Implementing this single feature could reduce operational costs by an estimated $120k/month by diverting automated billing inquiries."
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
