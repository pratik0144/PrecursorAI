import * as React from "react"
import { cn } from "../../lib/utils"

function Tabs({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props}>{children}</div>
}

export { Tabs }
