"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, User, MessageSquare, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSpeakers } from "@/lib/api";

interface Speaker {
  speaker_name: string;
  utterance_count: number;
  participation_count: number;
}

export function SpeakerDetailModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchSpeakers()
        .then(setSpeakers)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl enterprise-glass sm:rounded-2xl border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl sunset-gradient sunset-glow text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl sunset-text">Active Speaker Intelligence</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Distribution of voices across all ingested conversations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Synthesizing speaker data...</p>
          </div>
        ) : speakers.length === 0 ? (
          <div className="py-20 text-center">
            <User className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No active speakers discovered yet.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-primary/10">
                  <TableHead className="w-[60%]">Speaker Identity</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Utterances</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {speakers.map((speaker, i) => (
                  <TableRow key={i} className="group hover:bg-primary/5 transition-colors border-primary/10">
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      <span>{speaker.speaker_name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Mic className="h-3 w-3 text-muted-foreground" />
                        {speaker.participation_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        {speaker.utterance_count}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
