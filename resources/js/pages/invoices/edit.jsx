import { Head } from '@inertiajs/react';
import InvoiceForm from '@/components/invoice/invoice-form';
import Heading from '@/components/heading';

export default function Edit({ invoice, customers, products, warehouses }) {
    return (
        <>
            <Head title={`Edit ${invoice.invoice_number}`} />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <Heading
                    title={`Edit ${invoice.invoice_number}`}
                    description="Update draft invoice details and items."
                />

                <InvoiceForm
                    invoice={invoice}
                    customers={customers}
                    products={products}
                    warehouses={warehouses}
                />
            </div>
        </>
    );
}
