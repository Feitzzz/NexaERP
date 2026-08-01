import { Head } from '@inertiajs/react';
import WarehouseForm from '@/components/warehouse/warehouse-form';
export default function Create() {
    return (
        <>
            <Head title="New Warehouse" />
            <div className="nexa-page max-w-5xl">
                <WarehouseForm />
            </div>
        </>
    );
}
