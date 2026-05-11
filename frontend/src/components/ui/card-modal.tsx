"use client";

import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InteractiveCardProps {
  children: ReactNode;
  title: string;
  description?: string;
  detailContent?: ReactNode;
}

export function InteractiveCard({ children, title, description, detailContent }: InteractiveCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ring-offset-background hover:ring-2 hover:ring-primary/50 rounded-xl h-full"
        onClick={() => setIsOpen(true)}
      >
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-xl border-primary/20 enterprise-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl sunset-text">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              {title} - AI Deep Dive
            </DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4 mt-4">
            {detailContent || (
              <div className="p-4 rounded-lg bg-primary/5 border text-sm text-muted-foreground flex items-center justify-center h-32">
                Detailed intelligence context is being aggregated...
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
