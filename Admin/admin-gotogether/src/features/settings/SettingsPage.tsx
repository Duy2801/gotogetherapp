"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChevronRight,
  faDatabase,
  faEdit,
  faGlobe,
  faLock,
  faSave,
  faShieldHalved,
  faTriangleExclamation,
  faUserGear,
  faUsersGear,
} from "@fortawesome/free-solid-svg-icons";
import { fetchSettings, saveSettings } from "@/lib/api";
import type { AppSettings } from "@/lib/types";

const defaultSettings: AppSettings = {
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  reportMode: "monthly",
  notificationsEnabled: true,
  autoLockMinutes: 15,
  currency: "VND",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => setMessage("Không tải được cài đặt từ API."));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const nextSettings = await saveSettings(settings);
      setSettings(nextSettings);
      setMessage("Đã lưu thay đổi cài đặt.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không lưu được cài đặt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-console">
      <header className="settings-console__header">
        <div>
          <p>Hệ thống / Quản trị</p>
          <h1>Cài đặt hệ thống</h1>
          <span>Tùy chỉnh bảo mật, hiển thị và cấu hình vận hành của GoTogether Admin.</span>
        </div>
        <button className="settings-primary" onClick={handleSave} disabled={saving} type="button">
          <FontAwesomeIcon icon={faSave} />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </header>

      {message ? <div className="settings-message">{message}</div> : null}

      <section className="settings-grid">
        <article className="settings-card settings-card--profile">
          <div className="settings-card__title">
            <span><FontAwesomeIcon icon={faUserGear} /></span>
            <h2>Thông tin cá nhân</h2>
          </div>
          <div className="settings-profile">
            <div className="settings-profile__avatar">
              <img src="" alt="Admin profile" />
              <button type="button" aria-label="Sửa ảnh"><FontAwesomeIcon icon={faEdit} /></button>
            </div>
            <div className="settings-form-grid">
              <label className="settings-field">
                <span>Họ và tên</span>
                <input value="Admin User" readOnly />
              </label>
              <label className="settings-field">
                <span>Email</span>
                <input value="admin@gotogether.com" readOnly />
              </label>
              <label className="settings-field">
                <span>Vai trò</span>
                <input value="Quản trị viên cấp cao" readOnly />
              </label>
              <label className="settings-field">
                <span>Tự khóa sau</span>
                <input type="number" min="1" value={settings.autoLockMinutes} onChange={(event) => setSettings((current) => ({ ...current, autoLockMinutes: Number(event.target.value) }))} />
              </label>
            </div>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card__title settings-card__title--danger">
            <span><FontAwesomeIcon icon={faLock} /></span>
            <h2>Bảo mật</h2>
          </div>
          <p className="settings-card__desc">Quản lý mật khẩu và các lớp bảo vệ cho tài khoản quản trị.</p>
          <button className="settings-action-row" type="button">
            <span><FontAwesomeIcon icon={faLock} /> Thay đổi mật khẩu</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <button className="settings-action-row" type="button">
            <span><FontAwesomeIcon icon={faShieldHalved} /> Xác thực 2 yếu tố</span>
            <strong>Bật</strong>
          </button>
        </article>

        <article className="settings-card settings-card--system">
          <div className="settings-card__title">
            <span><FontAwesomeIcon icon={faGlobe} /></span>
            <h2>Cấu hình hệ thống</h2>
          </div>
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>Tiền tệ mặc định</span>
              <select value={settings.currency} onChange={(event) => setSettings((current) => ({ ...current, currency: event.target.value }))}>
                <option value="VND">VND (đ)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </label>
            <label className="settings-field">
              <span>Ngôn ngữ hiển thị</span>
              <select value={settings.language} onChange={(event) => setSettings((current) => ({ ...current, language: event.target.value }))}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="settings-field">
              <span>Múi giờ</span>
              <input value={settings.timezone} onChange={(event) => setSettings((current) => ({ ...current, timezone: event.target.value }))} />
            </label>
            <label className="settings-field">
              <span>Chu kỳ báo cáo</span>
              <select value={settings.reportMode} onChange={(event) => setSettings((current) => ({ ...current, reportMode: event.target.value }))}>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </label>
          </div>
          <div className="settings-switch-list">
            <label className="settings-switch-row">
              <span><FontAwesomeIcon icon={faBell} /> Bật thông báo</span>
              <input checked={settings.notificationsEnabled} onChange={(event) => setSettings((current) => ({ ...current, notificationsEnabled: event.target.checked }))} type="checkbox" />
            </label>
            <label className="settings-switch-row">
              <span>Cảnh báo chi tiêu vượt mức</span>
              <input checked readOnly type="checkbox" />
            </label>
            <label className="settings-switch-row">
              <span>Báo cáo hàng tuần</span>
              <input checked={settings.reportMode === "weekly"} onChange={(event) => setSettings((current) => ({ ...current, reportMode: event.target.checked ? "weekly" : "monthly" }))} type="checkbox" />
            </label>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card__title">
            <span><FontAwesomeIcon icon={faUsersGear} /></span>
            <h2>Nhóm quản trị</h2>
          </div>
          <button className="settings-link-button" type="button">+ Thêm mới</button>
          {["Hoang|Duyệt chi phí|H", "Khang|Quản trị viên|K", "Minh|Đang chờ xác nhận|M"].map((value) => {
            const [name, role, initial] = value.split("|");
            return (
              <div className="settings-admin-row" key={name}>
                <span>{initial}</span>
                <div>
                  <strong>{name}</strong>
                  <small>{role}</small>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            );
          })}
        </article>

        <article className="settings-card settings-card--danger-zone">
          <div className="settings-danger-copy">
            <span><FontAwesomeIcon icon={faTriangleExclamation} /></span>
            <div>
              <h2>Vùng nguy hiểm</h2>
              <p>Các hành động này không thể hoàn tác. Hãy cẩn thận trước khi thực hiện.</p>
            </div>
          </div>
          <div className="settings-danger-actions">
            <button type="button"><FontAwesomeIcon icon={faDatabase} /> Xóa dữ liệu tạm</button>
            <button type="button">Đặt lại toàn bộ hệ thống</button>
          </div>
        </article>
      </section>

      <footer className="settings-footer">
        <span><i /> Hệ thống hoạt động bình thường · v2.4.0</span>
        <span>© 2026 GoTogether Travel Expense Management</span>
      </footer>
    </section>
  );
}
