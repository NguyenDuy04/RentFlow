"use client";

import { Link } from "@/i18n/navigation";
import { Wallet } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Bill, Payment, Room } from "@/types";
import { useTranslations } from "next-intl";

export function PaymentTable({
  payments,
  isLoading,
  billMap,
  roomMap,
  emptyMessage,
}: {
  payments: Payment[] | undefined;
  isLoading: boolean;
  billMap: Map<string, Bill>;
  roomMap: Map<string, Room>;
  emptyMessage?: string;
}) {
  const t = useTranslations("payments.table");
  const methodT = useTranslations("payments.method");
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
        <Wallet className="h-8 w-8" />
        <p>{emptyMessage || t("empty")}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("bill")}</TableHead>
          <TableHead>{t("room")}</TableHead>
          <TableHead>{t("amount")}</TableHead>
          <TableHead>{t("method")}</TableHead>
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("transactionCode")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => {
          const bill = billMap.get(p.bill_id);
          const room = bill ? roomMap.get(bill.room_id) : undefined;
          return (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                {bill ? (
                  <Link href={`/billing/${bill.id}`} className="hover:underline">
                    {bill.bill_code}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{room ? `${room.room_code} - ${room.name}` : "—"}</TableCell>
              <TableCell>{formatCurrency(p.amount)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{methodT(p.method === "bank_transfer" ? "bankTransfer" : "cash")}</Badge>
              </TableCell>
              <TableCell>{formatDateTime(p.payment_date)}</TableCell>
              <TableCell>{p.transaction_code || "—"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
