import { Form, Head } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

type JourneyProps = Props & {
    processing: boolean;
    errors: Record<string, string>;
};

const steps = [
    { title: 'Your account', description: 'Create secure sign-in details.' },
    { title: 'Your business', description: 'Tell us about your business.' },
    {
        title: 'Your location',
        description: 'Add an optional business address.',
    },
];

const fieldsByStep = [
    ['name', 'email', 'password', 'password_confirmation'],
    ['tin', 'phone', 'business_description'],
    ['street', 'city', 'lga', 'state', 'postal_code', 'country'],
];

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <RegistrationJourney
                        key={Object.keys(errors).sort().join(',')}
                        passwordRules={passwordRules}
                        processing={processing}
                        errors={errors}
                    />
                )}
            </Form>
        </>
    );
}

function RegistrationJourney({
    passwordRules,
    processing,
    errors,
}: JourneyProps) {
    const [step, setStep] = useState(() => {
        const errorStep = fieldsByStep.findIndex((fields) =>
            fields.some((field) => errors[field]),
        );

        return Math.max(errorStep, 0);
    });

    function continueJourney(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();

        const section = document.querySelector<HTMLElement>(
            `[data-registration-step="${step}"]`,
        );
        const fields = Array.from(
            section?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
                'input, textarea',
            ) ?? [],
        );
        const invalidField = fields.find((field) => !field.checkValidity());

        if (invalidField) {
            invalidField.reportValidity();
            invalidField.focus();

            return;
        }

        setStep((current) => Math.min(current + 1, steps.length - 1));
    }

    return (
        <>
            <div>
                <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>
                        Step {step + 1} of {steps.length}
                    </span>
                    <span>
                        {Math.round(((step + 1) / steps.length) * 100)}%
                    </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300"
                        style={{
                            width: `${((step + 1) / steps.length) * 100}%`,
                        }}
                    />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {steps.map((item, index) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => index < step && setStep(index)}
                            disabled={index > step}
                            className={cn(
                                'flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors',
                                index === step && 'bg-primary/10 text-primary',
                                index < step &&
                                    'text-foreground hover:bg-muted',
                                index > step && 'text-muted-foreground/60',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
                                    index <= step && 'border-primary',
                                    index < step &&
                                        'bg-primary text-primary-foreground',
                                )}
                            >
                                {index < step ? (
                                    <Check className="size-3.5" />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <span className="hidden truncate text-xs font-medium sm:block">
                                {item.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <section
                data-registration-step="0"
                className={cn('grid gap-5', step !== 0 && 'hidden')}
            >
                <StepHeading step={0} />
                <Field label="Business name" error={errors.name}>
                    <Input
                        id="name"
                        name="name"
                        required
                        autoFocus
                        autoComplete="organization"
                        placeholder="Nexa Trading Ltd"
                    />
                </Field>
                <Field label="Email address" error={errors.email}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="email@example.com"
                    />
                </Field>
                <Field label="Password" error={errors.password}>
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        autoComplete="new-password"
                        placeholder="Create a password"
                        passwordrules={passwordRules}
                    />
                </Field>
                <Field
                    label="Confirm password"
                    error={errors.password_confirmation}
                >
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        required
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        passwordrules={passwordRules}
                    />
                </Field>
            </section>

            <section
                data-registration-step="1"
                className={cn('grid gap-5', step !== 1 && 'hidden')}
            >
                <StepHeading step={1} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Tax Identification Number (TIN) · optional"
                        error={errors.tin}
                    >
                        <Input
                            id="tin"
                            name="tin"
                            placeholder="Enter tax number"
                        />
                    </Field>
                    <Field label="Phone number · optional" error={errors.phone}>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="08012345678"
                        />
                    </Field>
                </div>
                <Field
                    label="What does your business do? · optional"
                    error={errors.business_description}
                >
                    <textarea
                        id="business_description"
                        name="business_description"
                        className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        placeholder="For example: We sell household goods to retailers"
                    />
                </Field>
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
                    You can skip these details and complete your business
                    profile later.
                </p>
            </section>

            <section
                data-registration-step="2"
                className={cn('grid gap-5', step !== 2 && 'hidden')}
            >
                <StepHeading step={2} />
                <p className="text-xs leading-5 text-muted-foreground">
                    The address is optional. If you start entering it, include
                    street, city, state, and country.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Field
                            label="Street address · optional"
                            error={errors.street}
                        >
                            <Input
                                id="street"
                                name="street"
                                autoComplete="street-address"
                                placeholder="12 Marina Road"
                            />
                        </Field>
                    </div>
                    <Field label="City · optional" error={errors.city}>
                        <Input
                            id="city"
                            name="city"
                            autoComplete="address-level2"
                            placeholder="Lagos"
                        />
                    </Field>
                    <Field
                        label="Local Government Area (LGA) · optional"
                        error={errors.lga}
                    >
                        <Input id="lga" name="lga" placeholder="Lagos Island" />
                    </Field>
                    <Field label="State · optional" error={errors.state}>
                        <Input
                            id="state"
                            name="state"
                            autoComplete="address-level1"
                            placeholder="Lagos"
                        />
                    </Field>
                    <Field
                        label="Postal code · optional"
                        error={errors.postal_code}
                    >
                        <Input
                            id="postal_code"
                            name="postal_code"
                            autoComplete="postal-code"
                            placeholder="100001"
                        />
                    </Field>
                    <div className="sm:col-span-2">
                        <Field
                            label="Country · optional"
                            error={errors.country}
                        >
                            <Input
                                id="country"
                                name="country"
                                autoComplete="country-name"
                                placeholder="Nigeria"
                            />
                        </Field>
                    </div>
                </div>
            </section>

            <div className="flex items-center gap-3 border-t pt-5">
                {step > 0 && (
                    <Button
                        key="continue-registration"
                        type="button"
                        variant="outline"
                        onClick={() => setStep((current) => current - 1)}
                    >
                        <ArrowLeft /> Back
                    </Button>
                )}
                {step < steps.length - 1 ? (
                    <Button
                        type="button"
                        className="ml-auto"
                        onClick={continueJourney}
                    >
                        Continue <ArrowRight />
                    </Button>
                ) : (
                    <Button
                        key="submit-registration"
                        type="submit"
                        className="ml-auto"
                        data-test="register-user-button"
                    >
                        {processing && <Spinner />}
                        Create my workspace
                    </Button>
                )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <TextLink href={login()}>Log in</TextLink>
            </div>
        </>
    );
}

function StepHeading({ step }: { step: number }) {
    return (
        <div>
            <h2 className="text-lg font-semibold">{steps[step].title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                {steps[step].description}
            </p>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactElement<{ id: string }>;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={children.props.id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

Register.layout = {
    title: 'Create your NexaERP workspace',
    description:
        'Three short steps to get your business ready. You can update optional details later.',
};
