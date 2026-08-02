import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, info: ErrorInfo): void {
        // Keep diagnostic details available to developers without rendering them to users.
        console.error('Unhandled frontend error', error, info);
    }

    public render(): ReactNode {
        if (this.state.hasError) {
            return (
                <main className="flex min-h-screen items-center justify-center bg-background px-6">
                    <div className="max-w-lg text-center">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Something went wrong
                        </h1>
                        <p className="mt-4 text-muted-foreground">
                            We could not display this page. Reload it to try
                            again.
                        </p>
                        <Button
                            className="mt-8"
                            onClick={() => window.location.reload()}
                        >
                            Reload page
                        </Button>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}
