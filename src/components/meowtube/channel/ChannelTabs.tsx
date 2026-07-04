"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { channelFilters, channelTabs } from "@/lib/channel-data";

export function ChannelTabs({ activeTab: initialActiveTab, channelHandle }: { activeTab: string, channelHandle: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get('q') || '';
  
  // Normalize initial active tab to match the casing in channelTabs if possible
  const normalizedActiveTab = channelTabs.find(t => t.toLowerCase() === initialActiveTab.toLowerCase()) || (currentQ ? 'Search' : channelTabs[0]);
  
  const [activeTab, setActiveTab] = useState(normalizedActiveTab);
  const [activeFilter, setActiveFilter] = useState(channelFilters[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentQ);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab !== normalizedActiveTab) {
      setActiveTab(normalizedActiveTab);
    }
    if (currentQ && searchQuery !== currentQ) {
      setIsSearching(true);
      setSearchQuery(currentQ);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab, currentQ]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsSearching(false);
    setSearchQuery('');
    router.push(`/channel/${channelHandle}?tab=${tab.toLowerCase()}`);
  };

  const handleSearchClick = () => {
    setIsSearching(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('Search');
      router.push(`/channel/${channelHandle}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center gap-8 overflow-x-auto border-b border-border py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channelTabs.map((tab) => {
          const isActive = tab === activeTab && !isSearching;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
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
        
        {isSearching ? (
          <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 pb-3 ml-4">
            <Search className="size-5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery.trim() && !currentQ) {
                  setIsSearching(false);
                  setActiveTab(channelTabs[0]);
                }
              }}
              placeholder="Search..."
              className="bg-transparent text-sm text-foreground outline-none border-b border-foreground w-48 focus:border-b-2"
            />
          </form>
        ) : (
          <button 
            type="button" 
            aria-label="Search this channel" 
            onClick={handleSearchClick}
            className={`shrink-0 pb-3 transition-colors ${activeTab === 'Search' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Search className="size-5" />
          </button>
        )}
      </div>

      {!isSearching && activeTab !== 'About' && activeTab !== 'Search' && (
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
      )}
      
      {(activeTab === 'About' || activeTab === 'Search' || isSearching) && (
        <div className="py-3"></div>
      )}
    </div>
  );
}
