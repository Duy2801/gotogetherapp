"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChartLine,
  faChevronRight,
  faFolderTree,
  faMoneyBillTrendUp,
  faPlaneDeparture,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { fetchCategories, fetchDashboard, fetchExpenses, fetchTrips, fetchUsers } from "@/api";
import { formatCurrency, formatLongDate } from "@/lib/format";
import type { CategoryItem, DashboardSummary, ExpenseItem, TripListItem, UserListItem } from "@/lib/types";

const emptySummary: DashboardSummary = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  totalUsers: 0,
  activeUsers: 0,
  totalTrips: 0,
  ongoingTrips: 0,
  totalExpenses: 0,
  totalBudget: 0,
  topTrips: [],
  topCategories: [],
};

function initial(value?: string | null) {
  return (value || "G").slice(0, 1).toUpperCase();
}

function chartBars(expenses: ExpenseItem[], total: number) {
  const seed = expenses.slice(0, 6).map((expense) => expense.amount);
  const values = seed.length ? seed : [total * 0.32, total * 0.55, total * 0.24, total * 0.82, total * 0.48, total * 0.2];
  const max = Math.max(...values, 1);
  return values.slice(0, 6).map((value) => Math.max(12, Math.round((value / max) * 100)));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchDashboard(),
      fetchUsers("", 1, 5, "ALL"),
      fetchTrips("", "ALL", 1, 5),
      fetchCategories(),
      fetchExpenses("", "ALL", "ALL", 1, 5),
    ])
      .then(([dashboard, userResult, tripResult, categoryResult, expenseResult]) => {
        setSummary(dashboard);
        setUsers(userResult.items);
        setTrips(tripResult.items);
        setCategories(categoryResult);
        setExpenses(expenseResult.items);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được dữ liệu thật từ API."))
      .finally(() => setLoading(false));
  }, []);

  const bars = useMemo(() => chartBars(expenses, summary.totalExpenses), [expenses, summary.totalExpenses]);
  const activeBudget = Math.max(summary.totalBudget, summary.totalExpenses, 1);
  const budgetPercent = Math.min(100, Math.round((summary.totalExpenses / activeBudget) * 100));
  const visibleCategories = (summary.topCategories.length
    ? summary.topCategories.map((category) => ({
        id: category.id,
        name: category.name,
        color: category.color ?? null,
        icon: null,
        totalAmount: category.totalAmount,
      }))
    : categories.slice(0, 6).map((category) => ({
        id: category.id,
        name: category.name,
        color: category.color ?? null,
        icon: category.icon ?? null,
        totalAmount: category.totalAmount,
      })));

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard__ambient admin-dashboard__ambient--top" />
      <div className="admin-dashboard__ambient admin-dashboard__ambient--bottom" />

      <header className="admin-dashboard__header">
        <div>
          <h1>Tổng Quan Hệ Thống</h1>
          <p>Chào mừng trở lại. Đây là dữ liệu mới nhất cho GoTogether.</p>
        </div>
        <div className="admin-dashboard__period">
          <FontAwesomeIcon icon={faCalendarDays} />
          <span>Tháng {summary.month}, {summary.year}</span>
        </div>
      </header>

      {error ? <div className="admin-dashboard__error">{error}</div> : null}
      {loading ? <div className="admin-dashboard__empty">Đang tải dữ liệu thật...</div> : null}

      <section className="admin-dashboard__stats">
        <article className="dashboard-glass-card dashboard-stat">
          <div className="dashboard-stat__top">
            <span><FontAwesomeIcon icon={faUsers} /></span>
            <small>+12%</small>
          </div>
          <p>Người dùng</p>
          <strong>{summary.totalUsers.toLocaleString()}</strong>
        </article>
        <article className="dashboard-glass-card dashboard-stat">
          <div className="dashboard-stat__top dashboard-stat__top--purple">
            <span><FontAwesomeIcon icon={faPlaneDeparture} /></span>
            <small>Mới</small>
          </div>
          <p>Chuyến đi</p>
          <strong>{summary.totalTrips.toLocaleString()}</strong>
        </article>
        <article className="dashboard-glass-card dashboard-stat dashboard-stat--highlight">
          <div className="dashboard-stat__top">
            <span><FontAwesomeIcon icon={faMoneyBillTrendUp} /></span>
            <small>Info</small>
          </div>
          <p>Chi tiêu tháng</p>
          <strong>{formatCurrency(summary.totalExpenses)}</strong>
        </article>
        <article className="dashboard-glass-card dashboard-stat">
          <div className="dashboard-stat__top dashboard-stat__top--plain">
            <span><FontAwesomeIcon icon={faFolderTree} /></span>
            <small>Ổn định</small>
          </div>
          <p>Danh mục</p>
          <strong>{categories.length.toLocaleString()}</strong>
        </article>
      </section>

      <section className="admin-dashboard__main-grid">
        <div className="admin-dashboard__left">
          <article className="dashboard-glass-card dashboard-chart">
            <div className="dashboard-chart__icon"><FontAwesomeIcon icon={faChartLine} /></div>
            <div className="dashboard-card-head">
              <div>
                <h2>Xu Hướng Chi Tiêu</h2>
                <p>Theo dõi biến động chi phí theo thời gian</p>
              </div>
              <select aria-label="Khoảng thời gian">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
            </div>
            <div className="dashboard-chart__plot">
              <div className="dashboard-chart__grid" />
              {bars.map((height, index) => (
                <div className="dashboard-chart__bar" style={{ height: `${height}%` }} key={`${height}-${index}`} />
              ))}
            </div>
            <div className="dashboard-chart__axis">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
            </div>
          </article>

          <article className="dashboard-glass-card dashboard-table-card">
            <div className="dashboard-card-head">
              <h2>Chuyến Đi Gần Đây</h2>
              <Link href="/trips">Xem tất cả</Link>
            </div>
            <div className="dashboard-trip-list">
              {trips.map((trip) => (
                <Link className="dashboard-trip-row" href={`/trips/${trip.id}`} key={trip.id}>
                  <div className="dashboard-trip-row__name">
                    {trip.images ? <img src={trip.images} alt={trip.name} /> : <span>{initial(trip.name)}</span>}
                    <div>
                      <strong>{trip.name}</strong>
                      <small>{trip.status}</small>
                    </div>
                  </div>
                  <span>{formatLongDate(trip.createdAt)}</span>
                  <b>{formatCurrency(trip.expenseTotal)}</b>
                </Link>
              ))}
            </div>
          </article>
        </div>

        <aside className="dashboard-glass-card dashboard-users-card">
          <div className="dashboard-users-card__head">
            <h2>Người Dùng Mới</h2>
            <p>Danh sách tài khoản mới nhất</p>
          </div>
          <div className="dashboard-users-list">
            {users.map((user) => (
              <Link className="dashboard-user-row" href={`/users/${user.id}`} key={user.id}>
                <div>
                  {user.avatar ? <img src={user.avatar} alt={user.fullName ?? user.email} /> : <span>{initial(user.fullName || user.email)}</span>}
                  <div>
                    <strong>{user.fullName || "Chưa có tên"}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            ))}
          </div>
          <Link className="dashboard-users-card__all" href="/users">Quản lý tất cả</Link>
        </aside>
      </section>

      <section className="admin-dashboard__bottom-grid">
        <article className="dashboard-glass-card dashboard-categories">
          <h2>Phân Bổ Danh Mục</h2>
          <div className="dashboard-category-grid">
            {visibleCategories.map((category, index) => (
              <div className="dashboard-category" key={category.id}>
                <span style={{ background: category.color ?? ["rgba(0,219,233,.12)", "rgba(182,0,248,.12)", "rgba(235,178,255,.12)"][index % 3] }}>
                  {category.icon || category.name.slice(0, 1)}
                </span>
                <div>
                  <small>{category.name}</small>
                  <strong>{formatCurrency(category.totalAmount)}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-glass-card dashboard-budget">
          <div>
            <h2>Hạn Mức Ngân Sách</h2>
            <p>Hạn mức chi tiêu toàn hệ thống tháng này.</p>
          </div>
          <div>
            <div className="dashboard-budget__meta">
              <span>{budgetPercent}% đã dùng</span>
              <span>{formatCurrency(summary.totalExpenses)} / {formatCurrency(activeBudget)}</span>
            </div>
            <div className="dashboard-budget__track">
              <div style={{ width: `${budgetPercent}%` }} />
            </div>
          </div>
          <Link href="/expenses">Xem chi tiêu</Link>
        </article>
      </section>
    </section>
  );
}
