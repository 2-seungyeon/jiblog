"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { createContractAction } from "@/lib/actions/homes";
import { CONTRACT_TYPE_OPTIONS, type ContractType } from "@/lib/types/homes";
import { TOAST_MESSAGES } from "@/lib/utils/toast-messages";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { FormActions } from "@/components/ui/form-actions";
import { FormSection } from "@/components/ui/form-section";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";

type ContractNewFormProps = {
  homeId: string;
  homeNickname: string;
};

type FormErrors = {
  type?: string;
  startDate?: string;
  endDate?: string;
  deposit?: string;
  monthlyRent?: string;
  maintenanceFee?: string;
};

export function ContractNewForm({ homeId, homeNickname }: ContractNewFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [contractType, setContractType] = useState<ContractType>("월세");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const isJeonse = contractType === "전세";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    formData.set("homeId", homeId);

    if (isJeonse) {
      formData.set("monthlyRent", "0");
    }

    const result = await createContractAction(formData);

    if (!result.success) {
      setErrors(result.errors);
      setLoading(false);
      return;
    }

    toast.success(TOAST_MESSAGES.saved);
    router.push(`/homes/${result.homeId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="ui-form-page">
      <input type="hidden" name="homeId" value={homeId} />

      <FormSection title="계약 정보" description={homeNickname}>
        <Select
          name="type"
          label="계약 유형"
          value={contractType}
          onChange={(value) => setContractType(value as ContractType)}
          error={errors.type}
          options={CONTRACT_TYPE_OPTIONS.map((type) => ({
            value: type,
            label: type,
          }))}
        />
        <DateInput
          name="startDate"
          label="계약 시작일"
          required
          error={errors.startDate}
        />
        <DateInput
          name="endDate"
          label="계약 종료일"
          required
          error={errors.endDate}
        />
      </FormSection>

      <FormSection title="금액 정보">
        <MoneyInput
          name="deposit"
          label="보증금"
          placeholder="0"
          required
          error={errors.deposit}
        />
        <MoneyInput
          key={contractType}
          name="monthlyRent"
          label="월세"
          placeholder={isJeonse ? "해당 없음" : "0"}
          defaultValue={isJeonse ? 0 : undefined}
          disabled={isJeonse}
          required={!isJeonse}
          error={errors.monthlyRent}
        />
        <MoneyInput
          name="maintenanceFee"
          label="관리비"
          placeholder="0"
          error={errors.maintenanceFee}
        />
      </FormSection>

      <FormActions>
        <Button type="submit" loading={loading}>
          등록하기
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/homes/${homeId}`)}
        >
          취소
        </Button>
      </FormActions>
    </form>
  );
}
