import React from "react";

/**
 * Funding-Ready by Design™ wordmark with the EIS signature line.
 * `onDark` renders light text with gold signature (for navy surfaces).
 */
export default function Wordmark({ onDark = false, align = "center", logoClassName = "h-11", className = "" }) {
  return (
    <div className={`flex flex-col gap-2 ${align === "center" ? "items-center text-center" : "items-start text-left"} ${className}`}>
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png"
        alt="Elbert Innovative Solutions"
        className={`${logoClassName} w-auto rounded-md ${onDark ? "bg-[#F9F4EF] p-1.5" : ""}`}
      />
      <div>
        <p className={`font-heading text-[20px] font-bold leading-[1.05] ${onDark ? "text-white" : "text-[#143A50]"}`}>
          Funding-Ready by Design
          <span className="text-[#C89A45]">™</span>
        </p>
        <p className="mt-1 font-body text-[9px] font-bold uppercase tracking-[0.22em] text-[#C89A45]">
          By Elbert Innovative Solutions
        </p>
      </div>
    </div>
  );
}