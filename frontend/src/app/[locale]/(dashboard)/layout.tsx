"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { useMe } from "@/hooks/use-auth";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isError, isPending } = useMe();

    useEffect(() => {
        if (isError) router.replace("/login");
    }, [isError, router]);

    if (isError || isPending) {
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
