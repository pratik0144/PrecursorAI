import * as React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={{ref}} className={{cn("base-class", className)}} {...props} />
  )
)
Select.displayName = "Select"
export {{ Select }}
