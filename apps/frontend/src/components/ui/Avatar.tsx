import Image from "next/image";

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: "xs" | "sm" | "md" | "lg";
    online?: boolean;
}

const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-label-sm",
    md: "w-10 h-10 text-label-md",
    lg: "w-14 h-14 text-body-md",
};

const dotSizeClasses = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
};

function getInitials(name: string): string {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
    const colors = [
        "bg-primary-fixed text-on-primary-fixed",
        "bg-secondary-fixed text-on-secondary-fixed",
        "bg-tertiary-fixed text-on-tertiary-fixed",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

export default function Avatar({ src, name, size = "md", online }: AvatarProps) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isValidSrc = typeof src === "string" && src.trim().length > 0;
    return (
        <div className="relative inline-block flex-shrink-0">
            {isValidSrc ? (
                <Image
                    src={`${apiUrl}/${src}` as string}
                    alt={name}
                    width={56}
                    height={56}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} ${getColorFromName(
                        name
                    )} rounded-full flex items-center justify-center font-medium`}
                >
                    {getInitials(name)}
                </div>
            )}
            {online !== undefined && (
                <span
                    className={`absolute bottom-0 right-0 ${dotSizeClasses[size]} rounded-full border-2 border-surface-container-lowest ${online ? "bg-secondary" : "bg-outline-variant"
                        }`}
                    aria-label={online ? "Online" : "Offline"}
                />
            )}
        </div>
    );
}

export function AvatarStack({
    users,
    max = 3,
}: {
    users: { id: string; name: string; avatarUrl?: string | null }[];
    max?: number;
}) {
    const visible = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((user) => (
                <div key={user.id} className="ring-2 ring-surface-container-lowest rounded-full">
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </div>
            ))}
            {remaining > 0 && (
                <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant text-label-sm flex items-center justify-center ring-2 ring-surface-container-lowest">
                    +{remaining}
                </div>
            )}
        </div>
    );
}