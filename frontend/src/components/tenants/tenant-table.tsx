"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Users, ArrowRightLeft, FileX } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteTenant, useEndContract } from "@/hooks/use-tenants";
import { useRooms } from "@/hooks/use-rooms";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { Tenant } from "@/types";
import { TenantForm } from "@/components/tenants/tenant-form";
import { TransferRoomDialog } from "@/components/tenants/transfer-room-dialog";
import { useTranslations } from "next-intl";

export function TenantTable({ tenants, isLoading }: { tenants: Tenant[] | undefined; isLoading: boolean }) {
  const t = useTranslations("tenants");
  const common = useTranslations("common");
  const { data: rooms } = useRooms();
  const roomMap = new Map((rooms || []).map((r) => [r.id, r]));

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [transferringTenant, setTransferringTenant] = useState<Tenant | null>(null);
  const deleteTenant = useDeleteTenant();
  const endContract = useEndContract();

  const confirmDelete = () => {
    if (!deletingTenant) return;
    deleteTenant.mutate(deletingTenant.id, {
      onSuccess: () => {
        toast.success(t("table.deleted"));
        setDeletingTenant(null);
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("table.deleteFailed")),
    });
  };

  const handleEndContract = (tenant: Tenant) => {
    endContract.mutate(tenant.id, {
      onSuccess: () => toast.success(t("table.endContractSuccess", { name: tenant.full_name })),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("table.endContractFailed")),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
        <Users className="h-8 w-8" />
        <p>{t("table.empty")}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.fullName")}</TableHead>
            <TableHead>{t("table.phone")}</TableHead>
            <TableHead>{t("table.room")}</TableHead>
            <TableHead>{t("table.leaseStart")}</TableHead>
            <TableHead>{t("table.leaseEnd")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => {
            const room = tenant.room_id ? roomMap.get(tenant.room_id) : undefined;
            return (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.full_name}</TableCell>
                <TableCell>{tenant.phone}</TableCell>
                <TableCell>{room ? `${room.room_code} - ${room.name}` : "—"}</TableCell>
                <TableCell>{formatDate(tenant.lease_start_date)}</TableCell>
                <TableCell>{tenant.lease_end_date ? formatDate(tenant.lease_end_date) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={tenant.status === "active" ? "success" : "secondary"}>
                    {tenant.status === "active" ? t("status.active") : t("status.ended")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTenant(tenant)}>
                        <Pencil className="h-4 w-4" /> {t("table.edit")}
                      </DropdownMenuItem>
                      {tenant.status === "active" && (
                        <>
                          <DropdownMenuItem onClick={() => setTransferringTenant(tenant)}>
                            <ArrowRightLeft className="h-4 w-4" /> {t("table.transfer")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEndContract(tenant)}>
                            <FileX className="h-4 w-4" /> {t("table.endContract")}
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => setDeletingTenant(tenant)}>
                        <Trash2 className="h-4 w-4" /> {t("table.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.editTitle")}</DialogTitle>
          </DialogHeader>
          {editingTenant && <TenantForm tenant={editingTenant} onSuccess={() => setEditingTenant(null)} />}
        </DialogContent>
      </Dialog>

      <TransferRoomDialog tenant={transferringTenant} onClose={() => setTransferringTenant(null)} />

      <Dialog open={!!deletingTenant} onOpenChange={(open) => !open && setDeletingTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.deleteTitle", { name: deletingTenant?.full_name ?? "" })}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("table.deleteDescription")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingTenant(null)}>
              {common("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteTenant.isPending}>
              {t("table.deletedConfirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
