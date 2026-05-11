"use client";

import * as React from "react";
import {
  BarChart3,
  Database,
  FileText,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Search,
  ShieldCheck,
  Zap,
  Sparkles,
  Star,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const GeminiIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3c.1 3.2 2.7 5.8 5.9 5.9-3.2.1-5.8 2.7-5.9 5.9-.1-3.2-2.7-5.8-5.9-5.9 3.2-.1 5.8-2.7 5.9-5.9z" fill="currentColor" stroke="none" />
    <path d="M18 4.5c.1 1.6 1.3 2.8 2.9 2.9-1.6.1-2.8 1.3-2.9 2.9-.1-1.6-1.3-2.8-2.9-2.9 1.6-.1 2.8-1.3 2.9-2.9z" fill="currentColor" stroke="none" opacity="0.6" />
  </svg>
);

const data = {
  navMain: [
    {
      title: "Core Requirements",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Transcript Pipeline",
          url: "/pipeline",
          icon: GitBranch,
        },
      ],
    },
    {
      title: "Analysis & Insights",
      items: [
        {
          title: "Topic Categorization",
          url: "/topics",
          icon: Search,
          isAI: true,
        },
        {
          title: "Sentiment Analysis",
          url: "/sentiment",
          icon: Zap,
          isAI: true,
        },
        {
          title: "Feature Gap Analysis",
          url: "/gaps",
          icon: BarChart3,
          isAI: true,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Call Logs",
          url: "/conversations",
          icon: MessageSquare,
        },
        {
          title: "Validation Layer",
          url: "/validation",
          icon: ShieldCheck,
          isAI: true,
        },
        {
          title: "Anomaly Monitor",
          url: "/monitor",
          icon: Database,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl sunset-gradient sunset-glow text-white">
            <GeminiIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-xl tracking-tight sunset-text">TIP</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">Intelligence AI</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<Link href={item.url} />}
                      isActive={pathname === item.url}
                      className={`transition-all duration-200 ${
                        pathname === item.url 
                          ? "bg-primary/10 text-primary font-semibold border-l-4 border-l-primary rounded-none" 
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${pathname === item.url ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{item.title}</span>
                      {item.isAI && (
                        <GeminiIcon className="ml-auto h-4 w-4 text-primary animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
