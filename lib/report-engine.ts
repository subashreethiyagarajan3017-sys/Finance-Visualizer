// ============================================================================
// VantageFin Pro — PDF Report Generator
// ============================================================================

import jsPDF from 'jspdf';
import { Transaction, BudgetSummary, CategoryTotal } from './types';
import { formatCurrency, getMonthLabel } from './constants';

export function generateFinancialReport(
  companyName: string,
  monthlyBudget: number,
  transactions: Transaction[],
  summary: BudgetSummary,
  year: number,
  month: number
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // ── Header ───────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VantageFin Pro', margin, yPos + 5);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Financial Report', margin, yPos + 15);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const monthLabel = getMonthLabel(new Date(year, month, 1));
  doc.text(monthLabel, pageWidth - margin, yPos + 5, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyName, pageWidth - margin, yPos + 15, { align: 'right' });

  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPos + 22, { align: 'right' });

  yPos = 55;

  // ── Budget Overview ──────────────────────
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Budget Overview', margin, yPos);
  yPos += 10;

  const overviewData = [
    ['Monthly Budget', formatCurrency(summary.totalBudget)],
    ['Total Income', formatCurrency(summary.totalIncome)],
    ['Total Expenses', formatCurrency(summary.totalExpenses)],
    ['Remaining', formatCurrency(summary.remaining)],
    ['Budget Used', `${summary.percentUsed.toFixed(1)}%`],
  ];

  doc.setFontSize(10);
  overviewData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin, yPos);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(value, margin + 80, yPos);
    yPos += 7;
  });

  yPos += 10;

  // ── Category Breakdown ─────────────────
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Category Breakdown', margin, yPos);
  yPos += 10;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Category', margin + 3, yPos);
  doc.text('Amount', margin + 75, yPos);
  doc.text('% of Total', margin + 110, yPos);
  doc.text('Transactions', margin + 140, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  summary.categoryBreakdown.forEach((cat: CategoryTotal) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(cat.category, margin + 3, yPos);
    doc.text(formatCurrency(cat.amount), margin + 75, yPos);
    doc.text(`${cat.percentage.toFixed(1)}%`, margin + 110, yPos);
    doc.text(String(cat.count), margin + 150, yPos);
    yPos += 7;
  });

  yPos += 10;

  // ── Transaction List ───────────────────
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Transactions', margin, yPos);
  yPos += 10;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date', margin + 3, yPos);
  doc.text('Description', margin + 30, yPos);
  doc.text('Category', margin + 90, yPos);
  doc.text('Type', margin + 130, yPos);
  doc.text('Amount', margin + 150, yPos);
  yPos += 8;

  const monthTxns = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  monthTxns.forEach((txn) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(51, 65, 85);
    const dateStr = new Date(txn.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    doc.text(dateStr, margin + 3, yPos);
    doc.text(txn.description.substring(0, 30), margin + 30, yPos);
    doc.text(txn.category, margin + 90, yPos);

    if (txn.type === 'income') {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(txn.type.toUpperCase(), margin + 130, yPos);
    doc.text(formatCurrency(txn.amount), margin + 150, yPos);
    yPos += 6;
  });

  // ── Footer ─────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `VantageFin Pro • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `VantageFin_Report_${monthLabel.replace(' ', '_')}.pdf`;
  doc.save(fileName);
}
