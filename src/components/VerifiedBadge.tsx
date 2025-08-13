import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import clsx from "clsx";

type Status = "verified" | "pending" | "unverified";
type Size = "sm" | "md" | "lg";
type Variant = "solid" | "soft";

interface VerifiedBadgeProps {
    status?: Status;
    size?: Size;
    variant?: Variant;
    className?: string;
    withTooltip?: boolean;
    labelVerified?: string;
    labelPending?: string;
    labelUnverified?: string;
}

const sizeClasses: Record<Size, { root: string; icon: string }> = {
    sm: { root: "text-[11px] px-2 py-0.5 rounded-md", icon: "h-3.5 w-3.5" },
    md: { root: "text-[12px] px-2.5 py-1 rounded-md", icon: "h-4 w-4" },
    lg: { root: "text-sm px-3 py-1.5 rounded-lg", icon: "h-5 w-5" },
};

export function VerifiedBadge({
                                  status = "verified",
                                  size = "md",
                                  variant = "soft",
                                  className,
                                  withTooltip = true,
                                  labelVerified = "Identité vérifiée",
                                  labelPending = "Vérification en cours",
                                  labelUnverified = "Identité non vérifiée",
                              }: VerifiedBadgeProps) {
    const labels: Record<Status, string> = {
        verified: labelVerified,
        pending: labelPending,
        unverified: labelUnverified,
    };

    const palette =
        status === "verified"
            ? variant === "solid"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:ring-emerald-800/60"
            : status === "pending"
                ? variant === "solid"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-800/60"
                : variant === "solid"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700/60";

    // const Icon = status === "verified" ? ShieldCheck : status === "pending" ? ShieldAlert : Shield;
    const Icon = status === "verified" ? ShieldCheck : status === "pending" ? ShieldAlert : Shield;
    const content = (
        // Dans le rendu:
        <span
            className={clsx(
                "inline-flex items-center gap-1.5 leading-none font-medium select-none",
                sizeClasses[size].root,
                palette,
                className
            )}
            aria-label={labels[status]}
            title={labels[status]}
        >
  <Icon className={clsx(sizeClasses[size].icon, status === "verified" && "text-emerald-600")} aria-hidden="true" />
  <span className={status === "verified" ? "text-emerald-700" : undefined}>{labels[status]}</span>
</span>
    );

    if (!withTooltip) return content;

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="top" className="px-2 py-1 text-xs">
                    {labels[status]}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}