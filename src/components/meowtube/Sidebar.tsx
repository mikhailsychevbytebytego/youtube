"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { channelHref } from "@/lib/channel-data";
import {
  libraryNav,
  mainNav,
  type NavItem,
} from "@/lib/meowtube-data";
import { getSidebarSubscriptions } from "@/app/subscription-actions";

function getHref(label: string) {
  switch (label) {
    case "Home":
      return "/";
    case "Shorts":
      return "/shorts";
    case "Subscriptions":
      return "/feed/subscriptions";
    case "History":
      return "/feed/history";
    default:
      return "#";
  }
}

function NavRow({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  const href = getHref(item.label);

  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-6 rounded-[10px] px-3 py-2 transition-colors ${
        isActive ? "bg-[#f2f2f2]" : "hover:bg-[#f2f2f2]"
      }`}
    >
      <span className="flex size-5 items-center justify-center text-[#0f0f0f]">
        <Icon className="size-5" />
      </span>
      <span
        className={`flex-1 text-sm text-[#0f0f0f] ${
          isActive ? "font-semibold" : "font-normal"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [dynSubs, setDynSubs] = useState<{ name: string; avatar: string; hasNotification?: boolean }[]>([]);

  useEffect(() => {
    async function loadSubs() {
      try {
        const res = await getSidebarSubscriptions();
        setDynSubs(res);
      } catch (err) {
        console.error("Failed to load sidebar subscriptions:", err);
      }
    }
    loadSubs();

    const handleSubscriptionChange = () => {
      loadSubs();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("subscription-change", handleSubscriptionChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("subscription-change", handleSubscriptionChange);
      }
    };
  }, []);

  const isWatchPage = pathname.startsWith("/watch");

  const filteredMainNav = mainNav.filter(
    (item) => item.label !== "Cat Shows" && item.label !== "Explore"
  );
  const filteredLibraryNav = libraryNav.filter((item) => item.label !== "Library");

  const getIsActive = (label: string, staticActive?: boolean) => {
    switch (label) {
      case "Home":
        return pathname === "/";
      case "Shorts":
        return pathname.startsWith("/shorts");
      case "Subscriptions":
        return pathname.startsWith("/feed/subscriptions");
      case "History":
        return pathname.startsWith("/feed/history");
      default:
        return !!staticActive;
    }
  };

  // Rail items for the collapsed mini-sidebar
  const railItems = [
    ...filteredMainNav,
    ...filteredLibraryNav.slice(0, 1),
  ];

  return (
    <>
      {/* 1. COLLAPSED MINI-SIDEBAR */}
      <aside
        className={`sticky top-14 h-[calc(100vh-3.5rem)] w-[72px] shrink-0 flex-col bg-white py-2 ${
          isWatchPage
            ? "hidden md:flex" // Always collapsed on watch page
            : "hidden md:flex xl:hidden" // Collapsed on medium/large screens for other pages
        }`}
      >
        <div className="flex w-full flex-col items-center gap-1 px-1">
          {railItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.label, item.active);
            const href = getHref(item.label);

            return (
              <Link
                key={item.label}
                href={href}
                aria-label={item.label}
                className={`flex w-full flex-col items-center justify-center rounded-lg py-3 text-[#0f0f0f] transition-colors ${
                  isActive ? "bg-[#f2f2f2]" : "hover:bg-[#f2f2f2]"
                }`}
              >
                <Icon className="size-6 shrink-0" />
                <span className="text-[10px] mt-1 font-normal line-clamp-1 w-full text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* 2. EXPANDED FULL SIDEBAR */}
      <aside
        className={`sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col gap-0 overflow-y-auto bg-white px-3 pt-3 ${
          isWatchPage
            ? "hidden" // Never expanded on watch page
            : "hidden xl:flex" // Expanded only on extra large screens for other pages
        }`}
      >
        <nav className="flex w-full flex-col gap-1">
          {filteredMainNav.map((item) => {
            const isActive = getIsActive(item.label, item.active);
            return <NavRow key={item.label} item={item} isActive={isActive} />;
          })}
        </nav>

        <hr className="my-3 border-[#e5e5e5]" />

        <nav className="flex w-full flex-col gap-1">
          {filteredLibraryNav.map((item) => {
            const isActive = getIsActive(item.label, item.active);
            return <NavRow key={item.label} item={item} isActive={isActive} />;
          })}
        </nav>

        {dynSubs.length > 0 && (
          <>
            <hr className="my-3 border-[#e5e5e5]" />

            <div className="flex w-full flex-col gap-1">
              <h2 className="px-3 py-1 text-base font-semibold text-black">Subscriptions</h2>
              {dynSubs.map((sub) => (
                <Link
                  key={sub.name}
                  href={channelHref(sub.name)}
                  className="flex w-full items-center gap-6 rounded-[10px] px-3 py-2 transition-colors hover:bg-[#f2f2f2]"
                >
                  <Image
                    src={sub.avatar}
                    alt={sub.name}
                    width={24}
                    height={24}
                    className="size-6 rounded-full object-cover shrink-0"
                  />
                  <span className="flex-1 text-sm font-normal text-[#0f0f0f] truncate">{sub.name}</span>
                  {sub.hasNotification && <span className="size-1 rounded-full bg-blue-500 shrink-0" />}
                </Link>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
