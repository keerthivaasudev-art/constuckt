"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, Check } from "lucide-react"

const DropdownMenu = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            onClick: () => onOpenChange ? onOpenChange(!isOpen) : setInternalOpen(!isOpen) 
          })
        }
        if (isOpen && React.isValidElement(child) && child.type === DropdownMenuContent) {
          return child
        }
        return null
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, asChild, ...props }: { children: React.ReactNode, asChild?: boolean, [key: string]: any }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, props)
  }
  return <button {...props}>{children}</button>
}

const DropdownMenuContent = ({ children, className, align = "end" }: { children: React.ReactNode, className?: string, align?: "start" | "end" }) => (
  <div className={cn(
    "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
    align === "end" ? "right-0" : "left-0",
    className
  )}>
    {children}
  </div>
)

const DropdownMenuItem = ({ children, className, onClick, variant = "default" }: { children: React.ReactNode, className?: string, onClick?: () => void, variant?: "default" | "destructive" }) => (
  <div
    onClick={onClick}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
      variant === "destructive" && "text-red-600 hover:bg-red-50 hover:text-red-700",
      className
    )}
  >
    {children}
  </div>
)

const DropdownMenuLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>
)

const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
)

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => <span className="ml-auto text-xs tracking-widest opacity-60">{children}</span>
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <div className="relative">{children}</div>
const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <div className="flex items-center px-2 py-1.5 text-sm">{children}<ChevronRight className="ml-auto h-4 w-4" /></div>
const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <div className="absolute left-full top-0 ml-1">{children}</div>
const DropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => <div className="flex items-center px-2 py-1.5 text-sm">{children}</div>
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => <div className="flex items-center px-2 py-1.5 text-sm">{children}</div>

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
