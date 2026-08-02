import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { auth } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <span className="text-sm font-bold">N</span>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    NexaERP
                </span>
                <span className="truncate text-[11px] leading-tight text-muted-foreground">
                    {auth.user?.name}
                </span>
            </div>
        </>
    );
}
