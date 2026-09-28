"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRooms } from "@/hooks/use-rooms";
import { useTransferRoom } from "@/hooks/use-tenants";
import { ApiError } from "@/lib/api-client";
import type { Tenant } from "@/types";
import { useTranslations } from "next-intl";

export function TransferRoomDialog({ tenant, onClose }: { tenant: Tenant | null; onClose: () => void }) {
  const t = useTranslations("tenants.transfer");
  const [newRoomId, setNewRoomId] = useState("");
  const { data: rooms } = useRooms();
  const transferRoom = useTransferRoom();

  const roomOptions = (rooms || [])
    .filter((r) => r.id !== tenant?.room_id)
    .map((r) => ({ value: r.id, label: `${r.room_code} - ${r.name}` }));

  const handleClose = () => {
    setNewRoomId("");
    onClose();
  };

  const handleTransfer = () => {
    if (!tenant || !newRoomId) return;
    transferRoom.mutate(
      { id: tenant.id, newRoomId },
      {
        onSuccess: () => {
          toast.success(t("success", { name: tenant.full_name }));
          handleClose();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("failed")),
      }
    );
  };

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { name: tenant?.full_name ?? "" })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="new_room">{t("newRoom")}</Label>
          <Select
            id="new_room"
            placeholder={t("placeholder")}
            options={roomOptions}
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleTransfer} disabled={!newRoomId || transferRoom.isPending}>
            {transferRoom.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
