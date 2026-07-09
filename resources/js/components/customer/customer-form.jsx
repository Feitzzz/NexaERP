import { Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const fieldClass =
    'min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const customerTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' },
    { value: 'government', label: 'Government' },
];

export default function CustomerForm({ customer = null }) {
    const isEditing = Boolean(customer);
    const { data, setData, post, put, processing, errors } = useForm({
        name: customer?.name ?? '',
        customer_type: customer?.customer_type ?? 'individual',
        tin: customer?.tin ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        business_description: customer?.business_description ?? '',
        street: customer?.street ?? '',
        city: customer?.city ?? '',
        lga: customer?.lga ?? '',
        state: customer?.state ?? '',
        postal_code: customer?.postal_code ?? '',
        country: customer?.country ?? 'Nigeria',
        is_active: customer?.is_active ?? true,
    });

    function submit(event) {
        event.preventDefault();

        if (isEditing) {
            put(`/customers/${customer.id}`, {
                preserveScroll: true,
            });

            return;
        }

        post('/customers', {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Field label="Name" error={errors.name}>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        required
                    />
                </Field>

                <div className="grid gap-2">
                    <Label htmlFor="customer_type">Customer Type</Label>
                    <Select
                        value={data.customer_type}
                        onValueChange={(value) =>
                            setData('customer_type', value)
                        }
                    >
                        <SelectTrigger id="customer_type" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {customerTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.customer_type} />
                </div>

                <Field label="TIN" error={errors.tin}>
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

                <Field label="LGA" error={errors.lga}>
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

                <div className="flex items-center gap-2 md:col-span-2">
                    <Checkbox
                        id="is_active"
                        checked={data.is_active}
                        onCheckedChange={(checked) =>
                            setData('is_active', checked === true)
                        }
                    />
                    <Label htmlFor="is_active">Active</Label>
                    <InputError message={errors.is_active} />
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button disabled={processing}>
                    {isEditing ? 'Save Customer' : 'Create Customer'}
                </Button>
                <Button variant="outline" asChild>
                    <Link
                        href={
                            isEditing
                                ? `/customers/${customer.id}`
                                : '/customers'
                        }
                    >
                        Cancel
                    </Link>
                </Button>
            </div>
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
