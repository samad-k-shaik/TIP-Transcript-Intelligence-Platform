"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, TrendingDown, Users } from "lucide-react";
import { useState } from "react";
import { SpeakerDetailModal } from "./speaker-detail-modal";

interface KPI {
  label: string;
  value: string;
  description: string;
  trend: "up" | "down" | "neutral";
}

export function KPICards({ stats }: { stats: KPI[] }) {
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        {stats.map((kpi, i) => {
          const isActiveSpeakers = kpi.label === "Active Speakers";
          
          return (
            <Card 
              key={i} 
              className={`enterprise-glass transition-all duration-300 py-1 ${
                isActiveSpeakers 
                  ? "hover:sunset-glow hover:border-primary/50 cursor-pointer group" 
                  : "hover:bg-primary/5"
              }`}
              onClick={() => isActiveSpeakers && setIsSpeakerModalOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </CardTitle>
                {isActiveSpeakers ? (
                  <Users className={`h-4 w-4 text-primary transition-transform group-hover:scale-110`} />
                ) : kpi.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : kpi.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                ) : (
                  <Zap className="h-4 w-4 text-amber-500" />
                )}
              </CardHeader>
              <CardContent className="pb-3 px-4">
                <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {isActiveSpeakers ? "Click to view speakers" : kpi.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SpeakerDetailModal 
        isOpen={isSpeakerModalOpen} 
        onClose={() => setIsSpeakerModalOpen(false)} 
      />
    </>
  );
}
