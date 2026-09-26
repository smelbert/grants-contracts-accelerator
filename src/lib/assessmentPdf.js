// EIS Funding Readiness Assessment — Branded PDF Report Generator (jsPDF)
import { jsPDF } from 'jspdf';
import { BRAND, LOGO_URL, DR_E_SIGNATURE, LEVEL_NAMES, PROOF_STRIP } from './assessmentConfig';

const PAGE_WIDTH = 612; // 8.5in at 72dpi
const PAGE_HEIGHT = 792; // 11in at 72dpi
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function loadLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_URL;
  });
}

function addHeader(doc, y) {
  doc.setFillColor(BRAND.cream);
  doc.rect(0, 0, PAGE_WIDTH, 80, 'F');
  doc.setDrawColor(BRAND.gold);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, 72, PAGE_WIDTH - MARGIN, 72);
  return 90;
}

async function addLogoOrWordmark(doc, logoImg) {
  if (logoImg) {
    try {
      const imgWidth = 180;
      const imgHeight = 30;
      doc.addImage(logoImg, 'PNG', (PAGE_WIDTH - imgWidth) / 2, 25, imgWidth, imgHeight);
    } catch {
      doc.setFontSize(16);
      doc.setTextColor(BRAND.navy);
      doc.setFont('helvetica', 'bold');
      doc.text('ELBERT INNOVATIVE SOLUTIONS', PAGE_WIDTH / 2, 45, { align: 'center' });
    }
  } else {
    doc.setFontSize(16);
    doc.setTextColor(BRAND.navy);
    doc.setFont('helvetica', 'bold');
    doc.text('ELBERT INNOVATIVE SOLUTIONS', PAGE_WIDTH / 2, 45, { align: 'center' });
  }
}

function addFooter(doc) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(BRAND.navy);
    doc.rect(0, PAGE_HEIGHT - 40, PAGE_WIDTH, 40, 'F');
    doc.setTextColor(BRAND.gold);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Dr. Shawnté Elbert · Founder & CEO, Elbert Innovative Solutions', PAGE_WIDTH / 2, PAGE_HEIGHT - 22, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('Proprietary content protected by intellectual property law.', PAGE_WIDTH / 2, PAGE_HEIGHT - 12, { align: 'center' });
  }
}

function checkPageBreak(doc, y, needed = 60) {
  if (y > PAGE_HEIGHT - 60 - needed) {
    doc.addPage();
    return 60;
  }
  return y;
}

function wrapText(doc, text, maxWidth) {
  return doc.splitTextToSize(text, maxWidth);
}

