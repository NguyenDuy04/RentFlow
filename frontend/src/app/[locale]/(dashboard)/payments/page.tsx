"use client";

import { usePayments } from "@/hooks/use-payments";
import { useBills } from "@/hooks/use-bills";
import { useRooms } from "@/hooks/use-rooms";
import { Card } from "@/components/ui/card";
import { PaymentTable } from "@/components/payments/payment-table";
import { useTranslations } from "next-intl";

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const { data: payments, isLoading } = usePayments();
  const { data: bills } = useBills();
  const { data: rooms } = useRooms();

  const billMap = new Map((bills || []).map((b) => [b.id, b]));
  const roomMap = new Map((rooms || []).map((r) => [r.id, r]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <Card>
        <PaymentTable payments={payments} isLoading={isLoading} billMap={billMap} roomMap={roomMap} />
      </Card>
    </div>
  );
}
