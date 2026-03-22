import * as React from "react"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">{children}</div>
}

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => <>{children}</>
const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>

const DialogOverlay = ({ className }: { className?: string }) => (
  <div className={cn("fixed inset-0 z-[-1] bg-black/50 backdrop-blur-sm", className)} />
)

const DialogContent = ({ children, className, showCloseButton = true }: { children: React.ReactNode, className?: string, showCloseButton?: boolean }) => {
  return (
    <>
      <DialogOverlay />
      <div className={cn("relative z-50 w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 overflow-hidden", className)}>
        {children}
      </div>
    </>
  )
}

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-2 mb-4", className)} {...props} />
)

const DialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex justify-end gap-3 mt-6 border-t pt-4", className)} {...props} />
)

const DialogTitle = ({ className, ...props }: React.ComponentProps<"h2">) => (
  <h2 className={cn("text-xl font-bold leading-none tracking-tight", className)} {...props} />
)

const DialogDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p className={cn("text-sm text-slate-500", className)} {...props} />
)

const DialogClose = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
