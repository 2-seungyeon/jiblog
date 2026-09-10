"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { deleteHomeAction } from "@/lib/actions/homes";
import {
  TOAST_MESSAGES,
  getActionErrorMessage,
} from "@/lib/utils/toast-messages";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Panel } from "@/components/ui/panel";

type HomeDeleteSectionProps = {
  homeId: string;
  homeNickname: string;
  canDelete: boolean;
  blockedMessage: string;
};

export function HomeDeleteSection({
  homeId,
  homeNickname,
  canDelete,
  blockedMessage,
}: HomeDeleteSectionProps) {
  const router = useRouter();
  const toast = useToast();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const result = await deleteHomeAction(homeId);

    if (!result.success) {
      setError(result.message);
      toast.error(getActionErrorMessage(result.message));
      setLoading(false);
      return;
    }

    toast.success(TOAST_MESSAGES.deleted);
    router.push("/homes");
  }

  return (
    <Panel>
      <h2 className="ui-panel-title">집 관리</h2>
      <p className="ui-metadata mt-2">
        이사했거나 더 이상 관리하지 않는 집은{" "}
        <span className="font-medium text-text-primary">과거 거주</span>로
        변경하세요. 기록은 유지됩니다.
      </p>

      {!canDelete ? (
        <p className="mt-3 text-sm text-text-secondary">{blockedMessage}</p>
      ) : (
        <div className="ui-panel-divider mt-5 space-y-4 pt-5">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-text-primary">집 삭제</h3>
            <p className="text-sm text-text-secondary">
              등록을 잘못한 경우에만 삭제할 수 있어요. 삭제한 집 정보는
              복구할 수 없어요.
            </p>
          </div>
          <Button
            ref={triggerRef}
            type="button"
            variant="danger"
            className="w-full sm:w-auto"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
          >
            이 집 삭제하기
          </Button>

          <Dialog
            open={open}
            returnFocusRef={triggerRef}
            onOpenChange={(nextOpen) => {
              if (!loading) {
                setOpen(nextOpen);
                if (!nextOpen) {
                  setError(null);
                }
              }
            }}
            title="이 집을 삭제할까요?"
            description={`${homeNickname}의 집 정보, 계약, 예정된 월세·공과금 일정이 함께 삭제돼요. 이사한 집은 삭제 대신 거주 상태를 '과거 거주'로 변경해주세요.`}
          >
            {error ? (
              <p className="mt-4 text-sm text-error" role="alert">
                {error}
              </p>
            ) : null}
            <DialogActions>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={loading}
                onClick={handleDelete}
              >
                삭제하기
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </Panel>
  );
}
