'use client';
// ============================================================================
// VantageFin Pro — Spending Heatmap
// ============================================================================

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { generateHeatmapData } from '@/lib/finance-engine';
import { formatCurrency } from '@/lib/constants';

export default function SpendingHeatmap() {
  const { transactions, selectedMonth } = useFinanceStore();

  const heatData = useMemo(
    () => generateHeatmapData(transactions, selectedMonth.year, selectedMonth.month),
    [transactions, selectedMonth]
  );

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfWeek = new Date(selectedMonth.year, selectedMonth.month, 1).getDay();

  // Build calendar grid
  const grid: (typeof heatData[0] | null)[][] = [];
  let week: (typeof heatData[0] | null)[] = new Array(firstDayOfWeek).fill(null);

  heatData.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  });
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }

  const getHeatColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(30, 41, 59, 0.5)';
    if (intensity < 0.25) return 'rgba(59, 130, 246, 0.3)';
    if (intensity < 0.5) return 'rgba(59, 130, 246, 0.5)';
    if (intensity < 0.75) return 'rgba(245, 158, 11, 0.6)';
    return 'rgba(239, 68, 68, 0.7)';
  };

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">🔥 Daily Spending Heatmap</h3>
      </div>
      <div className="chart-card__body">
        <div className="heatmap">
          <div className="heatmap__header">
            {dayNames.map((d) => (
              <span key={d} className="heatmap__day-name">{d}</span>
            ))}
          </div>
          <div className="heatmap__grid">
            {grid.map((weekRow, wi) => (
              <div key={wi} className="heatmap__week">
                {weekRow.map((day, di) => (
                  <div
                    key={di}
                    className={`heatmap__cell ${day ? '' : 'heatmap__cell--empty'}`}
                    style={day ? { backgroundColor: getHeatColor(day.intensity) } : undefined}
                    title={day ? `Day ${day.day}: ${formatCurrency(day.amount)}` : ''}
                  >
                    {day && <span className="heatmap__cell-day">{day.day}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="heatmap__legend">
            <span>Less</span>
            <div className="heatmap__legend-scale">
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <div key={v} className="heatmap__legend-block" style={{ backgroundColor: getHeatColor(v) }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
