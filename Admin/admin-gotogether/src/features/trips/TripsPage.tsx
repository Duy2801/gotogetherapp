"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchTrips } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { mockTrips } from "@/lib/mock-data";
import type { TripListItem } from "@/lib/types";

export default function TripsPage() {
  const [status, setStatus] = useState("ALL");
  const [items, setItems] = useState<TripListItem[]>(mockTrips);

  useEffect(() => {
    fetchTrips(status).then((result) => setItems(result.items)).catch(() => setItems(mockTrips));
  }, [status]);

  return (
    <div className="page-stack">
      <PageHeader title="Chuyến đi" description="Theo dõi tiến độ, ngân sách và số lượng thành viên của từng chuyến." />

      <Card title="Bộ lọc" subtitle="Lọc theo trạng thái chuyến đi">
        <div className="field" style={{ maxWidth: 280 }}>
          <span>Trạng thái</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">Tất cả</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="ONGOING">Đang diễn ra</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </div>
      </Card>

      <Card title="Danh sách chuyến đi" subtitle="Toàn bộ hành trình đang có trong hệ thống">
        <div className="table">
          <div className="table__row table__row--header">
            <div className="span-4">Chuyến đi</div>
            <div className="span-2">Trạng thái</div>
            <div className="span-2">Thành viên</div>
            <div className="span-2">Ngân sách</div>
            <div className="span-2">Đã chi</div>
            <div className="span-2">Mở</div>
          </div>

          {items.map((trip) => (
            <div className="table__row" key={trip.id}>
              <div className="span-4">
                <strong>{trip.name}</strong>
                <div className="muted">
                  {formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}
                </div>
              </div>
              <div className="span-2"><span className="chip">{trip.status}</span></div>
              <div className="span-2">{trip.memberCount}</div>
              <div className="span-2">{formatCurrency(trip.totalBudget ?? 0)}</div>
              <div className="span-2">{formatCurrency(trip.expenseTotal)}</div>
              <div className="span-2"><Link className="chip" href={`/trips/${trip.id}`}>Xem</Link></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}