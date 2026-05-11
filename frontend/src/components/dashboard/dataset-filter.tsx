"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { FolderTree } from "lucide-react";

interface DatasetFilterProps {
  initialDatasets: string[];
  currentDataset: string;
}

export function DatasetFilter({ initialDatasets, currentDataset }: DatasetFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleDatasetChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("dataset", value);
    } else {
      params.delete("dataset");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-card/60 backdrop-blur-md border border-white/20">
      <FolderTree className="h-4 w-4 text-primary" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Dataset:</span>
      <Select
        options={initialDatasets}
        value={currentDataset}
        onChange={handleDatasetChange}
        placeholder="Default (All)"
        className="w-48"
      />
    </div>
  );
}
