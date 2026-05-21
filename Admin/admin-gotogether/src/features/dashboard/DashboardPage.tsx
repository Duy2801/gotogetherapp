"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCreditCard,
  faCommentDots,
  faMapLocationDot,
  faMoneyBillTrendUp,
  faRoute,
  faTags,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchCategories, fetchDashboard, fetchDestinations, fetchTrips, fetchUsers } from "@/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { CategoryItem, DashboardSummary, DestinationItem, TripListItem, UserListItem } from "@/lib/types";

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function shortCompact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function StatCard({ label, value, footer, tone, icon }: { label: string; value: string; footer: string; tone: string; icon: IconDefinition }) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon ${tone}`} aria-hidden="true">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__footer">{footer}</div>
    </article>
  );
}

function summaryTotal(items: Array<{ value: number }>) {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function SparklineChart({ points }: { points: number[] }) {
  const width = 100;
  const height = 60;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(1, max - min);
  const coordinates = points.map((value, index) => {
    const x = (index / Math.max(1, points.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  });
  const fillPath = `M ${coordinates[0]} ${coordinates.slice(1).join(" ")} L ${width},${height} L 0,${height} Z`;

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Biểu đồ xu hướng 30 ngày">
      <defs>
        <linearGradient id="sparklineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(15,118,110,0.26)" />
          <stop offset="100%" stopColor="rgba(15,118,110,0.02)" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => (
        <line key={line} x1="0" y1={(height / 4) * line} x2={width} y2={(height / 4) * line} className="sparkline__grid" />
      ))}
      <path d={fillPath} fill="url(#sparklineFill)" />
      <polyline points={coordinates.join(" ")} className="sparkline__line" />
      {coordinates.map((point, index) => {
        const [x, y] = point.split(",").map(Number);
        return <circle key={index} cx={x} cy={y} r="1.8" className="sparkline__dot" />;
      })}
    </svg>
  );
}

function DonutChart({ items }: { items: Array<{ label: string; value: number; color: string }> }) {
  const total = summaryTotal(items) || 1;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-card">
      <svg viewBox="0 0 100 100" className="donut-chart" role="img" aria-label="Cơ cấu chi tiêu">
        <circle cx="50" cy="50" r={radius} className="donut-chart__track" />
        {items.map((item) => {
          const dash = (item.value / total) * circumference;
          const circle = (
            <circle
              key={item.label}
              cx="50"
              cy="50"
              r={radius}
              className="donut-chart__segment"
              stroke={item.color}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return circle;
        })}
        <text x="50" y="47" textAnchor="middle" className="donut-chart__value">{shortCompact(total)}</text>
        <text x="50" y="59" textAnchor="middle" className="donut-chart__label">TOTAL</text>
      </svg>

      <div className="donut-legend">
        {items.map((item) => (
          <div key={item.label} className="donut-legend__item">
            <span className="donut-legend__swatch" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{Math.round((item.value / total) * 100)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ title, detail, time, tone, icon }: { title: string; detail: string; time: string; tone: string; icon: IconDefinition }) {
  return (
    <div className="activity-item">
      <div className={`activity-item__avatar ${tone}`} aria-hidden="true">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="activity-item__body">
        <strong>{title}</strong>
        <div className="muted">{detail}</div>
        <span>{time}</span>
      </div>
    </div>
  );
}

function makeTrendPoints(summary: DashboardSummary) {
  const budget = Math.max(summary.totalBudget, summary.totalExpenses, 1);
  const tripLoad = summary.topTrips[0]?.expenseTotal ?? summary.totalExpenses / 4;
  return [0.62, 0.71, 0.83, 0.78, 0.91, 1].map((factor, index) => {
    const tripInfluence = index < 3 ? tripLoad * 0.08 : tripLoad * 0.12;
    return Math.max(0.18, ((summary.totalExpenses * factor + tripInfluence) / budget) * 12);
  });
}

type DashboardData = {
  summary: DashboardSummary;
  users: UserListItem[];
  categories: CategoryItem[];
  trips: TripListItem[];
  destinations: DestinationItem[];
};

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
  destinations: [],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchDashboard(), fetchUsers("", 1, 3), fetchCategories(), fetchTrips("", 1, 3), fetchDestinations()])
      .then(([summary, users, categories, trips, destinations]) => {
        if (!mounted) return;

        setData({
          summary,
          users: users.items,
          categories,
          trips: trips.items,
          destinations,
        });
      })
      .catch(() => {
        if (mounted) setError("Không tải được dữ liệu thật từ API.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = data?.summary ?? emptySummary;
  const users = data?.users ?? [];
  const categories = data?.categories ?? [];
  const trips = data?.trips ?? [];
  const destinations = data?.destinations ?? [];
  const hasMeaningfulData =
    summary.totalUsers > 0 ||
    summary.activeUsers > 0 ||
    summary.totalTrips > 0 ||
    summary.ongoingTrips > 0 ||
    summary.totalExpenses > 0 ||
    summary.totalBudget > 0 ||
    summary.topTrips.length > 0 ||
    summary.topCategories.length > 0 ||
    summary.destinations.length > 0 ||
    users.length > 0 ||
    categories.length > 0 ||
    trips.length > 0 ||
    destinations.length > 0;

  const trendPoints = useMemo(() => (hasMeaningfulData ? makeTrendPoints(summary) : [0, 0, 0, 0, 0, 0]), [hasMeaningfulData, summary]);
  const categoryItems = useMemo(
    () =>
      hasMeaningfulData
        ? categories.slice(0, 3).map((category, index) => ({
            label: category.name,
            value: category.totalAmount,
            color: ["#0f766e", "#6366f1", "#f59e0b"][index % 3],
          }))
        : [],
    [categories, hasMeaningfulData],
  );

  const activityFeed = useMemo(
    () =>
      hasMeaningfulData
        ? [
            {
              title: `${users[0]?.fullName ?? "Người dùng"} đã được đồng bộ`,
              detail: users[0]?.email ? `${users[0].email} đang là dữ liệu người dùng mới nhất.` : "Dữ liệu người dùng đang được tải từ API.",
              time: users[0]?.createdAt ? formatShortDate(users[0].createdAt) : "Mới đây",
              icon: faUserPlus,
              tone: "activity-item__avatar--teal",
            },
            {
              title: `${trips[0]?.name ?? "Chuyến đi"} đang có phát sinh`,
              detail: `${formatCurrency(trips[0]?.expenseTotal ?? summary.topTrips[0]?.expenseTotal ?? 0)} đã được ghi nhận trong chuyến đi gần nhất.`,
              time: trips[0]?.createdAt ? formatShortDate(trips[0].createdAt) : "15 phút trước",
              icon: faCreditCard,
              tone: "activity-item__avatar--orange",
            },
            {
              title: `${destinations[0]?.label ?? "Điểm đến"} vừa cập nhật`,
              detail: `${categories[0]?.name ?? "Danh mục"} đang dẫn đầu về số liệu chi tiêu.`,
              time: destinations[0]?.latestTripAt ? formatShortDate(destinations[0].latestTripAt) : "45 phút trước",
              icon: faCommentDots,
              tone: "activity-item__avatar--blue",
            },
          ]
        : [],
    [categories, destinations, hasMeaningfulData, summary.topTrips, trips, users],
  );

  const quickActions = [
    { href: "/users", title: "Người dùng", description: "Xem và quản lý tài khoản", icon: faUsers },
    { href: "/categories", title: "Danh mục", description: "Kiểm tra nhóm chi tiêu", icon: faTags },
    { href: "/expenses", title: "Chi tiêu", description: "Theo dõi dòng tiền", icon: faMoneyBillTrendUp },
    { href: "/trips", title: "Chuyến đi", description: "Mở danh sách chuyến", icon: faRoute },
  ] as const;

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        title="Tổng quan hệ thống"
        description="Theo dõi người dùng, chuyến đi, chi tiêu và điểm đến nổi bật trong một màn hình."
        actionLabel="Mở danh sách người dùng"
        actionHref="/users"
      />

      {!hasMeaningfulData ? (
        <Card title={data ? "Chưa có dữ liệu" : "Đang tải dữ liệu thật"} subtitle={error ?? (data ? "API đã phản hồi nhưng chưa có bản ghi nào để hiển thị." : "Kết nối API và chờ phản hồi từ hệ thống.")}>
          <div className="empty-state empty-state--dashboard">
            <p>{error ?? (data ? "Không có dữ liệu thật từ API." : "Đang lấy dữ liệu thật từ API...")}</p>
          </div>
        </Card>
      ) : (
        <>
          <section className="metrics-grid">
            <StatCard tone="stat-card__icon--teal" icon={faUsers} label="Tổng người dùng" value={compactNumber(summary.totalUsers)} footer={`${summary.activeUsers.toLocaleString()} đang hoạt động`} />
            <StatCard tone="stat-card__icon--blue" icon={faRoute} label="Chuyến đi hoạt động" value={summary.ongoingTrips.toString()} footer={`${summary.totalTrips.toLocaleString()} chuyến trong hệ thống`} />
            <StatCard tone="stat-card__icon--orange" icon={faMoneyBillTrendUp} label="Tổng chi tiêu" value={shortCompact(summary.totalExpenses)} footer={`${shortCompact(summary.totalBudget)} ngân sách theo dõi`} />
            <StatCard tone="stat-card__icon--violet" icon={faMapLocationDot} label="Điểm đến nổi bật" value={destinations[0]?.label ?? summary.destinations[0]?.label ?? "N/A"} footer="Trending hiện tại" />
          </section>

          <section className="dashboard-grid dashboard-grid--hero">
            <Card title="Xu hướng chuyến đi" subtitle={`Hiệu suất 30 ngày gần nhất - ${summary.month}/${summary.year}`}>
              <div className="card-toolbar">
                <button className="chip chip--muted" type="button">CSV</button>
                <button className="chip chip--accent" type="button">Theo tuần</button>
              </div>
              <SparklineChart points={trendPoints} />
              <div className="chart-axis">
                {['May 01', 'May 07', 'May 14', 'May 21', 'May 28', 'Jun 01'].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </Card>

            <Card title="Cơ cấu chi tiêu" subtitle="Phân bổ theo danh mục thực tế">
              {categoryItems.length > 0 ? <DonutChart items={categoryItems} /> : <div className="empty-state empty-state--dashboard"><p>Chưa có danh mục để hiển thị.</p></div>}
            </Card>
          </section>

          <section className="dashboard-grid dashboard-grid--secondary">
            <Card title="Lối tắt quản trị" subtitle="Đi nhanh tới các trang chính">
              <div className="action-grid">
                {quickActions.map((item) => (
                  <Link key={item.href} href={item.href} className="action-tile">
                    <span className="action-tile__icon" aria-hidden="true">
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    <span className="action-tile__title">{item.title}</span>
                    <span className="action-tile__desc">{item.description}</span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card title="Hoạt động gần đây" subtitle="Dữ liệu thật từ API" className="sticky-panel">
              <div className="activity-list">
                {activityFeed.length > 0 ? activityFeed.map((item) => <ActivityItem key={item.title} {...item} />) : <div className="empty-state empty-state--dashboard"><p>Không có hoạt động để hiển thị.</p></div>}
              </div>
              <Link className="link-list__view-all" href="/analysis">
                Xem tất cả
              </Link>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}