"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faBell,
  faChartColumn,
  faGear,
  faMapLocationDot,
  faMoneyBillTrendUp,
  faPlus,
  faRightFromBracket,
  faRoute,
  faSearch,
  faTags,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { clearSession, normalizeSessionUser } from "@/lib/auth";
import { ADMIN_NAV_ITEMS } from "@/lib/navigation";
import type { SessionUser } from "@/lib/types";

const NAV_ICONS: Record<string, typeof faChartColumn> = {
  "/": faChartColumn,
  "/users": faUsers,
  "/categories": faTags,
  "/trips": faRoute,
  "/expenses": faMoneyBillTrendUp,
  "/destinations": faMapLocationDot,
  "/settings": faGear,
  "/analysis": faChartColumn,
};

type AdminShellProps = {
  user: SessionUser;
  children: ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const safeUser = useMemo(() => normalizeSessionUser(user), [user]);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar__sticky">
          <div className="brand">
            <div className="brand__mark">G</div>
            <div>
              <strong>GoTogether</strong>
              <span>Cổng quản trị</span>
            </div>
          </div>

          <nav className="nav">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} className={`nav__item ${active ? "nav__item--active" : ""}`} href={item.href}>
                  <span className="nav__icon" aria-hidden="true">
                    <FontAwesomeIcon icon={NAV_ICONS[item.href] ?? faChartColumn} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>


          <button
            className="btn btn--ghost sidebar__logout"
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
            type="button"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <label className="topbar__search" aria-label="Search admin">
            <FontAwesomeIcon icon={faSearch} className="topbar__icon" aria-hidden="true" />
            <input placeholder="Tìm dữ liệu, chuyến đi, người dùng..." type="search" />
          </label>
          <div className="topbar__meta">
            <button className="icon-btn" type="button" aria-label="Notifications">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className="icon-btn" type="button" aria-label="Sync">
              <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
            <span className="chip chip--muted">GoTogether</span>
            <span className="avatar-chip">{(safeUser.fullName || safeUser.email || "A").slice(0, 1).toUpperCase()}</span>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}