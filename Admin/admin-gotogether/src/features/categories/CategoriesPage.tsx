"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArchive,
  faChevronRight,
  faEdit,
  faFilter,
  faFolderOpen,
  faImage,
  faLayerGroup,
  faPlusCircle,
  faRobot,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "@/api";
import { formatCurrency } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { CategoryItem } from "@/lib/types";

const emptyCategory = {
  name: "",
  icon: "",
  color: "#00dbe9",
  isDefault: false,
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=180&q=80",
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=180&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=180&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=180&q=80",
];

function isImageUrl(value?: string | null) {
  if (!value) return false;
  return /^https?:\/\/.+\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value) || /^data:image\//i.test(value);
}

function categoryImage(category: CategoryItem, index: number) {
  return isImageUrl(category.icon) ? category.icon! : fallbackImages[index % fallbackImages.length];
}

function iconText(category: CategoryItem) {
  return category.icon && !isImageUrl(category.icon) ? category.icon : category.name.slice(0, 1).toUpperCase();
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không đọc được ảnh đã chọn."));
    reader.readAsDataURL(file);
  });
}

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [selected, setSelected] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  async function reload() {
    setLoading(true);
    try {
      setItems(await fetchCategories());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh mục từ API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        icon: selected.icon ?? "",
        color: selected.color ?? "#00dbe9",
        isDefault: selected.isDefault,
      });
    } else {
      setForm(emptyCategory);
    }
  }, [selected]);

  const visibleItems = useMemo(() => {
    const value = debouncedSearch.toLowerCase();
    return items.filter((item) => !value || `${item.name} ${item.icon ?? ""}`.toLowerCase().includes(value));
  }, [items, debouncedSearch]);

  function openCreateForm() {
    setSelected(null);
    setForm(emptyCategory);
    setFormOpen(true);
  }

  function openEditForm(category: CategoryItem) {
    setSelected(category);
    setFormOpen(true);
  }

  async function handleImagePick(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn đúng file ảnh.");
      return;
    }

    try {
      const imageData = await readImageAsDataUrl(file);
      setForm((current) => ({ ...current, icon: imageData }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đọc được ảnh đã chọn.");
    }
  }

  return (
    <section className="categories-console">
      <header className="categories-console__header">
        <div>
          <p>Hệ thống quản trị</p>
          <h1>Danh mục chi tiêu</h1>
          <span>Thiết lập và quản lý các loại hình chi phí cơ bản trong hệ thống.</span>
        </div>
        <div className="categories-console__actions">
          <label className="categories-search">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm danh mục..." type="search" />
          </label>
          <button className="categories-btn categories-btn--ghost" type="button">
            <FontAwesomeIcon icon={faFilter} />
            Bộ lọc
          </button>
          <button className="categories-btn categories-btn--primary" onClick={openCreateForm} type="button">
            <FontAwesomeIcon icon={faPlusCircle} />
            Thêm danh mục mới
          </button>
        </div>
      </header>

      {error ? <div className="categories-console__error">{error}</div> : null}

      <div className="categories-layout">
        <main className="categories-list-panel">
          <div className="categories-list-panel__head">
            <h2>Danh sách danh mục</h2>
            <div className="categories-view-toggle">
              <button type="button"><FontAwesomeIcon icon={faLayerGroup} /></button>
              <button type="button"><FontAwesomeIcon icon={faImage} /></button>
            </div>
          </div>

          {loading ? <div className="categories-empty">Đang tải dữ liệu...</div> : null}
          {!loading && visibleItems.length === 0 ? <div className="categories-empty">Không có danh mục phù hợp.</div> : null}

          <div className="categories-list">
            {visibleItems.map((category, index) => (
              <article className="category-management-card" key={category.id}>
                <div className="category-management-card__main">
                  <div className="category-management-card__media" style={{ borderColor: category.color ?? "rgba(0,219,233,.35)" }}>
                    <img src={categoryImage(category, index)} alt={category.name} />
                    <span>{iconText(category)}</span>
                  </div>
                  <div className="category-management-card__copy">
                    <div>
                      <h3>{category.name}</h3>
                      <span className={category.isDefault ? "category-state category-state--active" : "category-state"}>{category.isDefault ? "Đang hoạt động" : "Tùy chỉnh"}</span>
                    </div>
                    <p>{category.expenseCount.toLocaleString()} lần dùng · Tổng chi {formatCurrency(category.totalAmount)}</p>
                  </div>
                </div>
                <div className="category-management-card__actions">
                  <button onClick={() => openEditForm(category)} type="button">
                    <FontAwesomeIcon icon={faEdit} />
                    Sửa
                  </button>
                  <button
                    className="category-management-card__danger"
                    onClick={async () => {
                      if (!confirm(`Xóa danh mục ${category.name}?`)) return;
                      await deleteCategory(category.id);
                      await reload();
                    }}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="categories-side">
          <section className="categories-widget">
            <h2>Cấu hình chung</h2>
            <div className="categories-setting-row">
              <div>
                <FontAwesomeIcon icon={faRobot} />
                <span>Phân loại tự động</span>
              </div>
              <strong>Bật</strong>
            </div>
            <div className="categories-setting-row">
              <div>
                <FontAwesomeIcon icon={faLayerGroup} />
                <span>Tổng danh mục</span>
              </div>
              <strong>{items.length}</strong>
            </div>
          </section>

          <section className="categories-widget">
            <h2>Mẫu danh mục</h2>
            {["Du lịch công tác", "Phượt & trải nghiệm"].map((template, index) => (
              <button className="categories-template" key={template} type="button">
                <div>
                  <strong>{template}</strong>
                  <span>{index === 0 ? 8 : 12} danh mục chuẩn</span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            ))}
          </section>

          <section className="categories-widget">
            <h2>Hoạt động gần đây</h2>
            <div className="categories-activity">
              <span><FontAwesomeIcon icon={faPlusCircle} /></span>
              <p>Danh mục mới được đồng bộ từ API.</p>
            </div>
            <div className="categories-activity">
              <span><FontAwesomeIcon icon={faEdit} /></span>
              <p>Cập nhật hình ảnh hoặc màu nhận diện danh mục.</p>
            </div>
            <div className="categories-activity">
              <span><FontAwesomeIcon icon={faArchive} /></span>
              <p>Lưu trữ các danh mục không còn sử dụng.</p>
            </div>
          </section>
        </aside>
      </div>

      <footer className="categories-footer">
        <span>Đang hiển thị {visibleItems.length} trong tổng số {items.length} danh mục</span>
        <span>{formatCurrency(items.reduce((sum, item) => sum + item.totalAmount, 0))}</span>
      </footer>

      {formOpen ? (
        <div className="categories-modal" role="dialog" aria-modal="true">
          <div className="categories-modal__panel">
            <div className="categories-modal__head">
              <div>
                <p>{selected ? "Cập nhật" : "Tạo mới"}</p>
                <h2>{selected ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>
              </div>
              <button onClick={() => setFormOpen(false)} type="button">Đóng</button>
            </div>
            <form
              className="field-stack"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  if (selected) await updateCategory(selected.id, form);
                  else await createCategory(form);
                  setFormOpen(false);
                  setSelected(null);
                  await reload();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Không lưu được danh mục.");
                }
              }}
            >
              <label className="field field--stacked">
                <span>Tên danh mục</span>
                <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <div className="categories-image-picker">
                <div className="categories-image-picker__preview">
                  {isImageUrl(form.icon) ? (
                    <img src={form.icon} alt="Xem trước ảnh danh mục" />
                  ) : (
                    <FontAwesomeIcon icon={faImage} />
                  )}
                </div>
                <div className="categories-image-picker__body">
                  <span>Ảnh danh mục</span>
                  <label className="categories-image-picker__button">
                    <FontAwesomeIcon icon={faFolderOpen} />
                    Chọn ảnh từ thư mục
                    <input accept="image/*" type="file" onChange={(event) => handleImagePick(event.target.files?.[0])} />
                  </label>
                  {form.icon ? (
                    <button className="categories-image-picker__clear" type="button" onClick={() => setForm((current) => ({ ...current, icon: "" }))}>
                      Xóa ảnh
                    </button>
                  ) : null}
                </div>
              </div>
              <label className="field field--stacked">
                <span>Ảnh danh mục hoặc biểu tượng</span>
                <input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="https://.../image.jpg hoặc 🍜" />
              </label>
              {isImageUrl(form.icon) ? (
                <img className="categories-modal__preview" src={form.icon} alt="Xem trước ảnh danh mục" />
              ) : null}
              <div className="grid-2 grid-2--tight">
                <label className="field field--stacked">
                  <span>Màu</span>
                  <input value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} type="color" />
                </label>
                <label className="field field--inline">
                  <input checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} type="checkbox" />
                  <span>Danh mục mặc định</span>
                </label>
              </div>
              <button className="categories-btn categories-btn--primary" type="submit">{selected ? "Cập nhật" : "Thêm mới"}</button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
