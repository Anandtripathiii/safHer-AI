"use client";
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const sides = {
  right: "inset-y-0 right-0 h-full w-full sm:max-w-md sheet-in-right",
  bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl sheet-in-bottom",
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & { side?: keyof typeof sides }
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-[1100] bg-ink/30 backdrop-blur-[2px]" />
    <SheetPrimitive.Content ref={ref} className={cn("fixed z-[1101] overflow-y-auto bg-surface p-6 shadow-md", sides[side], className)} {...props}>
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-pink-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-strong">
        <X size={18} />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-ink", className)} {...props} />,
);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted", className)} {...props} />,
);
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
