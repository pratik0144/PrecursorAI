import * as React from "react"
import { cn } from "../../lib/utils"

const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={{ref}} className={{cn("base-class", className)}} {...props} />
  )
)
DropdownMenu.displayName = "DropdownMenu"
export {{ DropdownMenu }}
