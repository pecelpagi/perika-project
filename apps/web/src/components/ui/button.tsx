import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button max-md:min-h-11 max-md:min-w-11 inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-base font-normal whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground hover:bg-brand-strong",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary/5 aria-expanded:bg-primary/5",
        secondary:
          "border border-border bg-card text-foreground hover:bg-muted aria-expanded:bg-muted",
        soft: "bg-secondary text-foreground hover:bg-input",
        inverse: "bg-inverse text-inverse-foreground hover:bg-inverse/90",
        ghost: "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "h-auto p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 px-6",
        icon: "size-11",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
