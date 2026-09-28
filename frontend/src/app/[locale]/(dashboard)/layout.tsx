"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { getToken } from "@/lib/auth";
import { useMe } from "@/hooks/use-auth";

const subscribeToToken = (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
};

const getTokenSnapshot = () => Boolean(getToken());
const getServerTokenSnapshot = () => false;

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const hasToken = useSyncExternalStore(
        subscribeToToken,
        getTokenSnapshot,
        getServerTokenSnapshot,
    );

    useEffect(() => {
        if (!hasToken) router.replace("/login");
    }, [hasToken, router]);

    const { isError, isPending } = useMe(hasToken);

    useEffect(() => {
        if (isError) router.replace("/login");
    }, [isError, router]);

    if (!hasToken || isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen h-full">
            <Sidebar className="hidden w-60 shrink-0 lg:flex" />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-x-hidden bg-muted/30 p-4 pb-20 sm:p-6 lg:pb-6">
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>
            <BottomNav />
        </div>
    );
}
