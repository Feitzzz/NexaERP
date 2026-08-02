export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'space-y-1'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-base font-medium'
                        : 'text-2xl font-semibold tracking-[-0.025em] md:text-[28px]'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            )}
        </header>
    );
}
