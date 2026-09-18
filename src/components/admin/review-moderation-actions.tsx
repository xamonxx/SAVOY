"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { approveReviewAction, rejectReviewAction } from "@/app/actions/admin-reviews";
import type { ModerationStatus } from "@/lib/reviews";

export function ReviewModerationActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: ModerationStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const handle = (action: "approve" | "reject") => {
    startTransition(async () => {
      const res = await (action === "approve" ? approveReviewAction(id) : rejectReviewAction(id));
      if (res.success) {
        setStatus(action === "approve" ? "approved" : "rejected");
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary">
        <Check className="size-3" />
        Disetujui
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-1 text-[11px] font-bold text-on-error-container">
        <X className="size-3" />
        Ditolak
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handle("approve")}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-md border border-primary/30 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        Setujui
      </button>
      <button
        type="button"
        onClick={() => handle("reject")}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-md border border-border-hairline px-2.5 py-1.5 text-xs font-medium text-muted-gray transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
        Tolak
      </button>
    </div>
  );
}
