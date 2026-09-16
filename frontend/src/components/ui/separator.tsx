import * as React from "react"
import { cn } from "../../lib/utils"

function Separator({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props}>{children}</div>
}

export { Separator }
