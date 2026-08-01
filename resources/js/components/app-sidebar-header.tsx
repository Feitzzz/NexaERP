import { usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();

    void breadcrumbs;
    const initials =
        auth.user?.name
            ?.split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() ?? 'NE';

    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border/70 bg-background/95 px-4 backdrop-blur md:px-6">
            <SidebarTrigger className="-ml-1 text-muted-foreground" />
            <div className="ml-auto flex items-center gap-1">
                <button
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label={`Switch to ${resolvedAppearance === 'dark' ? 'light' : 'dark'} mode`}
                    onClick={() =>
                        updateAppearance(
                            resolvedAppearance === 'dark' ? 'light' : 'dark',
                        )
                    }
                    type="button"
                >
                    {resolvedAppearance === 'dark' ? (
                        <Sun className="size-4" />
                    ) : (
                        <Moon className="size-4" />
                    )}
                </button>
                <div className="ml-2 hidden items-center gap-2 border-l pl-4 sm:flex">
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="max-w-36 truncate text-sm font-medium">
                        {auth.user?.name}
                    </span>
                </div>
            </div>
        </header>
    );
}
