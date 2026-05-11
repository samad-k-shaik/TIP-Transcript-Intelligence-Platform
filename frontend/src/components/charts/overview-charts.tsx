"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export function SentimentChart({ data }: { data: any[] }) {
  return (
    <div className="h-full w-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              backdropFilter: "blur(8px)",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={4}
            dot={{ fill: "var(--primary)", strokeWidth: 0, r: 5 }}
            activeDot={{ r: 8, strokeWidth: 0, fill: "var(--secondary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({ data }: { data: any[] }) {
  return (
    <div className="h-full w-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="category"
            type="category"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--accent) / 0.1" }}
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              backdropFilter: "blur(8px)",
            }}
          />
          <Bar dataKey="count" radius={[0, 10, 10, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "var(--primary)" : "var(--secondary)"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function SentimentByTypeChart({ data }: { data: any[] }) {
  return (
    <div className="h-full w-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="call_type"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          />
          <Bar dataKey="avg_score" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.call_type === "customer support calls" ? "#f43f5e" : 
                  entry.call_type === "external calls" ? "#0ea5e9" : 
                  "#8b5cf6"
                }
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
