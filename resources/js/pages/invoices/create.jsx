import { Head } from '@inertiajs/react';
import InvoiceForm from '@/components/invoice/invoice-form';
import Heading from '@/components/heading';

export default function Create({ customers, products, warehouses, today }) {
    return (
        <>
            <Head title="Create Invoice" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <Heading
                    title="Create Invoice"
                    description="Prepare a standard sales invoice."
                />

                <InvoiceForm
                    customers={customers}
                    products={products}
                    warehouses={warehouses}
                    today={today}
                />
            </div>
        </>
    );
}