export async function generateAssessmentPdf(results) {
  const doc = new jsPDF();
  const logoImg = await loadLogo();

  let y = addHeader(doc, 0);
  y = 95;

  // Recipient info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  const fullName = [results.first_name, results.last_name].filter(Boolean).join(' ') || 'N/A';
  doc.text(`Prepared for: ${fullName}`, MARGIN, y);
  y += 14;
  doc.text(`Organization: ${results.organization || 'N/A'}`, MARGIN, y);
  y += 14;
  doc.text(`Date: ${new Date(results.assessment_date || Date.now()).toLocaleDateString()}`, MARGIN, y);
  y += 14;
  doc.text(`Structure: ${results.structureLabel || 'N/A'}`, MARGIN, y);
  y += 20;

  // Dr. E opening message
  doc.setDrawColor(BRAND.gold);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + 30, y);
  y += 12;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'italic');
  const msgLines = wrapText(doc, results.drEMessage, CONTENT_WIDTH);
  doc.text(msgLines, MARGIN, y);
  y += msgLines.length * 12 + 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(BRAND.navy);
  doc.text(DR_E_SIGNATURE, MARGIN, y);
  y += 20;

  // Eligibility holds
  if (results.holds && results.holds.length > 0) {
    y = checkPageBreak(doc, y, 80);
    doc.setFillColor(BRAND.gold);
    doc.setDrawColor(BRAND.goldDeep);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN - 5, y - 5, CONTENT_WIDTH + 10, 20 + results.holds.length * 14, 3, 3, 'FD');
    doc.setFontSize(11);
    doc.setTextColor(BRAND.goldDeep);
    doc.setFont('helvetica', 'bold');
    doc.text('Eligibility Holds', MARGIN, y + 5);
    y += 15;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    results.holds.forEach(hold => {
      const holdLines = wrapText(doc, `• ${hold.text}`, CONTENT_WIDTH - 10);
      y = checkPageBreak(doc, y, holdLines.length * 11 + 5);
      doc.text(holdLines, MARGIN, y);
      y += holdLines.length * 11 + 3;
    });
    y += 10;
  }

  // Per-track results
  const trackKeys = Object.keys(results.trackResults);
  for (const trackKey of trackKeys) {
    const tr = results.trackResults[trackKey];
    const trackLabel = trackKey === 'grant' ? 'GRANT FUNDING' : 'PROPOSALS & CONTRACTS';
    const bandColor = tr.band.colorKey === 'green' ? [21, 128, 61] : tr.band.colorKey === 'gold' ? [126, 95, 34] : [172, 26, 91];

    y = checkPageBreak(doc, y, 120);
    doc.setFillColor(BRAND.navy);
    doc.roundedRect(MARGIN - 5, y - 5, CONTENT_WIDTH + 10, 10, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(BRAND.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(trackLabel, MARGIN, y + 2);
    y += 15;

    // Score
    doc.setFontSize(36);
    doc.setTextColor(BRAND.navy);
    doc.text(`${tr.percent}%`, MARGIN, y + 10);
    doc.setFontSize(14);
    doc.setTextColor(bandColor[0], bandColor[1], bandColor[2]);
    doc.text(tr.band.label, MARGIN + 80, y + 5);
    y += 25;

    // Band description
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    const descLines = wrapText(doc, tr.band.description, CONTENT_WIDTH);
    y = checkPageBreak(doc, y, descLines.length * 11 + 10);
    doc.text(descLines, MARGIN, y);
    y += descLines.length * 11 + 8;

    // Band interpretation
    doc.setFont('helvetica', 'italic');
    const interpLines = wrapText(doc, tr.band.interpretation, CONTENT_WIDTH);
    y = checkPageBreak(doc, y, interpLines.length * 11 + 10);
    doc.text(interpLines, MARGIN, y);
    y += interpLines.length * 11 + 10;

    // Level sub-scores
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(BRAND.navy);
    doc.text('Level Scores', MARGIN, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    tr.levelScores.forEach(ls => {
      y = checkPageBreak(doc, y, 20);
      const levelLabel = `Level ${ls.level} · ${LEVEL_NAMES[trackKey]?.[ls.level] || ''}`;
      doc.text(levelLabel, MARGIN, y);
      doc.text(`${ls.scoreString} · ${ls.percent}% · ${ls.band.label}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });
      // Bar
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(MARGIN, y + 3, CONTENT_WIDTH, 5, 1, 1, 'F');
      doc.setFillColor(BRAND.navy);
      doc.roundedRect(MARGIN, y + 3, CONTENT_WIDTH * (ls.percent / 100), 5, 1, 1, 'F');
      y += 16;
    });
    y += 10;

    // Gaps grouped by level
    const trackOpenItems = results.openItems.filter(i => i.track === trackKey);
    if (trackOpenItems.length > 0) {
      y = checkPageBreak(doc, y, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(BRAND.navy);
      doc.text('What to Work On', MARGIN, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      [1, 2, 3].forEach(level => {
        const levelItems = trackOpenItems.filter(i => i.level === level);
        if (levelItems.length === 0) return;
        y = checkPageBreak(doc, y, 20 + levelItems.length * 12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Level ${level} · ${LEVEL_NAMES[trackKey]?.[level] || ''}`, MARGIN, y);
        y += 11;
        doc.setFont('helvetica', 'normal');
        levelItems.forEach(item => {
          y = checkPageBreak(doc, y, 14);
          const prefix = item.is_gate ? '[GATE] ' : '• ';
          const itemLines = wrapText(doc, `${prefix}${item.text}`, CONTENT_WIDTH - 10);
          doc.text(itemLines, MARGIN + 5, y);
          y += itemLines.length * 11 + 2;
        });
        y += 5;
      });
      y += 10;
    }

    // Band CTA
    y = checkPageBreak(doc, y, 60);
    doc.setFillColor(BRAND.navy);
    doc.roundedRect(MARGIN - 5, y - 5, CONTENT_WIDTH + 10, 15, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(BRAND.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommended Next Step', MARGIN, y + 2);
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const ctaLines = wrapText(doc, tr.band.cta, CONTENT_WIDTH);
    y = checkPageBreak(doc, y, ctaLines.length * 11 + 10);
    doc.text(ctaLines, MARGIN, y);
    y += ctaLines.length * 11 + 15;
  }

  // Proof strip
  y = checkPageBreak(doc, y, 50);
  doc.setFillColor(BRAND.navy);
  doc.rect(MARGIN - 5, y - 5, CONTENT_WIDTH + 10, 35, 'F');
  const colWidth = CONTENT_WIDTH / 4;
  PROOF_STRIP.forEach((stat, i) => {
    const cx = MARGIN + colWidth * i + colWidth / 2;
    doc.setFontSize(11);
    doc.setTextColor(BRAND.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.stat, cx, y + 8, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    const labelLines = wrapText(doc, stat.label, colWidth - 10);
    doc.text(labelLines, cx, y + 18, { align: 'center' });
  });
  y += 45;

  // Recommended documents
  y = checkPageBreak(doc, y, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND.navy);
  doc.text('Recommended Documents for Your Structure', MARGIN, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const docs = results.recommendedDocs || [];
  const half = Math.ceil(docs.length / 2);
  for (let i = 0; i < half; i++) {
    y = checkPageBreak(doc, y, 14);
    doc.text(`✓ ${docs[i]}`, MARGIN, y);
    if (docs[i + half]) {
      doc.text(`✓ ${docs[i + half]}`, MARGIN + CONTENT_WIDTH / 2, y);
    }
    y += 12;
  }
  y += 10;

  // Next steps
  y = checkPageBreak(doc, y, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND.navy);
  doc.text('Your Prioritized Next Steps', MARGIN, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  (results.nextSteps || []).forEach((step, i) => {
    y = checkPageBreak(doc, y, 16);
    const stepLines = wrapText(doc, `${i + 1}. ${step}`, CONTENT_WIDTH - 10);
    doc.text(stepLines, MARGIN, y);
    y += stepLines.length * 11 + 4;
  });

  addFooter(doc);
  return doc;
}

export async function downloadAssessmentPdf(results) {
  const doc = await generateAssessmentPdf(results);
  const orgName = (results.organization || 'Organization').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`EIS_Funding_Readiness_${orgName}.pdf`);
}