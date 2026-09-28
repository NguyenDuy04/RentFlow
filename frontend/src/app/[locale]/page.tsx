'use client'

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getToken, clearToken } from "@/lib/auth";
import { api } from "@/lib/api-client"

export default function RootPage() {
    const router = useRouter();
    const t = useTranslations("app");

    useEffect(() => {
        let cancelled = false;

        async function decide() {
            const token = getToken();

            if (!token) {
                // Chưa đăng nhập -> kiểm tra xem đây có phải lần triển khai đầu tiên
                try {
                    const status = await api.get<{ needs_setup: boolean }>("/auth/setup-status");
                    if (!cancelled) router.replace(status.needs_setup ? "/register" : "/login");
                } catch {
                    if (!cancelled) router.replace("/login");
                }
                return;
            }

            // Có token trong storage KHÔNG có nghĩa là còn hợp lệ (có thể đã hết
            // hạn). Phải xác thực thật với backend trước khi tin tưởng nó, nếu
            // không token cũ sẽ đẩy vào /dashboard, rồi /dashboard lại đẩy ngược
            // về /login vì 401 -> lặp vô hạn.
            try {
                await api.get("/auth/me");
                if (!cancelled) router.replace("/dashboard");
            } catch {
                clearToken();
                if (!cancelled) router.replace("/login");
            }
        }

        decide();
        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <main
            className="flex min-h-screen items-center justify-center bg-background"
            role="status"
            aria-label={t("loading")}>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">{t("loading")}</span>
            </div>
        </main>
    );
}