"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatTL } from "@/lib/money";

type Row = { date: Date; day: number; amount: number };

const axisNumber = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const dayLabel = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "short" });

export default function DailySpendingChart({ data, dailyBudget }: { data: Row[]; dailyBudget: number }) {
  return (
    <div className="wish-chart h-56 w-full" role="img" aria-label="Günlük harcama grafiği">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="0" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value) => axisNumber.format(Number(value) / 100)}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-hover)" }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as Row | undefined;
              return row ? dayLabel.format(new Date(row.date)) : "";
            }}
            formatter={(value) => [formatTL(Number(value)), "Harcama"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--ink)",
              fontSize: 13,
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
            }}
            itemStyle={{ color: "var(--ink)" }}
            labelStyle={{ color: "var(--muted)", marginBottom: 2 }}
          />
          {dailyBudget > 0 && (
            <ReferenceLine
              y={dailyBudget}
              strokeDasharray="4 4"
              label={{ value: "Günlük bütçe", position: "insideTopRight", fontSize: 11 }}
            />
          )}
          <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
