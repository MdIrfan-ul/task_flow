interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
    return (
        <div
            className={`bg-surface-container animate-pulse rounded-md ${className}`}
            aria-hidden="true"
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="stat-card flex flex-col gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
        </div>
    );
}

export function SkeletonTaskCard() {
    return (
        <div className="task-card flex flex-col gap-3">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center mt-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-10" />
            </div>
        </div>
    );
}

export function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 py-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}