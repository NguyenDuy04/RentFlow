"use client";

import { Link } from "@/i18n/navigation";
import { AlertTriangle, CalendarClock, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardAlerts } from "@/hooks/use-dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function AlertsPanel() {
    const t = useTranslations("dashboard.alerts");
    const { data, isLoading } = useDashboardAlerts();
    const hasAlerts = data && (data.overdue_bills.length > 0 || data.expiring_contracts.length > 0 || data.maintenance_rooms.length > 0);
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading
                    ?
                    (<div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>)
                    :
                    !hasAlerts
                        ?
                        (<p className="text-sm text-muted-foreground"> {t("noAlerts")} </p>)
                        :
                        (<>
                            {data!.overdue_bills.map((bill) => (
                                <Link key={bill._id} href="/billing" className="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm hover:bg-destructive/10">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                    <div>
                                        <p className="font-medium"> {t("overdueBill", { billCode: bill.bill_code, })} </p>
                                        <p className="text-xs text-muted-foreground"> {formatCurrency(bill.total_amount)} ·{" "} {t("dueDate", { date: formatDate(bill.due_date), })} </p>
                                    </div>
                                </Link>
                            ))}
                            {data!.expiring_contracts.map((tenant) => (
                                <Link key={tenant._id} href="/tenants" className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/10 p-3 text-sm hover:bg-accent/20">
                                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                                    <div>
                                        <p className="font-medium"> {t("contractExpiring", { fullName: tenant.full_name, })} </p>
                                        <p className="text-xs text-muted-foreground"> {t("contractEndDate", { date: formatDate(tenant.lease_end_date!), })} </p>
                                    </div>
                                </Link>
                            ))} {data!.maintenance_rooms.map((room) => (
                                <Link key={room._id} href="/rooms" className="flex items-start gap-3 rounded-md border border-border bg-muted/50 p-3 text-sm hover:bg-muted">
                                    <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium"> {t("roomMaintenance", { roomName: room.name, })} </p>
                                        <p className="text-xs text-muted-foreground"> {t("roomCode", { roomCode: room.room_code, })} </p>
                                    </div>
                                </Link>
                            ))} </>)}
            </CardContent>
        </Card>);
}
