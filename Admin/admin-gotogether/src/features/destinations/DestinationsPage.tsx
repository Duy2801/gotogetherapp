"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchDestinations } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { mockDestinations } from "@/lib/mock-data";
import type { DestinationItem } from "@/lib/types";

export default function DestinationsPage() {
  const [items, setItems] = useState<DestinationItem[]>(mockDestinations);

  useEffect(() => {
    fetchDestinations().then(setItems).catch(() => setItems(mockDestinations));
  }, []);

  return (
    <div className="page-stack">
      <PageHeader title="Điểm đến" description="Xem các điểm du lịch nổi bật dựa trên tần suất chuyến đi và tổng chi tiêu." />

      <div className="grid-3">
        {items.map((destination) => (
          <Card key={destination.id} title={destination.label} subtitle={`${destination.tripCount} chuyến trong phạm vi`}>
            <div className="detail-card__body">
              <p><strong>Tổng chi:</strong> {formatCurrency(destination.totalExpense)}</p>
              <p><strong>Chuyến gần nhất:</strong> {formatShortDate(destination.latestTripAt)}</p>
              <div className="link-list">
                <Link className="chip" href={`/destinations/${destination.id}`}>Mở</Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}