"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchUsers, updateUserStatus } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { mockUsers } from "@/lib/mock-data";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { UserListItem } from "@/lib/types";

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<UserListItem[]>(mockUsers);
  const [total, setTotal] = useState(mockUsers.length);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    fetchUsers(debouncedQuery, page, 10, status).then((result) => {
      setItems(result.items);
      setTotal(result.total);
    });
  }, [debouncedQuery, page, status]);

  return (
    <div className="page-stack">
      <PageHeader title="Người dùng" description="Tìm kiếm, theo dõi và kiểm soát tài khoản trên nền tảng." />

      <Card title="Bộ lọc" subtitle="Lọc đúng tài khoản cần xử lý">
        <div className="grid-3">
          <label className="field">
            <span>Tìm kiếm</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên hoặc email" />
          </label>
          <label className="field">
            <span>Trạng thái</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm khóa</option>
              <option value="BANNED">Bị cấm</option>
            </select>
          </label>
          <div className="field">
            <span>Số kết quả</span>
            <div className="chip">{total} người dùng</div>
          </div>
        </div>
      </Card>

      <Card title="Danh sách tài khoản" subtitle="Trạng thái và ngữ cảnh hoạt động hiện tại">
        <div className="table">
          <div className="table__row table__row--header">
            <div className="span-3">Tài khoản</div>
            <div className="span-2">Trạng thái</div>
            <div className="span-2">Chuyến đi</div>
            <div className="span-2">Tổng chi</div>
            <div className="span-2">Ngày tạo</div>
            <div className="span-3">Thao tác</div>
          </div>

          {items.map((user) => (
            <div className="table__row" key={user.id}>
              <div className="span-3">
                <strong>{user.fullName || "Chưa có tên"}</strong>
                <div className="muted">{user.email}</div>
              </div>
              <div className="span-2">
                <span className="chip">{user.status}</span>
              </div>
              <div className="span-2">{user.tripCount}</div>
              <div className="span-2">{formatCurrency(user.expenseTotal)}</div>
              <div className="span-2">{formatShortDate(user.createdAt)}</div>
              <div className="span-3 link-list">
                <Link href={`/users/${user.id}`}>Mở hồ sơ</Link>
                <button
                  className="btn btn--ghost"
                  onClick={async () => {
                    const nextStatus = user.status === "BANNED" ? "ACTIVE" : "BANNED";
                    await updateUserStatus(user.id, nextStatus);
                    setItems((current) => current.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)));
                  }}
                  type="button"
                >
                  {user.status === "BANNED" ? "Gỡ cấm" : "Cấm"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="link-list" style={{ justifyContent: "space-between" }}>
          <button className="btn btn--ghost" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
            Trang trước
          </button>
          <span className="chip">Trang {page}</span>
          <button className="btn btn--ghost" onClick={() => setPage((value) => value + 1)} type="button">
            Trang sau
          </button>
        </div>
      </Card>
    </div>
  );
}