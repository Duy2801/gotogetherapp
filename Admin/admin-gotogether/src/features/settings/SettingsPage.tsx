"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchSettings, saveSettings } from "@/lib/api";
import { mockSettings } from "@/lib/mock-data";
import type { AppSettings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(mockSettings);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => setSettings(mockSettings));
  }, []);

  return (
    <div className="page-stack">
      <PageHeader title="Cài đặt" description="Tuỳ chọn hệ thống, ngôn ngữ và các điều khiển báo cáo cho bảng quản trị." />

      <Card title="Cấu hình chung" subtitle="Lưu qua API quản trị khi có backend">
        <form
          className="field-stack"
          onSubmit={async (event) => {
            event.preventDefault();
            const nextSettings = await saveSettings(settings);
            setSettings(nextSettings);
          }}
        >
          <div className="grid-3">
            <label className="field">
              <span>Ngôn ngữ</span>
              <select value={settings.language} onChange={(event) => setSettings((current) => ({ ...current, language: event.target.value }))}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">Tiếng Anh</option>
              </select>
            </label>
            <label className="field">
              <span>Múi giờ</span>
              <input value={settings.timezone} onChange={(event) => setSettings((current) => ({ ...current, timezone: event.target.value }))} />
            </label>
            <label className="field">
              <span>Tiền tệ</span>
              <input value={settings.currency} onChange={(event) => setSettings((current) => ({ ...current, currency: event.target.value }))} />
            </label>
            <label className="field">
              <span>Chu kỳ báo cáo</span>
              <select value={settings.reportMode} onChange={(event) => setSettings((current) => ({ ...current, reportMode: event.target.value }))}>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </label>
            <label className="field">
              <span>Tự khóa sau (phút)</span>
              <input type="number" value={settings.autoLockMinutes} onChange={(event) => setSettings((current) => ({ ...current, autoLockMinutes: Number(event.target.value) }))} />
            </label>
            <label className="field" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
              <input checked={settings.notificationsEnabled} onChange={(event) => setSettings((current) => ({ ...current, notificationsEnabled: event.target.checked }))} type="checkbox" />
              <span>Bật thông báo</span>
            </label>
          </div>

          <div className="link-list">
            <button className="btn btn--solid" type="submit">Lưu cài đặt</button>
          </div>
        </form>
      </Card>
    </div>
  );
}