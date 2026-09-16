import * as React from "react"
import { cn } from "../../lib/utils"

function Dialog({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props}>{children}</div>
}

export { Dialog }
