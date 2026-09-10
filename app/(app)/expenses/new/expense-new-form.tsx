"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { createExpenseAction } from "@/lib/actions/homes";
import {
  EXPENSE_CATEGORY_OPTIONS,
  type ExpenseEligibleHome,
} from "@/lib/types/homes";
import { TOAST_MESSAGES } from "@/lib/utils/toast-messages";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/ui/form-actions";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";

type ExpenseNewFormProps = {
  homes: ExpenseEligibleHome[];
};

type FormErrors = {
  homeId?: string;
  category?: string;
  amount?: string;
  dueDay?: string;
};

export function ExpenseNewForm({ homes }: ExpenseNewFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const result = await createExpenseAction(formData);

    if (!result.success) {
      setErrors(result.errors);
      setLoading(false);
      return;
    }

    toast.success(TOAST_MESSAGES.saved);
    router.push("/expenses");
  }

  return (
    <form onSubmit={handleSubmit} className="ui-form-page">
      <FormSection title="공과금 정보">
        <Select
          name="homeId"
          label="집"
          defaultValue={homes[0]?.id ?? ""}
          required
          error={errors.homeId}
          options={homes.map((home) => ({
            value: home.id,
            label: home.nickname,
          }))}
        />
        <Select
          name="category"
          label="공과금 종류"
          defaultValue={EXPENSE_CATEGORY_OPTIONS[0]}
          required
          error={errors.category}
          options={EXPENSE_CATEGORY_OPTIONS.map((category) => ({
            value: category,
            label: category,
          }))}
        />
        <MoneyInput
          name="amount"
          label="금액"
          placeholder="예: 80,000"
          required
          error={errors.amount}
        />
        <Input
          name="dueDay"
          label="납부 예정일"
          type="number"
          min={1}
          max={31}
          step={1}
          placeholder="예: 10"
          required
          error={errors.dueDay}
          helperText="이번 달 공과금으로 등록됩니다."
        />
      </FormSection>

      <FormActions>
        <Button type="submit" loading={loading}>
          등록하기
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/expenses")}
        >
          취소
        </Button>
      </FormActions>
    </form>
  );
}
