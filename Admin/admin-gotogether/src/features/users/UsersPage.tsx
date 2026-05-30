"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faChevronLeft, faChevronRight, faFilter, faPlus, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { createUser, deleteUser, fetchUsers, updateUser, updateUserStatus } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { UserListItem } from "@/lib/types";

const emptyForm = {
  email: "",
  fullName: "",
  avatar: "",
  status: "ACTIVE",
  isVerified: false,
};

function userInitial(user: Pick<UserListItem, "fullName" | "email">) {
  return (user.fullName || user.email || "U").slice(0, 1).toUpperCase();
}

function roleLabel(user: UserListItem) {
  return user.roles?.includes("ADMIN") || user.roles?.includes("Admin") ? "Admin" : "User";
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Hoạt Động";
  if (status === "INACTIVE") return "Không hoạt động";
  return "Bị chặn";
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<UserListItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const activeUsers = items.filter((user) => user.status === "ACTIVE").length;
  const blockedUsers = items.filter((user) => user.status === "BANNED").length;
  const adminUsers = items.filter((user) => roleLabel(user) === "Admin").length;

  const reload = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const result = await fetchUsers(debouncedQuery, page, limit, status);
        setItems(result.items);
        setTotal(result.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được người dùng từ API.");
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, page, status],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (selected) {
      setForm({
        email: selected.email,
        fullName: selected.fullName ?? "",
        avatar: selected.avatar ?? "",
        status: selected.status,
        isVerified: selected.isVerified,
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected]);

  function openCreateForm() {
    setSelected(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(user: UserListItem) {
    setSelected(user);
    setFormOpen(true);
  }

  return (
    <section className="users-admin">
      <header className="users-admin__header">
        <div>
          <p className="users-admin__kicker">BẢNG QUẢN TRỊ GOTOGHETHER</p>
          <h1>Quản lý người dùng</h1>
          <p>Dữ liệu thật từ người dùng, tài khoản và quyền hạn hệ thống.</p>
        </div>
        <button className="users-admin__primary" onClick={openCreateForm} type="button">
          <FontAwesomeIcon icon={faUserPlus} />
          Thêm người dùng mới
        </button>
      </header>

      {error ? <div className="users-admin__error">{error}</div> : null}

      <section className="users-admin__stats">
        <article className="users-stat">
          <span>Tổng người dùng</span>
          <strong>{total.toLocaleString()}</strong>
          <small>+{items.length} người đang tải trang này</small>
        </article>
        <article className="users-stat">
          <span>Người dùng hoạt động</span>
          <strong>{activeUsers.toLocaleString()}</strong>
          <small>{items.length ? Math.round((activeUsers / items.length) * 100) : 0}% tổng số đang hiển thị</small>
        </article>
        <article className="users-stat">
          <span>Tỷ lệ giữ chân</span>
          <strong>{items.length ? `${Math.round(((items.length - blockedUsers) / items.length) * 1000) / 10}%` : "0%"}</strong>
          <small>{blockedUsers} tài khoản bị chặn</small>
        </article>
        <article className="users-stat">
          <span>Yêu cầu hỗ trợ</span>
          <strong>{adminUsers + blockedUsers}</strong>
          <small>Cần xử lý</small>
        </article>
      </section>

      <section className="users-table-card">
        <div className="users-table-card__top">
          <h2>Danh sách người dùng</h2>
          <div className="users-table-card__tools">
            <label className="users-search">
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm người dùng..." type="search" />
            </label>
            <label className="users-filter">
              <FontAwesomeIcon icon={faFilter} />
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                <option value="ALL">Tất cả vai trò</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="BANNED">Bị chặn</option>
              </select>
            </label>
            <button className="users-filter" type="button">
              <FontAwesomeIcon icon={faCalendarDays} />
              Tháng này
            </button>
          </div>
        </div>

        <div className="users-table">
          <div className="users-table__head">
            <span>Người dùng</span>
            <span>Vai trò</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>

          {loading ? <div className="users-table__empty">Đang tải dữ liệu...</div> : null}
          {!loading && items.length === 0 ? <div className="users-table__empty">Không có người dùng phù hợp.</div> : null}

          {items.map((user) => (
            <div className="users-table__row" key={user.id}>
              <div className="users-table__person">
                {user.avatar ? <img src={user.avatar} alt={user.fullName ?? user.email} /> : <span>{userInitial(user)}</span>}
                <div>
                  <strong>{user.fullName || "Chưa có tên"}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <div>
                <span className={`users-role users-role--${roleLabel(user).toLowerCase()}`}>{roleLabel(user)}</span>
              </div>
              <div>
                <span className={`users-status users-status--${user.status.toLowerCase()}`}>
                  <i />
                  {statusLabel(user.status)}
                </span>
              </div>
              <div className="users-actions">
                <button type="button" onClick={() => openEditForm(user)}>Sửa</button>
                <button
                  type="button"
                  onClick={async () => {
                    const nextStatus = user.status === "BANNED" ? "ACTIVE" : "BANNED";
                    await updateUserStatus(user.id, nextStatus);
                    await reload();
                  }}
                >
                  {user.status === "BANNED" ? "Mở" : "Chặn"}
                </button>
                <button
                  className="users-actions__danger"
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Xóa người dùng ${user.email}?`)) return;
                    await deleteUser(user.id);
                    await reload();
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="users-table-card__footer">
          <span>Hiển thị {(page - 1) * limit + (items.length ? 1 : 0)} - {Math.min(page * limit, total)} trên {total.toLocaleString()} người dùng</span>
          <div className="users-pagination">
            <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <strong>{page}</strong>
            {page + 1 <= totalPages ? <button onClick={() => setPage(page + 1)} type="button">{page + 1}</button> : null}
            {page + 2 <= totalPages ? <button onClick={() => setPage(page + 2)} type="button">{page + 2}</button> : null}
            {totalPages > page + 3 ? <span>...</span> : null}
            {totalPages > page + 2 ? <button onClick={() => setPage(totalPages)} type="button">{totalPages}</button> : null}
            <button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} type="button">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </footer>
      </section>

      {formOpen ? (
        <div className="users-modal" role="dialog" aria-modal="true">
          <div className="users-modal__panel">
            <div className="users-modal__head">
              <div>
                <p className="users-admin__kicker">{selected ? "CẬP NHẬT" : "TẠO MỚI"}</p>
                <h2>{selected ? "Sửa người dùng" : "Thêm người dùng mới"}</h2>
              </div>
              <button onClick={() => setFormOpen(false)} type="button">Đóng</button>
            </div>
            <form
              className="field-stack"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  if (selected) await updateUser(selected.id, form);
                  else await createUser(form);
                  setFormOpen(false);
                  setSelected(null);
                  await reload();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Không lưu được người dùng.");
                }
              }}
            >
              <label className="field field--stacked">
                <span>Email</span>
                <input required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" />
              </label>
              <label className="field field--stacked">
                <span>Họ tên</span>
                <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
              </label>
              <label className="field field--stacked">
                <span>Avatar URL</span>
                <input value={form.avatar} onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))} />
              </label>
              <div className="grid-2 grid-2--tight">
                <label className="field field--stacked">
                  <span>Trạng thái</span>
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="BANNED">BANNED</option>
                  </select>
                </label>
                <label className="field field--inline">
                  <input checked={form.isVerified} onChange={(event) => setForm((current) => ({ ...current, isVerified: event.target.checked }))} type="checkbox" />
                  <span>Đã xác minh</span>
                </label>
              </div>
              <button className="users-admin__primary" type="submit">
                <FontAwesomeIcon icon={faPlus} />
                {selected ? "Cập nhật người dùng" : "Tạo người dùng"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
