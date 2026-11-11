import React from "react";

/**
 * Small all-caps gold section kicker shown above headings.
 * Use `onDark` on navy/teal surfaces.
 */
export default function SectionKicker({ children, onDark = false, className = "" }) {
  return (
    <span className={`${onDark ? "kicker-on-dark" : "kicker"} ${className}`}>
      {children}
    </span>
  );
}