
import * as React from 'react';

import {cn} from '@/lib/utils';
import { Label } from './label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({className, label, ...props}, ref) => {
     const id = props.id || React.useId();
    return (
       <div className="grid w-full gap-1.5">
        {label && <Label htmlFor={id}>{label}</Label>}
        <textarea
            className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
            )}
            ref={ref}
            id={id}
            {...props}
        />
       </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
