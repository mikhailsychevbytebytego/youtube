"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { channelFilters, channelTabs } from "@/lib/channel-data";

export function ChannelTabs() {
  const [activeTab, setActiveTab] = useState(channelTabs[0]);
  const [activeFilter, setActiveFilter] = useState(channelFilters[0]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center gap-8 overflow-x-auto border-b border-[#e5e5e5] py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channelTabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 pb-3 text-base transition-colors ${
                isActive
                  ? "border-b-2 border-[#0f0f0f] font-semibold text-[#0f0f0f]"
                  : "font-medium text-[#606060] hover:text-[#0f0f0f]"
              }`}
            >
              {tab}
            </button>
          );
        })}
        <button type="button" aria-label="Search this channel" className="shrink-0 pb-3 text-[#0f0f0f]">
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
                  ? "bg-[#0f0f0f] text-white"
                  : "bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e8e8e8]"
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
