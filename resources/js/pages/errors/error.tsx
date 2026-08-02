import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type ErrorPageProps = {
    status: number;
    message: string;
};

export default function ErrorPage({ status, message }: ErrorPageProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="max-w-lg text-center">
                <Head title={`Error ${status}`} />
                <p className="text-sm font-semibold text-muted-foreground">
                    Error {status}
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">
                    We could not complete that request
                </h1>
                <p className="mt-4 text-muted-foreground">{message}</p>
                <Button asChild className="mt-8">
                    <Link href="/dashboard">Return to dashboard</Link>
                </Button>
            </div>
        </main>
    );
}
