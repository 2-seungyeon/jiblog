"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { createHomeAction } from "@/lib/actions/homes";
import { RESIDENCE_STATUS_OPTIONS } from "@/lib/types/homes";
import { TOAST_MESSAGES } from "@/lib/utils/toast-messages";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { DateInput } from "@/components/ui/date-input";
import { FormActions } from "@/components/ui/form-actions";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type HomeNewFormProps = {
  defaultIsPrimary: boolean;
};

export function HomeNewForm({ defaultIsPrimary }: HomeNewFormProps) {
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
    const result = await createHomeAction(formData);

    if (!result.success) {
      setErrors(result.errors);
      setLoading(false);
      return;
    }

    toast.success(TOAST_MESSAGES.saved);
    router.push(`/homes/${result.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="ui-form-page">
      <FormSection title="집 정보">
        <Input
          name="nickname"
          label="별칭"
          placeholder="예: 학교 근처 원룸"
          required
          error={errors.nickname}
        />
        <Input
          name="address"
          label="주소"
          placeholder="예: 서울시 ○○구 ○○동"
          required
          error={errors.address}
        />
        <Input
          name="detailAddress"
          label="상세 주소 (동·호)"
          placeholder="예: 101동 502호"
        />
      </FormSection>

      <FormSection title="생활 정보">
        <Select
          name="residenceStatus"
          label="거주 상태"
          defaultValue="거주 중"
          options={RESIDENCE_STATUS_OPTIONS.map((status) => ({
            value: status,
            label: status,
          }))}
        />
        <DateInput name="moveInDate" label="입주일" />
        <CheckboxField
          name="isPrimary"
          defaultChecked={defaultIsPrimary}
          label="이 집을 대표 집으로 설정"
          helperText="대표 집은 대시보드와 납부 화면에서 우선 표시돼요."
        />
        <Textarea
          name="memo"
          label="메모"
          rows={4}
          placeholder="집에 대한 메모를 남겨보세요"
        />
      </FormSection>

      <FormActions>
        <Button type="submit" loading={loading}>
          등록하기
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/homes")}
        >
          취소
        </Button>
      </FormActions>
    </form>
  );
}
