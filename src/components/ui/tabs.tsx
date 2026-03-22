import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{ value: string, setValue: (v: string) => void }>({ value: "", setValue: () => {} })

const Tabs = ({ children, defaultValue, value, onValueChange, className }: { children: React.ReactNode, defaultValue?: string, value?: string, onValueChange?: (v: string) => void, className?: string }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const activeValue = value !== undefined ? value : internalValue
  
  const setValue = (v: string) => {
    if (onValueChange) onValueChange(v)
    else setInternalValue(v)
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={cn("flex flex-col gap-2", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500", className)}>
    {children}
  </div>
)

const TabsTrigger = ({ children, value, className }: { children: React.ReactNode, value: string, className?: string }) => {
  const { value: activeValue, setValue } = React.useContext(TabsContext)
  const isActive = activeValue === value
  
  return (
    <button
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-slate-950 shadow-sm" : "hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ children, value, className }: { children: React.ReactNode, value: string, className?: string }) => {
  const { value: activeValue } = React.useContext(TabsContext)
  if (activeValue !== value) return null
  
  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none", className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
