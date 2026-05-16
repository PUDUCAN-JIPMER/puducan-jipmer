'use client';
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkAction {
    key: string;
    label: string;
    icon?: ReactNode;

    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    onClick: (selectedIds: string[]) => void;
    hidden?: boolean; // for conditionally hiding actions
}

interface BulkActionBarProps {
    selectedCount: number;
    selectedIds: string[];
    actions: BulkAction[];
    onClearSelection: () => void;
    className?: string;
}

export function BulkActionBar({
    selectedCount,
    selectedIds,
    actions,
    onClearSelection,
    className
}: BulkActionBarProps) {
    if (selectedCount === 0) return null; //  if no rows are selected
    const visibleActions = actions.filter(action => !action.hidden);

    return (
        <div className={cn(
        'animate-in slide-in-from-top-2 fade-in duration-200',
        'flex items-center gap-3 rounded-md border border-border bg-muted/60 px-3 py-2 mb-2',
        className
      )}>
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground mr-1 shrink-0">
                <span className="inline-flex items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 min-w-[1.25rem]">
                    selected
                </span>
            </span>

            <div className="h-4 w-px bg-border mx-1 shrink-o" aria-hidden />

            {visibleActions.map((action) => (
                <Button
                    key={action.key}
                    variant={action.variant ?? 'outline'}
                    size='sm'
                    className="h-7 gap-1.5 text-xs "

                    onClick={() => action.onClick(selectedIds)}
                >
                    {action.icon}
                    {action.label}
                </Button>
            ))}

            {/* Clear selection button */}
            <Button
                variant='ghost'
                size='sm'
                className="h-7 gap-1 text-xs ml-auto text-muted-foreground hover:text-foreground"
                onClick={onClearSelection}
            >
                <X className="h-3 w-3" />
                Clear Selection
            </Button>

        </div>
    )
}