import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fieldClass =
    'min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

export default function BusinessForm({ business }) {
    const address = business.address ?? {};
    const { data, setData, put, processing, errors } = useForm({
        name: business.name ?? '',
        tin: business.tin ?? '',
        email: business.email ?? '',
        phone: business.phone ?? '',
        business_description: business.business_description ?? '',
        street: address.street ?? '',
        city: address.city ?? '',
        lga: address.lga ?? '',
        state: address.state ?? '',
        postal_code: address.postal_code ?? '',
        country: address.country ?? 'Nigeria',
    });

    function submit(event) {
        event.preventDefault();
        put('/business', {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Field label="Business Name" error={errors.name}>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field
                    label="Tax Identification Number (TIN)"
                    error={errors.tin}
                >
                    <Input
                        id="tin"
                        value={data.tin}
                        onChange={(event) => setData('tin', event.target.value)}
                    />
                </Field>

                <Field label="Email" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field label="Phone" error={errors.phone}>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(event) =>
                            setData('phone', event.target.value)
                        }
                        required
                    />
                </Field>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="business_description">
                        Business Description
                    </Label>
                    <textarea
                        id="business_description"
                        className={fieldClass}
                        value={data.business_description}
                        onChange={(event) =>
                            setData('business_description', event.target.value)
                        }
                    />
                    <InputError message={errors.business_description} />
                </div>

                <Field label="Street" error={errors.street}>
                    <Input
                        id="street"
                        value={data.street}
                        onChange={(event) =>
                            setData('street', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field label="City" error={errors.city}>
                    <Input
                        id="city"
                        value={data.city}
                        onChange={(event) =>
                            setData('city', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field label="Local Government Area (LGA)" error={errors.lga}>
                    <Input
                        id="lga"
                        value={data.lga}
                        onChange={(event) => setData('lga', event.target.value)}
                    />
                </Field>

                <Field label="State" error={errors.state}>
                    <Input
                        id="state"
                        value={data.state}
                        onChange={(event) =>
                            setData('state', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field label="Postal Code" error={errors.postal_code}>
                    <Input
                        id="postal_code"
                        value={data.postal_code}
                        onChange={(event) =>
                            setData('postal_code', event.target.value)
                        }
                    />
                </Field>

                <Field label="Country" error={errors.country}>
                    <Input
                        id="country"
                        value={data.country}
                        onChange={(event) =>
                            setData('country', event.target.value)
                        }
                        required
                    />
                </Field>
            </div>

            <Button disabled={processing}>Save Business Profile</Button>
        </form>
    );
}

function Field({ label, error, children }) {
    const id = children.props.id;

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
