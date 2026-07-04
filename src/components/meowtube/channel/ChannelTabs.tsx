"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { channelFilters, channelTabs } from "@/lib/channel-data";

export function ChannelTabs() {
  const [activeTab, setActiveTab] = useState(channelTabs[0]);
  const [activeFilter, setActiveFilter] = useState(channelFilters[0]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center gap-8 overflow-x-auto border-b border-border py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channelTabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 pb-3 text-base transition-colors ${
                isActive
                  ? "border-b-2 border-foreground font-semibold text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          );
        })}
        <button type="button" aria-label="Search this channel" className="shrink-0 pb-3 text-foreground">
          <Search className="size-5" />
        </button>
      </div>

      <div className="flex w-full gap-3 py-6">
        {channelFilters.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:bg-hover"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
