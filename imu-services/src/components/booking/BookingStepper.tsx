
import { cn } from '@/lib/utils';
import { Check } from "lucide-react";

interface BookingStepperProps {
    steps: { id: number; name: string }[];
    currentStep: number;
}

export function BookingStepper({ steps, currentStep }: BookingStepperProps) {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}>
                    <>
                    {stepIdx < steps.length - 1 ? (
                        <div className="absolute inset-0 top-4 left-4 -ml-px mt-0.5 h-0.5 w-full bg-border" aria-hidden="true" />
                    ) : null}
                     <div className="group relative flex items-start">
                        <span className="flex h-9 items-center">
                        <span className={cn(
                            "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                            currentStep > step.id ? "border-primary bg-primary" : currentStep === step.id ? "border-primary" : "border-border bg-background"
                        )}>
                            {currentStep > step.id ? (
                                <Check className="h-5 w-5 text-primary-foreground" />
                            ) : (
                                <span className={cn("h-2.5 w-2.5 rounded-full", currentStep === step.id ? "bg-primary" : "bg-border group-hover:bg-border/80")} />
                            )}
                        </span>
                        </span>
                        <span className="ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-semibold">{step.name}</span>
                        </span>
                    </div>
                    </>
                </li>
                ))}
            </ol>
        </nav>
    );
}
