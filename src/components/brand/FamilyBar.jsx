import React from "react";

export const EIS_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png";

const PLATFORMS = [
  { label: "Funding-Ready by Design", href: "#", isCurrent: true },
  { label: "EM-Power'D Collective", href: "#", isCurrent: false },
  { label: "Dr. E Speaks!", href: "#", isCurrent: false },
];

/**
 * Thin EIS family strip pinned to the very top of every page.
 */
export default function FamilyBar({ className = "" }) {
  return (
    <div className={`bg-[#0F2E40] ${className}`}>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <img
            src={EIS_LOGO}
            alt="Elbert Innovative Solutions"
            className="h-5 w-auto shrink-0 rounded-[3px] bg-[#F9F4EF] px-1 py-0.5"
          />
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/60">
            An Elbert Innovative Solutions platform
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {PLATFORMS.map((platform) => (
            <a
              key={platform.label}
              href={platform.href}
              className={
                platform.isCurrent
                  ? "border-b-2 border-[#C89A45] pb-0.5 font-body text-[11px] font-bold text-[#C89A45]"
                  : "font-body text-[11px] text-white/60 transition-colors hover:text-[#C89A45]"
              }
            >
              {platform.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}