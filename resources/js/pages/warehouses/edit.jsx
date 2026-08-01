import { Head } from '@inertiajs/react';
import WarehouseForm from '@/components/warehouse/warehouse-form';
export default function Edit({ warehouse }) {
    return (
        <>
            <Head title={`Edit ${warehouse.name}`} />
            <div className="nexa-page max-w-5xl">
                <WarehouseForm warehouse={warehouse} />
            </div>
        </>
    );
}
