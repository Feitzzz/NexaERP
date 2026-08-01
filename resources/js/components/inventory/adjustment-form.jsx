import { Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
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

const blankLine = () => ({
    product_id: '',
    quantity_delta: '',
    unit_cost: '',
    notes: '',
});
export default function AdjustmentForm({
    adjustment = null,
    warehouses,
    products,
    reasons,
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        warehouse_id: adjustment?.warehouse_id
            ? String(adjustment.warehouse_id)
            : String(warehouses.find((item) => item.is_default)?.id ?? ''),
        reason: adjustment?.reason ?? 'MANUAL_ADJUSTMENT',
        notes: adjustment?.notes ?? '',
        lines: adjustment?.lines?.map((line) => ({
            ...line,
            product_id: String(line.product_id),
        })) ?? [blankLine()],
    });
    const setLine = (index, key, value) =>
        setData(
            'lines',
            data.lines.map((line, position) =>
                position === index ? { ...line, [key]: value } : line,
            ),
        );
    function submit(event) {
        event.preventDefault();
        adjustment
            ? put(`/inventory-adjustments/${adjustment.id}`)
            : post('/inventory-adjustments');
    }
    return (
        <form onSubmit={submit} className="nexa-card space-y-6 p-5 md:p-7">
            <div className="grid gap-5 rounded-lg border p-5 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label>Warehouse</Label>
                    <Select
                        value={data.warehouse_id}
                        onValueChange={(value) =>
                            setData('warehouse_id', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses.map((item) => (
                                <SelectItem
                                    key={item.id}
                                    value={String(item.id)}
                                >
                                    {item.code} - {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.warehouse_id} />
                </div>
                <div className="grid gap-2">
                    <Label>Reason</Label>
                    <Select
                        value={data.reason}
                        onValueChange={(value) => setData('reason', value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {reasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                    {reason.replaceAll('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.reason} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label>Notes</Label>
                    <textarea
                        className="min-h-20 rounded-md border bg-transparent p-3 text-sm"
                        value={data.notes}
                        onChange={(event) =>
                            setData('notes', event.target.value)
                        }
                    />
                </div>
            </div>
            <div className="space-y-3">
                <div>
                    <h2 className="font-semibold">Adjustment lines</h2>
                    <p className="text-sm text-muted-foreground">
                        Use a positive quantity to increase stock and a negative
                        quantity to reduce it.
                    </p>
                </div>
                {data.lines.map((line, index) => (
                    <div
                        key={index}
                        className="grid gap-3 rounded-lg border p-4 lg:grid-cols-[2fr_1fr_1fr_2fr_auto]"
                    >
                        <div>
                            <Select
                                value={line.product_id}
                                onValueChange={(value) =>
                                    setLine(index, 'product_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem
                                            key={product.id}
                                            value={String(product.id)}
                                        >
                                            {product.sku} - {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors[`lines.${index}.product_id`]}
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                step="0.0001"
                                placeholder="Quantity delta"
                                value={line.quantity_delta}
                                onChange={(event) =>
                                    setLine(
                                        index,
                                        'quantity_delta',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={
                                    errors[`lines.${index}.quantity_delta`]
                                }
                            />
                        </div>
                        <Input
                            type="number"
                            min="0"
                            step="0.0001"
                            placeholder="Unit cost"
                            value={line.unit_cost ?? ''}
                            onChange={(event) =>
                                setLine(index, 'unit_cost', event.target.value)
                            }
                        />
                        <Input
                            placeholder="Line notes"
                            value={line.notes ?? ''}
                            onChange={(event) =>
                                setLine(index, 'notes', event.target.value)
                            }
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={data.lines.length === 1}
                            onClick={() =>
                                setData(
                                    'lines',
                                    data.lines.filter(
                                        (_, position) => position !== index,
                                    ),
                                )
                            }
                        >
                            <Trash2 />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setData('lines', [...data.lines, blankLine()])
                    }
                >
                    <Plus />
                    Add line
                </Button>
            </div>
            <InputError message={errors.adjustment} />
            <InputError message={errors.stock} />
            <div className="flex gap-2">
                <Button disabled={processing}>Save Draft</Button>
                <Button variant="outline" asChild>
                    <Link href="/inventory-adjustments">Cancel</Link>
                </Button>
            </div>
        </form>
    );
}
