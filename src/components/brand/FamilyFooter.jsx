import React from "react";

const EIS_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png";

const PLATFORMS = [
  { label: "Funding-Ready by Design", href: "#", isCurrent: true },
  { label: "EM-Power'D Collective", href: "#", isCurrent: false },
  { label: "Dr. E Speaks!", href: "#", isCurrent: false },
];

/**
 * Small EIS logo on a cream badge so the navy lettering stays readable on dark.
 */
export function EISLogo({ className = "h-10" }) {
  return (
    <img
      src={EIS_LOGO}
      alt="Elbert Innovative Solutions"
      className={`${className} w-auto rounded-md bg-[#F9F4EF] p-1.5`}
    />
  );
}

/**
 * Shared footer for public pages.
 */
export default function FamilyFooter({ className = "" }) {
  return (
    <footer className={`bg-[#0F2E40] text-white/65 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <EISLogo />
            <p className="mt-4 font-heading text-2xl font-bold text-white">
              Elbert Innovative Solutions
            </p>
            <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-[#C89A45]">
              Excellence in Every Endeavor · Columbus, Ohio
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#C89A45]">
              Our platforms
            </h4>
            <ul className="space-y-2 font-body text-sm">
              {PLATFORMS.map((platform) => (
                <li key={platform.label}>
                  <a
                    href={platform.href}
                    className={
                      platform.isCurrent
                        ? "font-semibold text-[#C89A45] underline decoration-[#C89A45] underline-offset-4"
                        : "text-white/65 transition-colors hover:text-[#C89A45]"
                    }
                  >
                    {platform.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#C89A45]">
              Contact
            </h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <a
                  href="mailto:drelbert@elbertinnovativesolutions.org"
                  className="transition-colors hover:text-[#C89A45]"
                >
                  drelbert@elbertinnovativesolutions.org
                </a>
              </li>
              <li>
                <a href="tel:6143000098" className="transition-colors hover:text-[#C89A45]">
                  614-300-0098
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center font-body text-xs text-white/45">
          © {new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}