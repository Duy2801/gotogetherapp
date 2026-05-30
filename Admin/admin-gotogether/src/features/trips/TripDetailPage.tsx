"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchTripDetail } from "@/lib/api";
import { formatCurrency, formatLongDate, formatShortDate } from "@/lib/format";
import type { TripDetail } from "@/lib/types";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    fetchTripDetail(params.id)
      .then((data) => {
        setTrip(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được chuyến đi."));
  }, [params?.id]);

  if (error) return <div className="empty-state">{error}</div>;
  if (!trip) return <div className="empty-state">Đang tải dữ liệu thật...</div>;

  return (
    <div className="page-stack">
      <PageHeader title={trip.name} description={`${formatShortDate(trip.startDate)} - ${formatShortDate(trip.endDate)}`} />

      <div className="grid-2">
        <Card title="Thông tin chuyến" subtitle="Ảnh và trạng thái của chuyến được chọn">
          <div className="detail-card__body">
            {trip.images ? <img className="data-thumb" src={trip.images} alt={trip.name} /> : null}
            <p><strong>Trạng thái:</strong> {trip.status}</p>
            <p><strong>Thành viên:</strong> {trip.memberCount}</p>
            <p><strong>Ngân sách:</strong> {formatCurrency(trip.totalBudget ?? 0)}</p>
            <p><strong>Đã chi:</strong> {formatCurrency(trip.expenseTotal)}</p>
            <p><strong>Tạo lúc:</strong> {formatLongDate(trip.createdAt)}</p>
          </div>
        </Card>

        <Card title="Thành viên" subtitle="Danh sách tham gia và vai trò">
          <div className="list">
            {trip.members.map((member) => (
              <div className="list__row" key={member.id}>
                <div className="span-6 identity-cell">
                  {member.avatar ? <img className="data-avatar" src={member.avatar} alt={member.fullName} /> : null}
                  <div>
                    <strong>{member.fullName}</strong>
                    <div className="muted">{member.role}</div>
                  </div>
                </div>
                <div className="span-6"><span className="chip">{member.inviteStatus}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Chi phí" subtitle="Các dòng chi tiêu mới nhất của chuyến đi">
        <div className="table">
          {trip.expenses.map((expense) => (
            <div className="table__row" key={expense.id}>
              <div className="span-4">{expense.description || "Không có"}</div>
              <div className="span-3">{expense.categoryName}</div>
              <div className="span-2">{expense.paidByName}</div>
              <div className="span-1">{formatCurrency(expense.amount)}</div>
              <div className="span-2">{formatLongDate(expense.date)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
