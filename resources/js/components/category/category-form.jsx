import { Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fieldClass =
    'min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

export default function CategoryForm({ category = null }) {
    const isEditing = Boolean(category);
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
    });

    function submit(event) {
        event.preventDefault();

        if (isEditing) {
            put(`/categories/${category.id}`, {
                preserveScroll: true,
            });

            return;
        }

        post('/categories', {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="nexa-card space-y-6 p-5 md:p-7">
            <div className="grid gap-6">
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

                <div className="flex items-center gap-2">
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
                    {isEditing ? 'Save Category' : 'Create Category'}
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/categories">Cancel</Link>
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
