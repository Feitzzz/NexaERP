import { Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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

export default function InvoiceForm({
    invoice = null,
    customers,
    products,
    warehouses,
    today = null,
}) {
    const isEditing = Boolean(invoice);
    const productById = useMemo(
        () =>
            products.reduce((lookup, product) => {
                lookup[String(product.id)] = product;
                return lookup;
            }, {}),
        [products],
    );

    const { data, setData, post, put, processing, errors } = useForm({
        customer_id: invoice?.customer_id ? String(invoice.customer_id) : '',
        warehouse_id: invoice?.warehouse_id ? String(invoice.warehouse_id) : '',
        invoice_kind: invoice?.invoice_kind ?? 'B2C',
        issue_date: dateValue(invoice?.issue_date) || today || '',
        due_date: dateValue(invoice?.due_date) || today || '',
        tax_point_date: dateValue(invoice?.tax_point_date) || today || '',
        currency_code: invoice?.currency_code ?? 'NGN',
        tax_currency_code: invoice?.tax_currency_code ?? 'NGN',
        notes: invoice?.notes ?? '',
        items: invoice?.items?.length
            ? invoice.items.map((item) => ({
                  product_id: String(item.product_id),
                  quantity: item.quantity ?? '1',
                  unit_price: item.unit_price ?? '',
                  discount_rate: item.discount_rate ?? '0',
              }))
            : [emptyItem()],
    });

    const totals = data.items.reduce(
        (sum, item) => {
            const gross = amount(item.quantity) * amount(item.unit_price);
            const discount = (gross * amount(item.discount_rate)) / 100;
            const taxable = Math.max(gross - discount, 0);
            sum.subtotal += gross;
            sum.discount += discount;
            sum.taxable += taxable;
            return sum;
        },
        { subtotal: 0, discount: 0, taxable: 0 },
    );

    function submit(event) {
        event.preventDefault();

        if (isEditing) {
            put(`/invoices/${invoice.id}`, { preserveScroll: true });
            return;
        }

        post('/invoices', { preserveScroll: true });
    }

    function setItem(index, key, value) {
        const items = [...data.items];
        items[index] = { ...items[index], [key]: value };

        if (key === 'product_id') {
            items[index].unit_price = productById[value]?.selling_price ?? '';
            items[index].quantity = items[index].quantity || '1';
            items[index].discount_rate = items[index].discount_rate || '0';
        }

        setData('items', items);
    }

    function addItem() {
        setData('items', [...data.items, emptyItem()]);
    }

    function removeItem(index) {
        if (data.items.length === 1) {
            return;
        }

        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    return (
        <form onSubmit={submit} className="nexa-card space-y-7 p-5 md:p-7">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="font-semibold">Invoice information</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Customer, document dates, warehouse and currency.</p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="warehouse_id">Warehouse</Label>
                    <Select
                        value={data.warehouse_id || 'none'}
                        onValueChange={(value) =>
                            setData(
                                'warehouse_id',
                                value === 'none' ? '' : value,
                            )
                        }
                    >
                        <SelectTrigger id="warehouse_id" className="w-full">
                            <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No warehouse</SelectItem>
                            {warehouses.map((warehouse) => (
                                <SelectItem
                                    key={warehouse.id}
                                    value={String(warehouse.id)}
                                >
                                    {warehouse.code} - {warehouse.name}
                                    {warehouse.is_default ? ' (Default)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Required when the invoice includes inventory-tracked
                        products.
                    </p>
                    <InputError message={errors.warehouse_id} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="customer_id">Customer</Label>
                    <Select
                        value={data.customer_id}
                        onValueChange={(value) => setData('customer_id', value)}
                    >
                        <SelectTrigger id="customer_id" className="w-full">
                            <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((customer) => (
                                <SelectItem
                                    key={customer.id}
                                    value={String(customer.id)}
                                >
                                    {customer.name} ({customer.customer_code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.customer_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="invoice_kind">Invoice Kind</Label>
                    <Select
                        value={data.invoice_kind}
                        onValueChange={(value) =>
                            setData('invoice_kind', value)
                        }
                    >
                        <SelectTrigger id="invoice_kind" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="B2B">B2B</SelectItem>
                            <SelectItem value="B2C">B2C</SelectItem>
                            <SelectItem value="B2G">B2G</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.invoice_kind} />
                </div>

                <Field label="Issue Date" error={errors.issue_date}>
                    <Input
                        id="issue_date"
                        type="date"
                        value={data.issue_date}
                        onChange={(event) => {
                            setData({
                                ...data,
                                issue_date: event.target.value,
                                tax_point_date:
                                    data.tax_point_date || event.target.value,
                            });
                        }}
                        required
                    />
                </Field>

                <Field label="Due Date" error={errors.due_date}>
                    <Input
                        id="due_date"
                        type="date"
                        value={data.due_date}
                        onChange={(event) =>
                            setData('due_date', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field label="Tax Point Date" error={errors.tax_point_date}>
                    <Input
                        id="tax_point_date"
                        type="date"
                        value={data.tax_point_date}
                        onChange={(event) =>
                            setData('tax_point_date', event.target.value)
                        }
                        required
                    />
                </Field>

                <Field label="Currency" error={errors.currency_code}>
                    <Input
                        id="currency_code"
                        value={data.currency_code}
                        maxLength="3"
                        onChange={(event) =>
                            setData(
                                'currency_code',
                                event.target.value.toUpperCase(),
                            )
                        }
                        required
                    />
                </Field>

                <Field label="Tax Currency" error={errors.tax_currency_code}>
                    <Input
                        id="tax_currency_code"
                        value={data.tax_currency_code}
                        maxLength="3"
                        onChange={(event) =>
                            setData(
                                'tax_currency_code',
                                event.target.value.toUpperCase(),
                            )
                        }
                        required
                    />
                </Field>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                        id="notes"
                        className={fieldClass}
                        value={data.notes}
                        onChange={(event) =>
                            setData('notes', event.target.value)
                        }
                    />
                    <InputError message={errors.notes} />
                </div>
            </div>

            <div className="space-y-3 border-t pt-6">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold">Invoice Items</h2>
                    <Button type="button" variant="outline" onClick={addItem}>
                        <Plus />
                        Add Item
                    </Button>
                </div>
                <InputError message={errors.items} />

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <Th>Product / Service</Th>
                                    <Th>Quantity</Th>
                                    <Th>Unit Price</Th>
                                    <Th>Discount %</Th>
                                    <Th>Unit</Th>
                                    <Th>Tax</Th>
                                    <Th>Preview Total</Th>
                                    <Th>Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item, index) => {
                                    const product =
                                        productById[item.product_id];
                                    const gross =
                                        amount(item.quantity) *
                                        amount(item.unit_price);
                                    const discount =
                                        (gross * amount(item.discount_rate)) /
                                        100;
                                    const total = Math.max(gross - discount, 0);

                                    return (
                                        <tr
                                            key={index}
                                            className="border-b align-top last:border-b-0"
                                        >
                                            <Td>
                                                <Select
                                                    value={item.product_id}
                                                    onValueChange={(value) =>
                                                        setItem(
                                                            index,
                                                            'product_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-64">
                                                        <SelectValue placeholder="Select item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(
                                                            (product) => (
                                                                <SelectItem
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    value={String(
                                                                        product.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        product.name
                                                                    }{' '}
                                                                    (
                                                                    {
                                                                        product.sku
                                                                    }
                                                                    )
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        errors[
                                                            `items.${index}.product_id`
                                                        ]
                                                    }
                                                />
                                            </Td>
                                            <Td>
                                                <Input
                                                    className="w-28"
                                                    type="number"
                                                    min="0.0001"
                                                    step="0.0001"
                                                    value={item.quantity}
                                                    onChange={(event) =>
                                                        setItem(
                                                            index,
                                                            'quantity',
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `items.${index}.quantity`
                                                        ]
                                                    }
                                                />
                                            </Td>
                                            <Td>
                                                <Input
                                                    className="w-32"
                                                    type="number"
                                                    min="0"
                                                    step="0.0001"
                                                    value={item.unit_price}
                                                    onChange={(event) =>
                                                        setItem(
                                                            index,
                                                            'unit_price',
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `items.${index}.unit_price`
                                                        ]
                                                    }
                                                />
                                            </Td>
                                            <Td>
                                                <Input
                                                    className="w-28"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.0001"
                                                    value={item.discount_rate}
                                                    onChange={(event) =>
                                                        setItem(
                                                            index,
                                                            'discount_rate',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `items.${index}.discount_rate`
                                                        ]
                                                    }
                                                />
                                            </Td>
                                            <Td>
                                                {product
                                                    ? `${product.unit_code} - ${product.unit_name}`
                                                    : '-'}
                                            </Td>
                                            <Td>
                                                {product
                                                    ? `${product.tax_category_code} (${product.tax_treatment})`
                                                    : '-'}
                                            </Td>
                                            <Td>{formatMoney(total)}</Td>
                                            <Td>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    disabled={
                                                        data.items.length === 1
                                                    }
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-2 rounded-lg border p-4 text-sm sm:ml-auto sm:w-80">
                    <Total label="Subtotal" value={totals.subtotal} />
                    <Total label="Discount" value={totals.discount} />
                    <Total label="Tax Exclusive" value={totals.taxable} />
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button disabled={processing}>
                    {isEditing ? 'Save Invoice' : 'Create Invoice'}
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/invoices">Cancel</Link>
                </Button>
            </div>
        </form>
    );
}

function emptyItem() {
    return {
        product_id: '',
        quantity: '1',
        unit_price: '',
        discount_rate: '0',
    };
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

function Total({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{formatMoney(value)}</span>
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-4 py-3 font-medium whitespace-nowrap">{children}</th>
    );
}

function Td({ children }) {
    return <td className="px-4 py-3 whitespace-nowrap">{children}</td>;
}

function amount(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(value) {
    return value ? String(value).slice(0, 10) : '';
}

function formatMoney(value) {
    return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount(value));
}
