import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

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
                    <>
                        <div className="grid gap-6">
                            <section className="grid gap-4 rounded-lg border bg-muted/15 p-4 sm:p-5">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Account
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        These details let you sign in and
                                        identify your business.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Business name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nexa Trading Ltd"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </section>

                            <section className="grid gap-4 rounded-lg border bg-muted/15 p-4 sm:p-5">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Business profile
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Optional details can be completed later
                                        from your business profile.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tin">
                                            TIN{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="tin"
                                            type="text"
                                            tabIndex={5}
                                            name="tin"
                                            placeholder="Tax identification number"
                                        />
                                        <InputError message={errors.tin} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            Phone{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            tabIndex={6}
                                            autoComplete="tel"
                                            name="phone"
                                            placeholder="08012345678"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="business_description">
                                        Business description{' '}
                                        <span className="font-normal text-muted-foreground">
                                            optional
                                        </span>
                                    </Label>
                                    <textarea
                                        id="business_description"
                                        name="business_description"
                                        tabIndex={7}
                                        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="A short summary of what your business does"
                                    />
                                    <InputError
                                        message={errors.business_description}
                                    />
                                </div>
                            </section>

                            <section className="grid gap-4 rounded-lg border bg-muted/15 p-4 sm:p-5">
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Address
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Optional. If you add an address now,
                                        include street, city, state, and
                                        country.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="street">
                                            Street{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="street"
                                            type="text"
                                            tabIndex={8}
                                            name="street"
                                            placeholder="12 Marina Road"
                                        />
                                        <InputError message={errors.street} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="city">
                                            City{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            tabIndex={9}
                                            name="city"
                                            placeholder="Lagos"
                                        />
                                        <InputError message={errors.city} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="lga">
                                            LGA{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="lga"
                                            type="text"
                                            tabIndex={10}
                                            name="lga"
                                            placeholder="Lagos Island"
                                        />
                                        <InputError message={errors.lga} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="state">
                                            State{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            tabIndex={11}
                                            name="state"
                                            placeholder="Lagos"
                                        />
                                        <InputError message={errors.state} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="postal_code">
                                            Postal code{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            tabIndex={12}
                                            name="postal_code"
                                            placeholder="100001"
                                        />
                                        <InputError
                                            message={errors.postal_code}
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="country">
                                            Country{' '}
                                            <span className="font-normal text-muted-foreground">
                                                optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="country"
                                            type="text"
                                            tabIndex={13}
                                            name="country"
                                            placeholder="Nigeria"
                                        />
                                        <InputError message={errors.country} />
                                    </div>
                                </div>
                            </section>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={14}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={15}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create your NexaERP workspace',
    description: 'Set up your secure business account. You can refine the optional profile details at any time.',
};
