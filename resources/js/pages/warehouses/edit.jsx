import { Head } from '@inertiajs/react';
import WarehouseForm from '@/components/warehouse/warehouse-form';
export default function Edit({ warehouse }) {
    return (
        <>
            <Head title={`Edit ${warehouse.name}`} />
            <div className="mx-auto max-w-7xl p-4">
                <WarehouseForm warehouse={warehouse} />
            </div>
        </>
    );
}
