"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { fetchMe } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    let mounted = true;
    fetchMe()
      .then((profile) => {
        if (mounted) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (mounted) {
          router.replace("/login");
        }
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!user) {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <p className="muted">Đang tải bảng quản trị...</p>
        </section>
      </div>
    );
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}