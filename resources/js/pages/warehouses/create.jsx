import { Head } from '@inertiajs/react';
import WarehouseForm from '@/components/warehouse/warehouse-form';
export default function Create() {
    return (
        <>
            <Head title="New Warehouse" />
            <div className="mx-auto max-w-7xl p-4">
                <WarehouseForm />
            </div>
        </>
    );
}
