"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "@/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { CategoryItem } from "@/lib/types";

const emptyCategory = {
  name: "",
  icon: "",
  color: "#F59E0B",
  isDefault: false,
};

const categoryTabs = ["Loại chuyến đi", "Loại chi tiêu", "Gắn nhãn điểm đến"];

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [activeTab, setActiveTab] = useState(categoryTabs[0]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    let mounted = true;

    fetchCategories()
      .then((data) => {
        if (!mounted) return;
        setItems(data);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
        setError("Không tải được dữ liệu thật từ API.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedItem = useMemo(() => items.find((item) => item.id === selected) ?? null, [items, selected]);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !debouncedSearch || `${item.name} ${item.icon ?? ""}`.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [items, debouncedSearch]);

  useEffect(() => {
    if (selectedItem) {
      setForm({
        name: selectedItem.name,
        icon: selectedItem.icon ?? "",
        color: selectedItem.color ?? "#F59E0B",
        isDefault: selectedItem.isDefault,
      });
    } else {
      setForm(emptyCategory);
    }
  }, [selectedItem]);

  return (
    <section className="category-page page-stack">
      <div className="category-page__head">
        <div>
          <p className="page-kicker">QUẢN TRỊ / CẤU HÌNH CHUNG</p>
          <h1>Danh mục</h1>
          <p>Quản lý taxonomy cốt lõi cho chuyến đi, chi tiêu và gắn nhãn điểm đến.</p>
        </div>
        <button className="btn btn--solid" type="button" onClick={() => setSelected(null)}>
          + Tạo danh mục
        </button>
      </div>

      <div className="category-toolbar category-toolbar--sticky">
        <div className="tabs">
          {categoryTabs.map((tab) => (
            <button
              className={`tab ${activeTab === tab ? "tab--active" : ""}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <label className="topbar__search topbar__search--light">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm danh mục..." type="search" />
        </label>
      </div>

      <div className="category-shell">
        <Card title={selected ? "Sửa danh mục" : "Tạo danh mục"} subtitle={`Chế độ hiện tại: ${activeTab}`} className="sticky-panel">
          <form
            className="field-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                if (selected) {
                  const updated = await updateCategory(selected, form);
                  setItems((current: CategoryItem[]) => current.map((item: CategoryItem) => (item.id === selected ? { ...item, ...updated } : item)));
                } else {
                  const created = await createCategory(form);
                  setItems((current: CategoryItem[]) => [created, ...current]);
                }
                setSelected(null);
                setError(null);
              } catch {
                setError("Không thể lưu danh mục từ API.");
              }
            }}
          >
            <label className="field field--stacked">
              <span>Tên danh mục</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <div className="grid-2 grid-2--tight">
              <label className="field field--stacked">
                <span>Biểu tượng</span>
                <input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="🍜" />
              </label>
              <label className="field field--stacked">
                <span>Màu</span>
                <input value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} type="color" />
              </label>
            </div>
            <label className="field field--inline">
              <input checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} type="checkbox" />
              <span>Đặt làm danh mục mặc định</span>
            </label>
            <div className="link-list">
              <button className="btn btn--solid" type="submit">Lưu danh mục</button>
              <button className="btn btn--ghost" onClick={() => setSelected(null)} type="button">Hủy</button>
            </div>
          </form>
        </Card>

        <Card title="Danh sách danh mục" subtitle={`${visibleItems.length} danh mục đang hiển thị`}>
          {error ? <div className="empty-state empty-state--dashboard">{error}</div> : null}
          {loading ? <div className="empty-state empty-state--dashboard">Đang tải dữ liệu thật...</div> : null}
          <div className="category-table">
            <div className="category-table__head">
              <span>Tên</span>
              <span>Mô tả</span>
              <span>Số lần dùng</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>
            {!loading && !error && visibleItems.length === 0 ? (
              <div className="empty-state empty-state--dashboard">Không có danh mục nào từ API.</div>
            ) : null}
            {!loading && !error
              ? visibleItems.map((category) => (
                  <div className="category-row" key={category.id}>
                    <div className="category-row__name">
                      <span className="category-icon" style={{ background: category.color ?? "#0f766e" }}>
                        {category.icon || category.name.slice(0, 1)}
                      </span>
                      <strong>{category.name}</strong>
                    </div>
                    <p className="category-row__desc">{category.isDefault ? "Danh mục mặc định của hệ thống" : "Danh mục tuỳ chỉnh cho quản trị"}</p>
                    <div className="category-row__count">{category.expenseCount.toLocaleString()}</div>
                    <div>
                      <span className={`status-pill ${category.isDefault ? "status-pill--active" : "status-pill--inactive"}`}>
                        {category.isDefault ? "Đang bật" : "Ẩn"}
                      </span>
                    </div>
                    <div className="link-list category-row__actions">
                      <button className="btn btn--ghost" onClick={() => setSelected(category.id)} type="button">
                        Sửa
                      </button>
                      <button
                        className="btn btn--ghost btn--danger-outline"
                        onClick={async () => {
                          try {
                            await deleteCategory(category.id);
                            setItems((current: CategoryItem[]) => current.filter((item: CategoryItem) => item.id !== category.id));
                            setError(null);
                          } catch {
                            setError("Không thể xóa danh mục từ API.");
                          }
                        }}
                        type="button"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </Card>
      </div>

      <div className="category-kpis">
        <Card title="Phổ biến nhất" subtitle="Danh mục dùng nhiều nhất">
          <div className="kpi-card kpi-card--emerald">
            <strong>{visibleItems[0]?.name ?? "Không có"}</strong>
            <span>{visibleItems[0]?.expenseCount ?? 0} lượt dùng trong tháng</span>
          </div>
        </Card>
        <Card title="Tổng số bản ghi" subtitle="Dữ liệu danh mục đang theo dõi">
          <div className="kpi-card">
            <strong>{visibleItems.reduce((sum, category) => sum + category.expenseCount, 0).toLocaleString()}</strong>
            <span>Bản ghi trên toàn bộ danh mục</span>
          </div>
        </Card>
        <Card title="Sức khỏe danh mục" subtitle="Các danh mục mặc định đang bật">
          <div className="kpi-card kpi-card--dark">
            <strong>{visibleItems.filter((category) => category.isDefault).length}</strong>
            <span>Danh mục mặc định hoạt động</span>
          </div>
        </Card>
      </div>
    </section>
  );
}