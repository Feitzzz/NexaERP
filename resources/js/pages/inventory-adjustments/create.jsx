import { Head } from '@inertiajs/react';
import AdjustmentForm from '@/components/inventory/adjustment-form';
import Heading from '@/components/heading';
export default function Create(props) {
    return (
        <>
            <Head title="New Stock Adjustment" />
            <div className="nexa-page">
                <Heading
                    title="New Stock Adjustment"
                    description="Prepare a draft stock change."
                />
                <AdjustmentForm {...props} />
            </div>
        </>
    );
}
