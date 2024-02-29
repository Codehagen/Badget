import { useCallback, useMemo } from "react";

import { FlowStep, useFlowControl } from "@/hooks/use-flow-control";
import { useFlowModalState } from "@/hooks/use-flow-modal-state";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountForm } from "@/components/forms/account-form";

import { AccountTypeSelection } from "./components/account-type-selection";
import { HeaderControls } from "./components/header-controls";

export type AccountType =
  | "real-estate"
  | "crypto"
  | "investment"
  | "input"
  | "car"
  | "misc";

export interface AccountTypeInfo {
  type: AccountType;
  title: string;
  description: string;
  value: string;
  label: string;
  Icon: React.ElementType;
}

export const AddAssetFlow = () => {
  const { setAccountTypeInfo, accountTypeInfo, form } = useFlowModalState();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const handleSelectAccountType = useCallback(
    (selectedAccountType: AccountTypeInfo) => {
      setAccountTypeInfo(selectedAccountType);
      goToNextStep();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const accountFormTitle = accountTypeInfo
    ? `Add ${accountTypeInfo.title}`
    : "Step 2";
  const accountFormDescription = accountTypeInfo
    ? accountTypeInfo.description
    : "Description of Step 2";

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const steps = useMemo<FlowStep[]>(
    () => [
      {
        id: 0,
        title: "Add new account",
        description: "Add the account type you want.",
        component: (
          <AccountTypeSelection onSelectAccountType={handleSelectAccountType} />
        ),
      },
      {
        id: 1,
        title: accountFormTitle,
        description: accountFormDescription,
        component: accountTypeInfo ? (
          <AccountForm type={accountTypeInfo.type} form={form} />
        ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSelectAccountType, accountFormTitle, accountFormDescription],
  );

  const { currentStepId, goToNextStep, goToPreviousStep } = useFlowControl({
    steps,
  });

  const currentStep = useMemo(
    () => steps.find((step) => step.id === currentStepId),
    [steps, currentStepId],
  );

  return (
    <>
      <HeaderControls
        currentStepId={currentStepId}
        goToPreviousStep={goToPreviousStep}
      />
      <DialogHeader>
        <DialogTitle>{currentStep?.title}</DialogTitle>
        <DialogDescription>{currentStep?.description}</DialogDescription>
      </DialogHeader>
      {currentStep?.component}
      {/* TODO: make this part as a component */}
      {currentStepId === steps.length - 1 && (
        <DialogFooter>
          <Button>Add Property</Button>
        </DialogFooter>
      )}
    </>
  );
};
