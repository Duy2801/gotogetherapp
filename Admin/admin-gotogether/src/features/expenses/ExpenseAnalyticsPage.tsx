"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchDashboard } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { mockDashboard } from "@/lib/mock-data";
import type { DashboardSummary } from "@/lib/types";

export default function ExpenseAnalyticsPage() {
  const [summary, setSummary] = useState<DashboardSummary>(mockDashboard);

  useEffect(() => {
    fetchDashboard().then(setSummary).catch(() => setSummary(mockDashboard));
  }, []);

  return (
    <div className="page-stack">
      <PageHeader title="Phân tích chi tiêu" description="Góc nhìn sâu hơn về cân bằng danh mục, điểm đến và cường độ chi phí." />

      <div className="grid-3">
        <Card title="Xu hướng tháng" subtitle="Rút ra từ bộ dữ liệu hiện tại">
          <div className="bar-list">
            {summary.topCategories.map((category, index) => (
              <div className="bar-item" key={category.id}>
                <div className="bar-item__label">
                  <strong>{index + 1}. {category.name}</strong>
                  <span>{formatCurrency(category.totalAmount)}</span>
                </div>
                <div className="bar-item__track">
                  <div className="bar-item__fill" style={{ width: `${Math.min(100, 30 + index * 24)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Phân bổ danh mục" subtitle="Tỉ lệ phần trăm theo tổng chi">
          <div className="bar-list">
            {summary.topCategories.map((category) => (
              <div key={category.id} className="bar-item">
                <div className="bar-item__label">
                  <strong>{category.name}</strong>
                  <span>{Math.round((category.totalAmount / summary.totalExpenses) * 100)}%</span>
                </div>
                <div className="bar-item__track">
                  <div className="bar-item__fill" style={{ width: `${Math.round((category.totalAmount / summary.totalExpenses) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="So sánh chuyến" subtitle="Các trung tâm chi tiêu lớn nhất">
          <div className="bar-list">
            {summary.topTrips.map((trip) => (
              <div key={trip.id} className="bar-item">
                <div className="bar-item__label">
                  <strong>{trip.name}</strong>
                  <span>{formatCurrency(trip.expenseTotal)}</span>
                </div>
                <div className="bar-item__track">
                  <div className="bar-item__fill" style={{ width: `${Math.min(100, trip.expenseTotal / 250000)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}