"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faPlaneDeparture,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { loginAdmin } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gotogether.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="auth-page">
      <div className="auth-shell" aria-label="Đăng nhập quản trị GoTogether">
        <section className="auth-hero">
          <div className="auth-brand">
            <div className="auth-brand__mark">
              <FontAwesomeIcon icon={faPlaneDeparture} />
            </div>
            <div>
              <strong>GoTogether</strong>
            </div>
          </div>

          <div className="auth-hero__copy">
            <h1>
              Đăng nhập vào <span>tài khoản quản trị</span>
            </h1>
            <p>
              Quản lý người dùng, chi tiêu du lịch và phân tích tập trung với dữ liệu lấy trực tiếp từ hệ thống quản trị GoTogether.
            </p>
          </div>

        </section>

        <section className="auth-card">
          <div className="auth-card__head">
            <p className="eyebrow">Đăng nhập</p>
            <h2>Chào mừng trở lại</h2>
          </div>

          <form
            className="auth-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setError(null);
              try {
                const session = await loginAdmin(email, password);
                setSession(session);
                router.replace("/");
              } catch (loginError) {
                setError(loginError instanceof Error ? loginError.message : "Không thể đăng nhập. Vui lòng thử lại.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="auth-field">
              <label htmlFor="admin-email">Địa chỉ email</label>
              <div className="auth-field__control">
                <FontAwesomeIcon icon={faEnvelope} />
                <input
                  id="admin-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@gotogether.com"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field__label-row">
                <label htmlFor="admin-password">Mật khẩu</label>
                <a href="#">Quên mật khẩu?</a>
              </div>
              <div className="auth-field__control">
                <FontAwesomeIcon icon={faLock} />
                <input
                  id="admin-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                />
                <button
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="auth-field__toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <label className="auth-remember">
              <input
                checked={rememberSession}
                onChange={(event) => setRememberSession(event.target.checked)}
                type="checkbox"
              />
              <span>Ghi nhớ đăng nhập trong 30 ngày</span>
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="auth-submit" disabled={loading} type="submit">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="auth-note">
            <FontAwesomeIcon icon={faShieldHalved} />
            <p>Chỉ dành cho người được cấp quyền. Khi đăng nhập, bạn đồng ý với quy trình bảo mật của hệ thống.</p>
          </div>
        </section>
      </div>

      <footer className="auth-footer">
        <a href="#">Chính sách bảo mật</a>
        <a href="#">Điều khoản sử dụng</a>
        <span>© 2026 GO TOGETHER LIMITED. BUILD 0.2.1</span>
      </footer>
    </div>
  );
}
