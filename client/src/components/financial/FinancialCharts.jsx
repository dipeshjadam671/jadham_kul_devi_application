import React, { useState } from 'react';
import { formatINR } from '../../utils/formatters';

/**
 * Monthly Financial Comparison Bar Chart
 * Pure SVG component - No external charting dependencies needed
 * Displays: Total Income (Donations + Other Income) vs Total Expenses per month
 */
export const MonthlyFinancialBarChart = ({ data = [], year }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500">
        वित्तीय डेटा उपलब्ध नहीं है (No financial data available for {year})
      </div>
    );
  }

  // Calculate maximum value for dynamic SVG scale
  const maxVal = Math.max(
    ...data.map((m) => Math.max(m.income || 0, m.expense || 0)),
    10000 // minimum ceiling
  );

  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingBottom = 40;
  const paddingTop = 20;
  const usableHeight = chartHeight - paddingTop - paddingBottom;
  const barGroupWidth = (chartWidth - paddingX * 2) / 12;
  const barWidth = Math.max(6, barGroupWidth * 0.35);

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-800">
            मासिक आय एवं व्यय तुलना ({year})
          </h3>
          <p className="text-xs text-stone-500">
            माहवार कुल आय (दान + अन्य) एवं मंदिर व्यय का तुलनात्मक चार्ट
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-600"></span>
            <span className="text-stone-700">कुल आय (Income)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-500"></span>
            <span className="text-stone-700">कुल व्यय (Expense)</span>
          </div>
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-64 w-full min-w-[600px]"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + usableHeight * (1 - pct);
            const labelVal = Math.round(maxVal * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={pct > 0 ? '3,3' : 'none'}
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-stone-400 text-[9px] font-sans"
                >
                  ₹{labelVal >= 1000 ? `${(labelVal / 1000).toFixed(0)}k` : labelVal}
                </text>
              </g>
            );
          })}

          {/* Monthly Bars */}
          {data.map((m, index) => {
            const groupX = paddingX + index * barGroupWidth;
            const centerX = groupX + barGroupWidth / 2;

            const incomeHeight = (m.income / maxVal) * usableHeight;
            const expenseHeight = (m.expense / maxVal) * usableHeight;

            const incomeY = paddingTop + (usableHeight - incomeHeight);
            const expenseY = paddingTop + (usableHeight - expenseHeight);

            const isHovered = hoveredMonth === m.monthNumber;

            return (
              <g
                key={m.monthNumber}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredMonth(m.monthNumber)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={groupX + 2}
                    y={paddingTop}
                    width={barGroupWidth - 4}
                    height={usableHeight}
                    fill="#f8fafc"
                    rx="4"
                  />
                )}

                {/* Income Bar */}
                <rect
                  x={centerX - barWidth - 1}
                  y={incomeY}
                  width={barWidth}
                  height={Math.max(2, incomeHeight)}
                  fill="#059669"
                  rx="3"
                  className="transition-all hover:fill-emerald-700"
                />

                {/* Expense Bar */}
                <rect
                  x={centerX + 1}
                  y={expenseY}
                  width={barWidth}
                  height={Math.max(2, expenseHeight)}
                  fill="#d97706"
                  rx="3"
                  className="transition-all hover:fill-amber-600"
                />

                {/* Month label */}
                <text
                  x={centerX}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-sans transition-colors ${
                    isHovered ? 'fill-emerald-800 font-bold' : 'fill-stone-500'
                  }`}
                >
                  {m.month.slice(0, 3)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Month Tooltip Card */}
        {hoveredMonth && (
          (() => {
            const item = data.find((d) => d.monthNumber === hoveredMonth);
            if (!item) return null;
            return (
              <div className="absolute right-4 top-2 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
                <p className="font-semibold text-stone-800">
                  {item.month} ({item.monthHindi})
                </p>
                <div className="mt-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between gap-4 text-emerald-700">
                    <span>कुल आय (Income):</span>
                    <span className="font-semibold">{formatINR(item.income)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-amber-700">
                    <span>कुल व्यय (Expense):</span>
                    <span className="font-semibold">{formatINR(item.expense)}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-1 text-xs">
                    <span className="text-stone-500">निवल बचत (Net): </span>
                    <span
                      className={`font-bold ${
                        item.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatINR(item.balance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
