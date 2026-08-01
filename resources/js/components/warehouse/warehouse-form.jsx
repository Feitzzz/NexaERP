import { Link, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WarehouseForm({ warehouse = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        code: warehouse?.code ?? '',
        name: warehouse?.name ?? '',
        description: warehouse?.description ?? '',
        is_default: warehouse?.is_default ?? false,
        is_active: warehouse?.is_active ?? true,
    });

    function submit(event) {
        event.preventDefault();
        warehouse
            ? put(`/warehouses/${warehouse.id}`, { preserveScroll: true })
            : post('/warehouses', { preserveScroll: true });
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <Heading
                title={warehouse ? 'Edit Warehouse' : 'New Warehouse'}
                description="Define a stock location for this business."
            />
            <div className="nexa-card grid gap-5 p-5 md:grid-cols-2 md:p-7">
                <Field label="Code" error={errors.code}>
                    <Input
                        value={data.code}
                        onChange={(event) =>
                            setData('code', event.target.value)
                        }
                        required
                    />
                </Field>
                <Field label="Name" error={errors.name}>
                    <Input
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        required
                    />
                </Field>
                <div className="grid gap-2 md:col-span-2">
                    <Label>Description</Label>
                    <textarea
                        className="min-h-24 rounded-md border bg-transparent p-3 text-sm"
                        value={data.description}
                        onChange={(event) =>
                            setData('description', event.target.value)
                        }
                    />
                    <InputError message={errors.description} />
                </div>
                <Check
                    label="Default warehouse"
                    checked={data.is_default}
                    onChange={(value) => setData('is_default', value)}
                />
                <Check
                    label="Active"
                    checked={data.is_active}
                    onChange={(value) => setData('is_active', value)}
                />
            </div>
            <div className="flex gap-2">
                <Button disabled={processing}>Save Warehouse</Button>
                <Button variant="outline" asChild>
                    <Link href="/warehouses">Cancel</Link>
                </Button>
            </div>
        </form>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function Check({ label, checked, onChange }) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox
                checked={checked}
                onCheckedChange={(value) => onChange(value === true)}
            />
            <Label>{label}</Label>
        </div>
    );
}
