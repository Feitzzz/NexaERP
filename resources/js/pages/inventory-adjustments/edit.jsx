import { Head } from '@inertiajs/react';
import AdjustmentForm from '@/components/inventory/adjustment-form';
import Heading from '@/components/heading';
export default function Edit(props) {
    return (
        <>
            <Head title={`Edit ${props.adjustment.adjustment_number}`} />
            <div className="nexa-page">
                <Heading
                    title={`Edit ${props.adjustment.adjustment_number}`}
                    description="Update this draft adjustment."
                />
                <AdjustmentForm {...props} />
            </div>
        </>
    );
}
