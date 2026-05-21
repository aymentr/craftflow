"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ConfirmSubmitButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
  message: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function ConfirmSubmitButton({
  children,
  message,
  onClick,
  type = "submit",
  variant = "danger",
  ...props
}: ConfirmSubmitButtonProps) {
  return (
    <Button
      {...props}
      type={type}
      variant={variant}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
