"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchUserDetail } from "@/lib/api";
import { formatCurrency, formatLongDate, formatShortDate } from "@/lib/format";
import { mockUserDetail } from "@/lib/mock-data";
import type { UserDetail } from "@/lib/types";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail>(mockUserDetail);

  useEffect(() => {
    if (params?.id) {
      fetchUserDetail(params.id).then(setUser).catch(() => setUser(mockUserDetail));
    }
  }, [params?.id]);

  return (
    <div className="page-stack">
      <PageHeader title={user.fullName || "Chi tiết người dùng"} description={user.email} />

      <div className="grid-2">
        <Card title="Hồ sơ" subtitle="Thông tin nhận diện và trạng thái tài khoản">
          <div className="detail-card__body">
            <p><strong>Trạng thái:</strong> {user.status}</p>
            <p><strong>Xác thực:</strong> {user.isVerified ? "Đã xác minh" : "Chưa xác minh"}</p>
            <p><strong>Tham gia:</strong> {formatShortDate(user.createdAt)}</p>
            <p><strong>Ngày sinh:</strong> {formatShortDate(user.dateOfBirth)}</p>
            <p><strong>Tổng chi:</strong> {formatCurrency(user.expenseTotal)}</p>
            <p><strong>Số chuyến:</strong> {user.tripCount}</p>
          </div>
        </Card>

        <Card title="Vai trò trong chuyến" subtitle="Các chuyến mà người dùng đang tham gia">
          <div className="list">
            {user.joinedTrips.map((trip) => (
              <div key={trip.id} className="list__row">
                <div className="span-6">
                  <strong>{trip.tripName}</strong>
                  <div className="muted">{trip.role}</div>
                </div>
                <div className="span-6">
                  <span className="chip">{trip.inviteStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Chi tiêu gần đây" subtitle="Các khoản thanh toán mới nhất của tài khoản này">
        <div className="table">
          <div className="table__row table__row--header">
            <div className="span-4">Chuyến đi</div>
            <div className="span-3">Mô tả</div>
            <div className="span-2">Số tiền</div>
            <div className="span-3">Ngày</div>
          </div>
          {user.recentExpenses.map((expense) => (
            <div key={expense.id} className="table__row">
              <div className="span-4">{expense.tripName}</div>
              <div className="span-3">{expense.description || "Không có"}</div>
              <div className="span-2">{formatCurrency(expense.amount)}</div>
              <div className="span-3">{formatLongDate(expense.date)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}