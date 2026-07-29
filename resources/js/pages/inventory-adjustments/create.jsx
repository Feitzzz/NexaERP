import { Head } from '@inertiajs/react';
import AdjustmentForm from '@/components/inventory/adjustment-form';
import Heading from '@/components/heading';
export default function Create(props) {
    return (
        <>
            <Head title="New Stock Adjustment" />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <Heading
                    title="New Stock Adjustment"
                    description="Prepare a draft stock change."
                />
                <AdjustmentForm {...props} />
            </div>
        </>
    );
}
