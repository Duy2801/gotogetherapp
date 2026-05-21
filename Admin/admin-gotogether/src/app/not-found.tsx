import Link from "next/link";

export default function NotFound() {
  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Không tìm thấy trang</h1>
        <p className="muted">Đường dẫn bạn mở không tồn tại trong bảng quản trị này.</p>
        <Link className="btn btn--solid" href="/">
          Về trang tổng quan
        </Link>
      </section>
    </div>
  );
}