"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAdmin } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gotogether.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-hero">
          <div className="auth-brand">
            <div className="auth-brand__mark">↳</div>
            <div>
              <strong>GoTogether</strong>
              <span>Cổng quản trị du lịch</span>
            </div>
          </div>
          <h1>Đăng nhập vào tài khoản quản trị</h1>
          <p>
            Quản lý người dùng, danh mục, chuyến đi và phân tích tập trung với dữ liệu lấy trực tiếp từ backend.
          </p>

          <div className="auth-art" aria-hidden="true">
            <div className="auth-art__frame" />
          </div>
        </div>

        <section className="auth-card">
          <p className="eyebrow">Đăng nhập</p>
          <h2>Chào mừng trở lại</h2>

          <form
            className="field-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setError(null);
              try {
                const session = await loginAdmin(email, password);
                setSession(session);
                router.replace("/");
              } catch (loginError) {
                setError(loginError instanceof Error ? loginError.message : "Login failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="field field--stacked">
              <span>Địa chỉ email</span>
              <div className="field__input">
                <span className="field__icon">✉</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
              </div>
            </label>
            <div className="field-row">
              <label className="field field--stacked field--grow">
                <span>Mật khẩu</span>
                <div className="field__input">
                  <span className="field__icon">🔒</span>
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
                </div>
              </label>
              <a className="field-link" href="#">
                Quên mật khẩu?
              </a>
            </div>

            <label className="field field--inline">
              <input type="checkbox" />
              <span>Giữ đăng nhập trong 30 ngày</span>
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="btn btn--solid btn--block" disabled={loading} type="submit">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="auth-note">Chỉ dành cho người được cấp quyền. Khi đăng nhập, bạn đồng ý với quy trình bảo mật.</p>
          <p className="auth-footnote">© 2026 GO TOGETHER LIMITED. BUILD 0.2.1</p>
        </section>
      </div>
    </div>
  );
}