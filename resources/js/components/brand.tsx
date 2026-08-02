import { Link } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export function Brand({
    className,
    inverse = false,
}: {
    className?: string;
    inverse?: boolean;
}) {
    return (
        <Link
            href={home()}
            className={cn('inline-flex items-center gap-2.5', className)}
        >
            <span
                className={cn(
                    'flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm',
                    inverse && 'bg-white text-blue-700',
                )}
            >
                N
            </span>
            <span
                className={cn(
                    'text-[15px] font-semibold tracking-[-0.02em]',
                    inverse && 'text-white',
                )}
            >
                NexaERP
            </span>
        </Link>
    );
}

export function ThemeToggle({ inverse = false }: { inverse?: boolean }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const dark = resolvedAppearance === 'dark';

    return (
        <button
            type="button"
            onClick={() => updateAppearance(dark ? 'light' : 'dark')}
            aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
            className={cn(
                'flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                inverse &&
                    'border-white/15 bg-white/10 text-white hover:bg-white/15',
            )}
        >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
    );
}
