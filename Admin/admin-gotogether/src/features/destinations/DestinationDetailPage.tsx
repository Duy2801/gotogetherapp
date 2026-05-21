"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchDestinationDetail } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { mockDestinations } from "@/lib/mock-data";
import type { DestinationItem } from "@/lib/types";

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const fallback = useMemo(() => mockDestinations[0], []);
  const [destination, setDestination] = useState<DestinationItem>(fallback);

  useEffect(() => {
    if (params?.id) {
      fetchDestinationDetail(params.id).then(setDestination).catch(() => setDestination(fallback));
    }
  }, [params?.id, fallback]);

  return (
    <div className="page-stack">
      <PageHeader title={destination.label} description="Tổng hợp chi tiêu và số chuyến ở cấp độ điểm đến." />

      <div className="grid-2">
        <Card title="Tổng quan điểm đến" subtitle="Hoạt động tổng thể">
          <div className="detail-card__body">
            <p><strong>Số chuyến:</strong> {destination.tripCount}</p>
            <p><strong>Tổng chi:</strong> {formatCurrency(destination.totalExpense)}</p>
            <p><strong>Chuyến gần nhất:</strong> {formatShortDate(destination.latestTripAt)}</p>
          </div>
        </Card>

        <Card title="Chuyến đóng góp" subtitle="Các chuyến tạo ra dữ liệu cho điểm đến này">
          <div className="list">
            {destination.topTrips.map((trip) => (
              <div className="list__row" key={trip.id}>
                <div className="span-6">
                  <strong>{trip.name}</strong>
                  <div className="muted">{trip.status}</div>
                </div>
                <div className="span-6">{formatCurrency(trip.totalExpense)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}