import React from 'react';

export default function PrintableWorkbookPage({ 
  title,
  subtitle,
  pageNumber,
  headerTitle = "IncubateHer Funding Readiness Workbook",
  headerSubtitle = "Preparing for Grants, Proposals & Contracts",
  headerColor = "from-[#0f766e] to-[#14b8a6]",
  footerLeft = "Elbert Innovative Solutions × Columbus Urban League",
  footerRight,
  children 
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: 8.5in 11in;
            margin: 0.75in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always;
            width: 8.5in;
            min-height: 11in;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }
        }
        .print-page {
          width: 8.5in;
          min-height: 11in;
          padding: 0.75in;
          margin: 0 auto;
          background: white;
          box-sizing: border-box;
          position: relative;
          font-family: 'Inter', sans-serif;
        }
        .header-band {
          background: linear-gradient(to right, var(--header-from), var(--header-to));
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .footer-band {
          position: absolute;
          bottom: 0.5in;
          left: 0.75in;
          right: 0.75in;
          font-size: 10px;
          color: #6b7280;
          display: flex;
          justify-content: space-between;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .body-text {
          font-size: 12px;
          line-height: 1.6;
          color: #111827;
        }
        @media screen {
          .print-page {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
        }
      `}} />

      <div 
        className="print-page bg-white shadow-2xl mx-auto"
        style={{
          '--header-from': headerColor.includes('from-[') 
            ? headerColor.match(/from-\[(.*?)\]/)?.[1] || '#0f766e'
            : '#0f766e',
          '--header-to': headerColor.includes('to-[')
            ? headerColor.match(/to-\[(.*?)\]/)?.[1] || '#14b8a6'
            : '#14b8a6'
        }}
      >
        {/* Header Band */}
        <div className="header-band">
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
            {headerTitle}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            {headerSubtitle}
          </div>
          {title && (
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              marginTop: '12px', 
              borderTop: '1px solid rgba(255,255,255,0.3)', 
              paddingTop: '12px' 
            }}>
              {title}
            </div>
          )}
          {subtitle && (
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.85 }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="body-text" style={{ paddingBottom: '60px' }}>
          {children}
        </div>

        {/* Footer Band */}
        <div className="footer-band">
          <div>{footerLeft}</div>
          <div>{footerRight || (pageNumber ? `Page ${pageNumber}` : '')}</div>
        </div>
      </div>
    </>
  );
}