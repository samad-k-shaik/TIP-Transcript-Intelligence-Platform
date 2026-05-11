"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Database, FileX, Info, ShieldAlert, Sparkles } from "lucide-react";

const anomalies = [
  {
    id: "ANOM-8821",
    type: "Schema Mismatch",
    severity: "High",
    node: "Schema Classifier",
    source: "zoom_export_v2.json",
    status: "Investigating",
  },
  {
    id: "ANOM-8819",
    type: "PII Leakage",
    severity: "Critical",
    node: "PII Redactor",
    source: "intercom_chat_992.csv",
    status: "Blocked",
  },
  {
    id: "ANOM-8815",
    type: "Speaker Ambiguity",
    severity: "Medium",
    node: "Speaker Resolver",
    source: "gong_recording_04.wav",
    status: "Auto-Resolved",
  },
  {
    id: "ANOM-8812",
    type: "Format Error",
    severity: "Low",
    node: "Transcript Parser",
    source: "legacy_system_dump.txt",
    status: "Logged",
  },
];

export default function MonitorPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sunset-text flex items-center gap-2">
          Anomaly Intelligence Monitor
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time detection of pipeline irregularities and data quality issues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Alerts", value: "14", icon: AlertCircle, color: "text-rose-500" },
          { label: "Critical Blocks", value: "2", icon: ShieldAlert, color: "text-orange-500" },
          { label: "Data Dropouts", value: "0", icon: FileX, color: "text-emerald-500" },
          { label: "System Health", value: "98.2%", icon: Database, color: "text-primary" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Pipeline Anomalies</CardTitle>
          <CardDescription>
            Detailed view of issues detected during the ingestion and processing phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anomaly ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Pipeline Node</TableHead>
                <TableHead>Source Reference</TableHead>
                <TableHead>System Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.type}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={a.severity === "Critical" ? "destructive" : "outline"}
                      className={a.severity === "High" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : ""}
                    >
                      {a.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.node}</TableCell>
                  <TableCell className="text-muted-foreground italic text-sm">{a.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm">{a.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Info className="h-4 w-4" />
          How are anomalies detected? View documentation
        </button>
      </div>
    </div>
  );
}
