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

const itemTypes = [
    { value: 'PRODUCT', label: 'Product' },
    { value: 'SERVICE', label: 'Service' },
];

export default function ProductForm({
    product = null,
    categories,
    units,
    taxCategories,
}) {
    const isEditing = Boolean(product);
    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name ?? '',
        category_id: product?.category_id ? String(product.category_id) : '',
        unit_id: product?.unit_id ? String(product.unit_id) : '',
        tax_category_id: product?.tax_category_id
            ? String(product.tax_category_id)
            : '',
        item_type: product?.item_type ?? 'PRODUCT',
        selling_price: product?.selling_price ?? '',
        cost_price: product?.cost_price ?? '',
        track_inventory: product?.track_inventory ?? false,
        reorder_level: product?.reorder_level ?? '',
        description: product?.description ?? '',
        is_active: product?.is_active ?? true,
    });

    function submit(event) {
        event.preventDefault();

        if (isEditing) {
            put(`/products/${product.id}`, {
                preserveScroll: true,
            });

            return;
        }

        post('/products', {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {isEditing && (
                    <Field label="SKU" error={null}>
                        <Input id="sku" value={product.sku} readOnly />
                    </Field>
                )}

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
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                        value={data.category_id}
                        onValueChange={(value) => setData('category_id', value)}
                    >
                        <SelectTrigger id="category_id" className="w-full">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.category_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="item_type">Item Type</Label>
                    <Select
                        value={data.item_type}
                        onValueChange={(value) => {
                            setData((current) => ({
                                ...current,
                                item_type: value,
                                track_inventory:
                                    value === 'SERVICE'
                                        ? false
                                        : current.track_inventory,
                                reorder_level:
                                    value === 'SERVICE'
                                        ? ''
                                        : current.reorder_level,
                            }));
                        }}
                    >
                        <SelectTrigger id="item_type" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {itemTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.item_type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="unit_id">Unit</Label>
                    <Select
                        value={data.unit_id}
                        onValueChange={(value) => setData('unit_id', value)}
                    >
                        <SelectTrigger id="unit_id" className="w-full">
                            <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((unit) => (
                                <SelectItem
                                    key={unit.id}
                                    value={String(unit.id)}
                                >
                                    {unit.code} - {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.unit_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="tax_category_id">Tax Category</Label>
                    <Select
                        value={data.tax_category_id}
                        onValueChange={(value) =>
                            setData('tax_category_id', value)
                        }
                    >
                        <SelectTrigger id="tax_category_id" className="w-full">
                            <SelectValue placeholder="Select tax category" />
                        </SelectTrigger>
                        <SelectContent>
                            {taxCategories.map((taxCategory) => (
                                <SelectItem
                                    key={taxCategory.id}
                                    value={String(taxCategory.id)}
                                >
                                    {taxCategory.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.tax_category_id} />
                </div>

                <Field label="Selling Price" error={errors.selling_price}>
                    <Input
                        id="selling_price"
                        type="number"
                        min="0"
                        step="0.0001"
                        value={data.selling_price}
                        onChange={(event) =>
                            setData('selling_price', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field label="Cost Price" error={errors.cost_price}>
                    <Input
                        id="cost_price"
                        type="number"
                        min="0"
                        step="0.0001"
                        value={data.cost_price}
                        onChange={(event) =>
                            setData('cost_price', event.target.value)
                        }
                    />
                </Field>

                <div className="rounded-lg border p-4 md:col-span-2">
                    <h2 className="font-medium">Inventory</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Stock quantities are managed through stock adjustments.
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="track_inventory"
                                checked={data.track_inventory}
                                disabled={data.item_type === 'SERVICE'}
                                onCheckedChange={(checked) =>
                                    setData('track_inventory', checked === true)
                                }
                            />
                            <Label htmlFor="track_inventory">
                                Track Inventory
                            </Label>
                            <InputError message={errors.track_inventory} />
                        </div>
                        <Field
                            label="Reorder Level"
                            error={errors.reorder_level}
                        >
                            <Input
                                id="reorder_level"
                                type="number"
                                min="0"
                                step="0.0001"
                                disabled={!data.track_inventory}
                                value={data.reorder_level}
                                onChange={(event) =>
                                    setData('reorder_level', event.target.value)
                                }
                            />
                        </Field>
                    </div>
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        className={fieldClass}
                        value={data.description}
                        onChange={(event) =>
                            setData('description', event.target.value)
                        }
                    />
                    <InputError message={errors.description} />
                </div>

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
                    {isEditing ? 'Save Product' : 'Create Product'}
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/products">Cancel</Link>
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
