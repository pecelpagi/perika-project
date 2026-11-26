"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "calc(infinity * 1px)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Sonner styles its toast without a layer, so these need `!`.
          toast:
            "cn-toast !rounded-full !border !border-border !bg-card !px-5 !py-3 !text-base !text-foreground !shadow-float !font-sans",
          title: "!font-normal",
          description: "!text-sm !text-muted-foreground",
          actionButton:
            "!h-9 !rounded-full !bg-primary !px-4 !text-sm !text-primary-foreground max-md:!h-11 max-md:!min-w-11",
          success: "[&_[data-icon]]:text-success",
          error: "[&_[data-icon]]:text-destructive",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
