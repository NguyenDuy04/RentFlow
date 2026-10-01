"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { usePayments } from "@/hooks/use-payments";
import { useBills } from "@/hooks/use-bills";
import { useRooms } from "@/hooks/use-rooms";
import { Card } from "@/components/ui/card";
import { PaymentTable } from "@/components/payments/payment-table";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const methodT = useTranslations("payments.method");
  const [month, setMonth] = useState("");
  const [method, setMethod] = useState("");
  const [search, setSearch] = useState("");
  const { data: payments, isLoading } = usePayments();
  const { data: bills } = useBills();
  const { data: rooms } = useRooms();

  const billMap = new Map((bills || []).map((b) => [b.id, b]));
  const roomMap = new Map((rooms || []).map((r) => [r.id, r]));
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredPayments = (payments || []).filter((payment) => {
    if (method && payment.method !== method) return false;
    if (month && !payment.payment_date.startsWith(month)) return false;
    if (!normalizedSearch) return true;

    const bill = billMap.get(payment.bill_id);
    const room = bill ? roomMap.get(bill.room_id) : undefined;
    const searchable = [
      bill?.bill_code,
      room?.room_code,
      room?.name,
      payment.transaction_code,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return searchable.includes(normalizedSearch);
  });
  const totalAmount = filteredPayments.reduce((total, payment) => total + payment.amount, 0);
  const hasFilters = Boolean(month || method || normalizedSearch);
  const methodOptions = [
    { value: "cash", label: methodT("cash") },
    { value: "bank_transfer", label: methodT("bankTransfer") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          aria-label={t("filters.search")}
          placeholder={t("filters.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Input
          aria-label={t("filters.month")}
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
        <Select
          aria-label={t("filters.method")}
          options={methodOptions}
          placeholder={t("filters.allMethods")}
          value={method}
          onChange={(event) => setMethod(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-y border-border py-3">
        <div>
          <p className="text-xs text-muted-foreground">{t("summary.count")}</p>
          <p className="font-medium">{isLoading ? "—" : filteredPayments.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("summary.total")}</p>
          <p className="font-semibold">{isLoading ? "—" : formatCurrency(totalAmount)}</p>
        </div>
      </div>

      <Card>
        <PaymentTable
          payments={filteredPayments}
          isLoading={isLoading}
          billMap={billMap}
          roomMap={roomMap}
          emptyMessage={hasFilters ? t("table.noResults") : undefined}
        />
      </Card>
    </div>
  );
}
