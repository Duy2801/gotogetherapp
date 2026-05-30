"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCheckCircle,
  faDownload,
  faEllipsisVertical,
  faFilter,
  faPenToSquare,
  faPlus,
  faRoute,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { createTrip, deleteTrip, fetchTrips, updateTrip } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { TripListItem } from "@/lib/types";

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  name: "",
  startDate: today,
  endDate: today,
  status: "UPCOMING",
  totalBudget: 0,
  images: "",
};

function toDateInput(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : today;
}

function progressForTrip(trip: TripListItem) {
  const start = new Date(trip.startDate).getTime();
  const end = new Date(trip.endDate).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return trip.status === "COMPLETED" ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

function fallbackImage(index: number) {
  const images = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=320&q=80",
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=320&q=80",
  ];
  return images[index % images.length];
}

export default function TripsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TripListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<TripListItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  const reload = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const result = await fetchTrips(debouncedQuery, status, page, 10);
        setItems(result.items);
        setTotal(result.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được chuyến đi từ API.");
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
        name: selected.name,
        startDate: toDateInput(selected.startDate),
        endDate: toDateInput(selected.endDate),
        status: selected.status,
        totalBudget: selected.totalBudget ?? 0,
        images: selected.images ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected]);

  const ongoingTrips = items.filter((trip) => trip.status === "ONGOING");
  const upcomingTrips = items.filter((trip) => trip.status === "UPCOMING");
  const completedTrips = items.filter((trip) => trip.status === "COMPLETED");
  const primaryTrips = ongoingTrips.length ? ongoingTrips : items;

  function openCreateForm() {
    setSelected(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(trip: TripListItem) {
    setSelected(trip);
    setFormOpen(true);
  }

  return (
    <section className="trips-console">
      <header className="trips-console__hero">
        <div>
          <h1>Quản lý Chuyến đi</h1>
          <p>Theo dõi và quản lý các lịch trình trong hệ thống với dữ liệu thật từ API.</p>
        </div>
        <div className="trips-console__actions">
          <label className="trips-console__search">
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm kiếm chuyến đi..." type="search" />
          </label>
          <label className="trips-console__button">
            <FontAwesomeIcon icon={faFilter} />
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="ALL">Bộ lọc</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="UPCOMING">Sắp tới</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
          </label>
          <button className="trips-console__button" type="button">
            <FontAwesomeIcon icon={faDownload} />
            Xuất CSV
          </button>
          <button className="trips-console__primary" onClick={openCreateForm} type="button">
            <FontAwesomeIcon icon={faPlus} />
            Tạo chuyến
          </button>
        </div>
      </header>

      {error ? <div className="trips-console__error">{error}</div> : null}

      <section className="trips-stat-grid">
        <article className="trips-stat-card">
          <div>
            <FontAwesomeIcon icon={faRoute} />
            <span>Hiện tại</span>
          </div>
          <strong>{ongoingTrips.length.toString().padStart(2, "0")}</strong>
          <p>Chuyến đi đang diễn ra</p>
        </article>
        <article className="trips-stat-card trips-stat-card--purple">
          <div>
            <FontAwesomeIcon icon={faCalendarDays} />
            <span>Sắp tới</span>
          </div>
          <strong>{upcomingTrips.length.toString().padStart(2, "0")}</strong>
          <p>Đã được lên lịch trình</p>
        </article>
        <article className="trips-stat-card trips-stat-card--muted">
          <div>
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Hoàn thành</span>
          </div>
          <strong>{completedTrips.length || total}</strong>
          <p>Tổng số chuyến đi trong hệ thống</p>
        </article>
      </section>

      <div className="trips-section-title">
        <h2>{status === "UPCOMING" ? "Lịch trình sắp tới" : "Đang diễn ra"}</h2>
        <span />
      </div>

      <section className="trips-list">
        {loading ? <div className="trips-empty">Đang tải dữ liệu...</div> : null}
        {!loading && primaryTrips.length === 0 ? <div className="trips-empty">Không có chuyến đi phù hợp.</div> : null}

        {primaryTrips.map((trip, index) => {
          const progress = progressForTrip(trip);
          return (
            <article className="trip-glass-card" key={trip.id}>
              <img className="trip-glass-card__image" src={trip.images || fallbackImage(index)} alt={trip.name} />
              <div className="trip-glass-card__body">
                <div className="trip-glass-card__meta">
                  <span>{trip.status}</span>
                  <i />
                  <small>{trip.memberCount} thành viên</small>
                </div>
                <h3>{trip.name}</h3>
                <div className="trip-glass-card__facts">
                  <span><FontAwesomeIcon icon={faCalendarDays} /> {formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}</span>
                  <span>{formatCurrency(trip.expenseTotal || trip.totalBudget || 0)}</span>
                </div>
                <div className="trip-progress">
                  <div style={{ width: `${trip.status === "COMPLETED" ? 100 : progress}%` }} />
                </div>
                <div className="trip-progress__labels">
                  <span>Khởi hành</span>
                  <span>{trip.status === "COMPLETED" ? 100 : progress}% hoàn thành</span>
                  <span>Kết thúc</span>
                </div>
              </div>
              <div className="trip-glass-card__actions">
                <Link href={`/trips/${trip.id}`}>Chi tiết</Link>
                <button aria-label="Sửa chuyến" onClick={() => openEditForm(trip)} type="button">
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                  aria-label="Xóa chuyến"
                  onClick={async () => {
                    if (!confirm(`Xóa chuyến ${trip.name}?`)) return;
                    await deleteTrip(trip.id);
                    await reload();
                  }}
                  type="button"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {upcomingTrips.length > 0 && status !== "UPCOMING" ? (
        <>
          <div className="trips-section-title">
            <h2>Lịch trình sắp tới</h2>
            <span />
          </div>
          <section className="trips-planned-grid">
            {upcomingTrips.slice(0, 4).map((trip, index) => (
              <article className="trip-planned-card" key={trip.id}>
                <div>
                  <h3>{trip.name}</h3>
                  <p>{formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}</p>
                </div>
                <span>{new Date(trip.startDate).toLocaleDateString("vi-VN", { month: "short" })}</span>
                <footer>
                  <div className="trip-planned-card__avatar">{trip.name.slice(0, 1).toUpperCase()}</div>
                  <strong>{formatCurrency(trip.totalBudget ?? 0)}</strong>
                </footer>
              </article>
            ))}
          </section>
        </>
      ) : null}

      <footer className="trips-console__footer">
        <span>Hiển thị {items.length} / {total.toLocaleString()} chuyến</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">Trước</button>
          <strong>{page}</strong>
          <button disabled={items.length < 10} onClick={() => setPage((value) => value + 1)} type="button">Sau</button>
        </div>
      </footer>

      {formOpen ? (
        <div className="trips-modal" role="dialog" aria-modal="true">
          <div className="trips-modal__panel">
            <div className="trips-modal__head">
              <h2>{selected ? "Sửa chuyến đi" : "Thêm chuyến đi"}</h2>
              <button onClick={() => setFormOpen(false)} type="button">
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
            </div>
            <form
              className="field-stack"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  if (selected) await updateTrip(selected.id, form);
                  else await createTrip(form);
                  setFormOpen(false);
                  setSelected(null);
                  await reload();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Không lưu được chuyến đi.");
                }
              }}
            >
              <label className="field field--stacked">
                <span>Tên chuyến</span>
                <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <div className="grid-2 grid-2--tight">
                <label className="field field--stacked">
                  <span>Ngày bắt đầu</span>
                  <input value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} type="date" />
                </label>
                <label className="field field--stacked">
                  <span>Ngày kết thúc</span>
                  <input value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} type="date" />
                </label>
              </div>
              <div className="grid-2 grid-2--tight">
                <label className="field field--stacked">
                  <span>Trạng thái</span>
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </label>
                <label className="field field--stacked">
                  <span>Ngân sách</span>
                  <input value={form.totalBudget} onChange={(event) => setForm((current) => ({ ...current, totalBudget: Number(event.target.value) }))} type="number" min="0" />
                </label>
              </div>
              <label className="field field--stacked">
                <span>Ảnh chuyến đi URL</span>
                <input value={form.images} onChange={(event) => setForm((current) => ({ ...current, images: event.target.value }))} placeholder="https://..." />
              </label>
              <button className="trips-console__primary" type="submit">
                <FontAwesomeIcon icon={faPlus} />
                {selected ? "Cập nhật" : "Thêm mới"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
