
import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, ...props }, ref) => {
    const id = props.id || React.useId();
    const hasIcon = icon !== undefined;
    
    return (
      <div className="grid w-full items-center gap-1.5">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
            {hasIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
                    {icon}
                </div>
            )}
            <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                hasIcon && "pl-9",
                className
            )}
            ref={ref}
            id={id}
            {...props}
            />
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
