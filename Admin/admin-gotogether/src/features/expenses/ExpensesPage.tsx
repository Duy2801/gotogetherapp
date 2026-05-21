"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchDashboard, fetchTrips } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { mockDashboard, mockTrips } from "@/lib/mock-data";
import type { DashboardSummary, TripListItem } from "@/lib/types";

export default function ExpensesPage() {
  const [summary, setSummary] = useState<DashboardSummary>(mockDashboard);
  const [trips, setTrips] = useState<TripListItem[]>(mockTrips);

  useEffect(() => {
    fetchDashboard().then(setSummary).catch(() => setSummary(mockDashboard));
    fetchTrips().then((result) => setTrips(result.items)).catch(() => setTrips(mockTrips));
  }, []);

  return (
    <div className="page-stack">
      <PageHeader title="Chi tiêu" description="Theo dõi xu hướng chi, danh mục nổi bật và áp lực ngân sách." actionLabel="Mở phân tích" actionHref="/expenses/analytics" />

      <section className="metrics-grid">
        <article className="stat-card">
          <div className="stat-card__label">Chi trong tháng</div>
          <div className="stat-card__value">{formatCurrency(summary.totalExpenses)}</div>
          <div className="stat-card__footer">Tháng hiện tại trên dashboard</div>
        </article>
        <article className="stat-card">
          <div className="stat-card__label">Ngân sách theo dõi</div>
          <div className="stat-card__value">{formatCurrency(summary.totalBudget)}</div>
          <div className="stat-card__footer">Ngân sách danh nghĩa của toàn hệ thống</div>
        </article>
        <article className="stat-card">
          <div className="stat-card__label">Danh mục nổi bật</div>
          <div className="stat-card__value">{summary.topCategories.length}</div>
          <div className="stat-card__footer">Nhóm đang chi phối cơ cấu chi phí</div>
        </article>
        <article className="stat-card">
          <div className="stat-card__label">Chuyến trong phạm vi</div>
          <div className="stat-card__value">{trips.length}</div>
          <div className="stat-card__footer">Các chuyến dùng để phân tích</div>
        </article>
      </section>

      <div className="grid-2">
        <Card title="Danh mục nổi bật" subtitle="Mức tập trung chi tiêu">
          <div className="bar-list">
            {summary.topCategories.map((category) => (
              <div className="bar-item" key={category.id}>
                <div className="bar-item__label">
                  <strong>{category.name}</strong>
                  <span>{formatCurrency(category.totalAmount)}</span>
                </div>
                <div className="bar-item__track"><div className="bar-item__fill" style={{ width: `${Math.min(100, category.totalAmount / 500000)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Chi tiêu theo chuyến" subtitle="Các chuyến đang tạo áp lực chi phí">
          <div className="list">
            {trips.map((trip) => (
              <div className="list__row" key={trip.id}>
                <div className="span-5">
                  <strong>{trip.name}</strong>
                  <div className="muted">{trip.status}</div>
                </div>
                <div className="span-4">{formatCurrency(trip.expenseTotal)}</div>
                <div className="span-3">
                  <Link className="chip" href={`/trips/${trip.id}`}>Mở</Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}