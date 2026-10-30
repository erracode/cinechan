import * as React from "react"
import { Check, ChevronRight, MapPin } from "lucide-react"
import { cn } from "#/lib/utils"

export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
}

interface CascaderProps {
  options: CascaderOption[]
  value?: string
  onChange?: (value: string, selectedOptions: CascaderOption[]) => void
  placeholder?: string
  className?: string
}

export function Cascader({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: CascaderProps) {
  const [open, setOpen] = React.useState(false)
  const [activePath, setActivePath] = React.useState<string[]>([])
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = React.useState<"bottom" | "bottom-end">("bottom")

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  React.useEffect(() => {
    if (!open || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const dropdownWidth = 384 // w-96 = 24rem = 384px

    if (rect.right + dropdownWidth > viewportWidth) {
      setPlacement("bottom-end")
    } else {
      setPlacement("bottom")
    }
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getSelectedLabels = (): string[] => {
    const labels: string[] = []
    let currentOptions = options
    for (const val of activePath) {
      const found = currentOptions.find((o) => o.value === val)
      if (found) {
        labels.push(found.label)
        currentOptions = found.children || []
      }
    }
    return labels
  }

  const isLeaf = (option: CascaderOption): boolean => {
    return !option.children || option.children.length === 0
  }

  const handleSelect = (option: CascaderOption, level: number) => {
    if (isLeaf(option)) {
      const newPath = [...activePath.slice(0, level), option.value]
      setActivePath(newPath)
      setSelectedValue(option.value)
      setOpen(false)

      const selectedOptions: CascaderOption[] = []
      let co = options
      for (const val of newPath) {
        const f = co.find((o) => o.value === val)
        if (f) {
          selectedOptions.push(f)
          co = f.children || []
        }
      }
      onChange?.(option.value, selectedOptions)
    } else {
      setActivePath((prev) => [...prev.slice(0, level), option.value])
    }
  }

  const getCurrentOptions = (level: number): CascaderOption[] => {
    if (level === 0) return options
    let current = options
    for (let i = 0; i < level && i < activePath.length; i++) {
      const found = current.find((o) => o.value === activePath[i])
      if (found?.children) {
        current = found.children
      } else {
        return []
      }
    }
    return current
  }

  const selectedLabels = getSelectedLabels()
  const displayText = selectedLabels.length > 0 ? selectedLabels.join(" / ") : placeholder

  const visibleLevels = activePath.length > 0 ? activePath.length + 1 : 1
  const hasMoreChildren = activePath.length > 0 && (() => {
    let current = options
    for (const val of activePath) {
      const found = current.find((o) => o.value === val)
      if (found?.children && found.children.length > 0) return true
      if (found?.children) current = found.children
      else return false
    }
    return false
  })()

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) setActivePath([])
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-white/80 max-w-[200px] truncate">{displayText}</span>
        <ChevronRight className={cn("w-3 h-3 text-white/40 transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full mt-2 z-50 flex rounded-xl overflow-hidden bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl",
            placement === "bottom-end" ? "right-0" : "left-0",
          )}
          style={{ minWidth: `${visibleLevels * 192}px` }}
        >
          {Array.from({ length: Math.min(visibleLevels, 3) }).map((_, level) => {
            const currentOptions = getCurrentOptions(level)
            return (
              <div key={level} className={cn("w-48 max-h-64 overflow-y-auto p-1", level > 0 && "border-l border-white/5")}>
                {currentOptions.map((option) => {
                  const isActive = activePath[level] === option.value
                  const isChildActive = level < activePath.length && activePath[level + 1] !== undefined && (() => {
                    let co = options
                    for (let i = 0; i <= level; i++) {
                      const f = co.find((o) => o.value === activePath[i])
                      if (f?.children && f.children.find((c) => c.value === option.value)) return true
                      if (f?.children) co = f.children
                    }
                    return false
                  })()

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option, level)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left",
                        isActive ? "bg-primary/20 text-primary" : "text-white/80 hover:bg-white/5",
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {!isLeaf(option) && <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />}
                      {isLeaf(option) && selectedValue === option.value && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
