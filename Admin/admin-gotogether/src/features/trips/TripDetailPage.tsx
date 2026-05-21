"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchTripDetail } from "@/lib/api";
import { formatCurrency, formatLongDate, formatShortDate } from "@/lib/format";
import { mockTripDetail } from "@/lib/mock-data";
import type { TripDetail } from "@/lib/types";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripDetail>(mockTripDetail);

  useEffect(() => {
    if (params?.id) {
      fetchTripDetail(params.id).then(setTrip).catch(() => setTrip(mockTripDetail));
    }
  }, [params?.id]);

  return (
    <div className="page-stack">
      <PageHeader title={trip.name} description={`${formatShortDate(trip.startDate)} - ${formatShortDate(trip.endDate)}`} />

      <div className="grid-2">
        <Card title="Thông tin chuyến" subtitle="Ảnh chụp nhanh của chuyến được chọn">
          <div className="detail-card__body">
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
                <div className="span-6">
                  <strong>{member.fullName}</strong>
                  <div className="muted">{member.role}</div>
                </div>
                <div className="span-6"><span className="chip">{member.inviteStatus}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Chi phí" subtitle="Các dòng chi tiêu mới nhất của chuyến đi">
        <div className="table">
          <div className="table__row table__row--header">
            <div className="span-4">Mô tả</div>
            <div className="span-3">Danh mục</div>
            <div className="span-2">Người trả</div>
            <div className="span-1">Số tiền</div>
            <div className="span-2">Ngày</div>
          </div>
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