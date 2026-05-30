"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faClock,
  faDownload,
  faFilter,
  faImage,
  faPen,
  faPlus,
  faReceipt,
  faSearch,
  faTrash,
  faUtensils,
  faWallet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchDashboard,
  fetchExpenses,
  fetchTrips,
  fetchUsers,
  updateExpense,
} from "@/lib/api";
import { formatCurrency, formatLongDate } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { CategoryItem, DashboardSummary, ExpenseItem, TripListItem, UserListItem } from "@/lib/types";

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  tripId: "",
  categoryId: "",
  paidById: "",
  amount: 0,
  currency: "VND",
  description: "",
  type: "SHARED",
  date: today,
  receipt: "",
  isConfirmed: false,
};

function toDateInput(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : today;
}

function isImageUrl(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function shortMoney(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

export default function ExpensesPage() {
  const [query, setQuery] = useState("");
  const [tripId, setTripId] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<ExpenseItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const reloadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchExpenses(debouncedQuery, tripId, categoryId, page, 10);
      setItems(result.items);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được chi tiêu từ API.");
    } finally {
      setLoading(false);
    }
  }, [categoryId, debouncedQuery, page, tripId]);

  useEffect(() => {
    Promise.all([fetchTrips("", "ALL", 1, 100), fetchUsers("", 1, 100, "ALL"), fetchCategories(), fetchDashboard()])
      .then(([tripResult, userResult, categoryResult, dashboardResult]) => {
        setTrips(tripResult.items);
        setUsers(userResult.items);
        setCategories(categoryResult);
        setSummary(dashboardResult);
        setForm((current) => ({
          ...current,
          tripId: current.tripId || tripResult.items[0]?.id || "",
          paidById: current.paidById || userResult.items[0]?.id || "",
          categoryId: current.categoryId || categoryResult[0]?.id || "",
        }));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được dữ liệu chọn."));
  }, []);

  useEffect(() => {
    reloadExpenses();
  }, [reloadExpenses]);

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const confirmedAmount = useMemo(() => items.filter((item) => item.isConfirmed).reduce((sum, item) => sum + item.amount, 0), [items]);
  const budgetLimit = Math.max(summary?.totalBudget || totalAmount || 1, totalAmount || 1);
  const usedPercent = Math.min(100, Math.round((totalAmount / budgetLimit) * 100));
  const arcOffset = 251.2 - (251.2 * usedPercent) / 100;
  const remaining = Math.max(0, budgetLimit - totalAmount);
  const dailyAverage = totalAmount / Math.max(1, new Date().getDate());

  const categoryTotals = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; color?: string | null; icon?: string | null }>();
    items.forEach((item) => {
      const current = map.get(item.categoryId) ?? {
        name: item.categoryName || "Khác",
        amount: 0,
        color: item.categoryColor,
        icon: item.categoryIcon,
      };
      current.amount += item.amount;
      map.set(item.categoryId, current);
    });
    return Array.from(map.values()).sort((left, right) => right.amount - left.amount);
  }, [items]);

  const topCategory = categoryTotals[0] ?? { name: "Chưa có dữ liệu", amount: 0, icon: null };
  const secondCategory = categoryTotals[1] ?? { name: "Đang cập nhật", amount: 0, icon: null };

  const openCreate = () => {
    setSelected(null);
    setForm((current) => ({
      ...emptyForm,
      tripId: current.tripId || trips[0]?.id || "",
      paidById: current.paidById || users[0]?.id || "",
      categoryId: current.categoryId || categories[0]?.id || "",
    }));
    setIsModalOpen(true);
  };

  const openEdit = (expense: ExpenseItem) => {
    setSelected(expense);
    setForm({
      tripId: expense.tripId,
      categoryId: expense.categoryId,
      paidById: expense.paidById,
      amount: expense.amount,
      currency: expense.currency,
      description: expense.description ?? "",
      type: expense.type,
      date: toDateInput(expense.date),
      receipt: expense.receipt ?? "",
      isConfirmed: expense.isConfirmed,
    });
    setIsModalOpen(true);
  };

  const exportCsv = () => {
    const rows = [
      ["Description", "Trip", "Category", "Paid by", "Amount", "Currency", "Date", "Confirmed"],
      ...items.map((item) => [
        item.description || item.categoryName,
        item.tripName,
        item.categoryName,
        item.paidByName,
        String(item.amount),
        item.currency,
        item.date,
        item.isConfirmed ? "YES" : "NO",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="expenses-console">
      <header className="expenses-console__hero">
        <div>
          <p>Quản lý chi tiêu</p>
          <h1>Theo dõi chi tiêu</h1>
          <span>Cập nhật dữ liệu thật từ backend, lọc theo chuyến đi, danh mục và người chi trả.</span>
        </div>
        <div className="expenses-console__actions">
          <label className="expenses-console__search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm giao dịch, chuyến đi, người trả..."
              type="search"
            />
          </label>
          <button className="expenses-console__button" type="button" onClick={exportCsv}>
            <FontAwesomeIcon icon={faDownload} /> Xuất CSV
          </button>
          <button className="expenses-console__primary" type="button" onClick={openCreate}>
            <FontAwesomeIcon icon={faPlus} /> Thêm chi tiêu
          </button>
        </div>
      </header>

      {error ? <div className="expenses-console__error">{error}</div> : null}

      <section className="expenses-filters">
        <label>
          <FontAwesomeIcon icon={faFilter} />
          <select
            value={tripId}
            onChange={(event) => {
              setTripId(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Tất cả chuyến đi</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FontAwesomeIcon icon={faChartPie} />
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <span>{loading ? "Đang đồng bộ dữ liệu..." : `${total.toLocaleString()} giao dịch phù hợp`}</span>
      </section>

      <section className="expenses-bento">
        <article className="expenses-arc-card">
          <div className="expenses-arc-card__glow" />
          <div className="expenses-arc">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="expenseArcGradient" x1="0" x2="100" y1="0" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00dbe9" />
                  <stop offset="1" stopColor="#b600f8" />
                </linearGradient>
              </defs>
              <circle className="expenses-arc__track" cx="50" cy="50" fill="transparent" r="40" strokeWidth="6" />
              <circle
                className="expenses-arc__progress"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                strokeDasharray="251.2"
                strokeDashoffset={arcOffset}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div>
              <span>Tổng chi tiêu</span>
              <strong>{shortMoney(totalAmount)}</strong>
              <small>/ {shortMoney(budgetLimit)} VND</small>
            </div>
          </div>
          <div className="expenses-arc-card__metrics">
            <div>
              <span>Còn lại</span>
              <strong>{shortMoney(remaining)}</strong>
            </div>
            <div>
              <span>Hằng ngày</span>
              <strong>{shortMoney(dailyAverage)}</strong>
            </div>
            <div>
              <span>Đã duyệt</span>
              <strong>{shortMoney(confirmedAmount)}</strong>
            </div>
          </div>
        </article>

        <aside className="expenses-side-stats">
          <article>
            <div>
              <span className="expenses-stat-icon">{topCategory.icon && !isImageUrl(topCategory.icon) ? topCategory.icon : <FontAwesomeIcon icon={faWallet} />}</span>
              <small>Cao nhất</small>
            </div>
            <p>{topCategory.name}</p>
            <strong>{formatCurrency(topCategory.amount)}</strong>
          </article>
          <article>
            <div>
              <span className="expenses-stat-icon expenses-stat-icon--purple">
                {secondCategory.icon && !isImageUrl(secondCategory.icon) ? secondCategory.icon : <FontAwesomeIcon icon={faUtensils} />}
              </span>
              <small>Tiếp theo</small>
            </div>
            <p>{secondCategory.name}</p>
            <strong>{formatCurrency(secondCategory.amount)}</strong>
          </article>
        </aside>

        <article className="expenses-log">
          <div className="expenses-log__head">
            <div>
              <h2>Lịch sử giao dịch</h2>
              <p>Danh sách chi tiêu mới nhất theo bộ lọc hiện tại.</p>
            </div>
            <div className="expenses-log__chips">
              <span>Tất cả</span>
              <span>{items.filter((item) => item.isConfirmed).length} đã xác nhận</span>
            </div>
          </div>

          {loading ? <div className="expenses-empty">Đang tải dữ liệu chi tiêu...</div> : null}
          {!loading && items.length === 0 ? <div className="expenses-empty">Không có khoản chi phù hợp.</div> : null}

          <div className="expenses-rows">
            {items.map((expense) => (
              <div className="expenses-row" key={expense.id}>
                <div className="expenses-row__thumb">
                  {isImageUrl(expense.receipt) ? (
                    <img src={expense.receipt ?? ""} alt={expense.description ?? expense.categoryName} />
                  ) : isImageUrl(expense.tripImage) ? (
                    <img src={expense.tripImage ?? ""} alt={expense.tripName} />
                  ) : (
                    <span>{expense.categoryIcon && !isImageUrl(expense.categoryIcon) ? expense.categoryIcon : <FontAwesomeIcon icon={faReceipt} />}</span>
                  )}
                </div>
                <div className="expenses-row__main">
                  <strong>{expense.description || expense.categoryName}</strong>
                  <span>
                    {formatLongDate(expense.date)} • {expense.categoryName} • {expense.tripName}
                  </span>
                </div>
                <div className="expenses-row__payer">
                  {isImageUrl(expense.paidByAvatar) ? <img src={expense.paidByAvatar ?? ""} alt={expense.paidByName} /> : <span>{expense.paidByName.slice(0, 1).toUpperCase()}</span>}
                  <small>{expense.paidByName}</small>
                </div>
                <div className="expenses-row__amount">
                  <strong>-{formatCurrency(expense.amount, expense.currency)}</strong>
                  <span className={expense.isConfirmed ? "expenses-badge expenses-badge--ok" : "expenses-badge"}>
                    <FontAwesomeIcon icon={expense.isConfirmed ? faCheck : faClock} />
                    {expense.isConfirmed ? "APPROVED" : "PENDING"}
                  </span>
                </div>
                <div className="expenses-row__actions">
                  <button type="button" onClick={() => openEdit(expense)} aria-label="Sửa chi tiêu">
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Xóa khoản chi này?")) return;
                      await deleteExpense(expense.id);
                      await reloadExpenses();
                    }}
                    aria-label="Xóa chi tiêu"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <footer className="expenses-log__footer">
            <span>
              Trang {page}/{totalPages}
            </span>
            <div>
              <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} type="button">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </footer>
        </article>
      </section>

      <button className="expenses-fab" type="button" onClick={openCreate} aria-label="Thêm chi tiêu">
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {isModalOpen ? (
        <div className="expenses-modal" role="dialog" aria-modal="true">
          <form
            className="expenses-modal__panel"
            onSubmit={async (event) => {
              event.preventDefault();
              setSaving(true);
              try {
                if (selected) await updateExpense(selected.id, form);
                else await createExpense(form);
                setIsModalOpen(false);
                setSelected(null);
                await reloadExpenses();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Không lưu được khoản chi.");
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="expenses-modal__head">
              <div>
                <h2>{selected ? "Sửa khoản chi" : "Thêm khoản chi"}</h2>
                <p>Dữ liệu được lưu trực tiếp vào backend.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Đóng">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="expenses-form-grid">
              <label className="expenses-field">
                <span>Chuyến đi</span>
                <select required value={form.tripId} onChange={(event) => setForm((current) => ({ ...current, tripId: event.target.value }))}>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="expenses-field">
                <span>Danh mục</span>
                <select required value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="expenses-field">
                <span>Người trả</span>
                <select required value={form.paidById} onChange={(event) => setForm((current) => ({ ...current, paidById: event.target.value }))}>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="expenses-field">
                <span>Số tiền</span>
                <input required min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} type="number" />
              </label>
              <label className="expenses-field">
                <span>Ngày chi</span>
                <input value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} type="date" />
              </label>
              <label className="expenses-field">
                <span>Loại</span>
                <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                  <option value="SHARED">SHARED</option>
                  <option value="PERSONAL">PERSONAL</option>
                </select>
              </label>
              <label className="expenses-field expenses-field--wide">
                <span>Mô tả</span>
                <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <label className="expenses-field expenses-field--wide">
                <span>Ảnh hóa đơn URL</span>
                <input value={form.receipt} onChange={(event) => setForm((current) => ({ ...current, receipt: event.target.value }))} placeholder="https://..." />
              </label>
            </div>

            <div className="expenses-modal__bottom">
              <div className="expenses-receipt-preview">
                {isImageUrl(form.receipt) ? <img src={form.receipt} alt="Ảnh hóa đơn" /> : <FontAwesomeIcon icon={faImage} />}
              </div>
              <label className="expenses-check">
                <input checked={form.isConfirmed} onChange={(event) => setForm((current) => ({ ...current, isConfirmed: event.target.checked }))} type="checkbox" />
                <span>Đã xác nhận khoản chi</span>
              </label>
              <button className="expenses-console__primary" disabled={saving} type="submit">
                {saving ? "Đang lưu..." : selected ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
