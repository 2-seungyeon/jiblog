"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { updateHomeAction } from "@/lib/actions/homes";
import { RESIDENCE_STATUS_OPTIONS, type HomeDetail } from "@/lib/types/homes";
import { TOAST_MESSAGES } from "@/lib/utils/toast-messages";
import { toFormDate } from "@/lib/utils/homes";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { DateInput } from "@/components/ui/date-input";
import { FormActions } from "@/components/ui/form-actions";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type HomeEditFormProps = {
  home: HomeDetail;
};

export function HomeEditForm({ home }: HomeEditFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nickname?: string; address?: string }>(
    {},
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const result = await updateHomeAction(formData);

    if (!result.success) {
      setErrors(result.errors);
      setLoading(false);
      return;
    }

    toast.success(TOAST_MESSAGES.updated);
    router.push(`/homes/${result.homeId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="ui-form-page">
      <input type="hidden" name="homeId" value={home.id} />

      <FormSection title="집 정보">
        <Input
          name="nickname"
          label="별칭"
          placeholder="예: 학교 근처 원룸"
          defaultValue={home.nickname}
          required
          error={errors.nickname}
        />
        <Input
          name="address"
          label="주소"
          placeholder="예: 서울시 ○○구 ○○동"
          defaultValue={home.address}
          required
          error={errors.address}
        />
        <Input
          name="detailAddress"
          label="상세 주소 (동·호)"
          placeholder="예: 101동 502호"
          defaultValue={home.detailAddress ?? ""}
        />
      </FormSection>

      <FormSection title="생활 정보">
        <Select
          name="residenceStatus"
          label="거주 상태"
          defaultValue={home.residenceStatus}
          helperText="이사했거나 더 이상 관리하지 않는 집은 '과거 거주'로 변경하세요. 납부 기록은 그대로 남아요."
          options={RESIDENCE_STATUS_OPTIONS.map((status) => ({
            value: status,
            label: status,
          }))}
        />
        <DateInput
          name="moveInDate"
          label="입주일"
          defaultValue={home.moveInDate ? toFormDate(home.moveInDate) : ""}
        />
        <CheckboxField
          name={home.isPrimary ? undefined : "isPrimary"}
          defaultChecked={home.isPrimary}
          disabled={home.isPrimary}
          label="이 집을 대표 집으로 설정"
          helperText={
            home.isPrimary
              ? "대표 집은 다른 집을 대표로 지정해야 해제할 수 있어요. Dashboard와 납부 화면에서 우선 표시돼요."
              : "대표 집은 Dashboard와 납부 화면에서 우선 표시돼요."
          }
        />
        {home.isPrimary ? (
          <input type="hidden" name="isPrimary" value="on" />
        ) : null}
        <Textarea
          name="memo"
          label="메모"
          rows={4}
          placeholder="집에 대한 메모를 남겨보세요"
          defaultValue={home.memo ?? ""}
        />
      </FormSection>

      <FormActions>
        <Button type="submit" loading={loading}>
          저장하기
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/homes/${home.id}`)}
        >
          취소
        </Button>
      </FormActions>
    </form>
  );
}
