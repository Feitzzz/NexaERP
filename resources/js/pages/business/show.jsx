import { Head, Link } from '@inertiajs/react';
import { Building2, Mail, MapPin, Pencil, Phone, ReceiptText } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

export default function Show({ business }) {
    const address = business.address;
    const fullAddress = [address?.street, address?.city, address?.lga, address?.state, address?.postal_code, address?.country].filter(Boolean).join(', ');

    return (
        <>
            <Head title="Business Profile" />
            <div className="nexa-page">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading title="Business" description="Company identity, registration and invoice defaults." />
                    <Button asChild><Link href="/business/edit"><Pencil />Edit business</Link></Button>
                </div>

                <section className="nexa-card">
                    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-semibold text-primary-foreground">{business.name?.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0 flex-1"><h2 className="truncate text-xl font-semibold tracking-tight">{business.name}</h2><p className="mt-1 text-sm text-muted-foreground">NexaERP business account</p></div>
                        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"><span className="size-1.5 rounded-full bg-amber-500" />NRS compliance in development</div>
                    </div>
                </section>

                <div className="grid items-start gap-5 lg:grid-cols-2">
                    <section className="nexa-card">
                        <SectionHeader icon={Building2} title="Business details" copy="Legal and contact information" />
                        <dl className="divide-y px-5"><Row label="Registered name" value={business.name} /><Row label="Tax identification number" value={business.tin} icon={ReceiptText} /><Row label="Email" value={business.email} icon={Mail} /><Row label="Phone" value={business.phone} icon={Phone} /><Row label="Description" value={business.business_description} /></dl>
                    </section>
                    <section className="nexa-card">
                        <SectionHeader icon={MapPin} title="Registered address" copy="Primary business location" />
                        <dl className="divide-y px-5"><Row label="Address" value={fullAddress} icon={MapPin} /><Row label="City" value={address?.city} /><Row label="Local government" value={address?.lga} /><Row label="State" value={address?.state} /><Row label="Country" value={address?.country} /></dl>
                    </section>
                </div>

                <section className="nexa-card">
                    <SectionHeader icon={ReceiptText} title="Invoice configuration" copy="Defaults used across documents and reports" />
                    <dl className="px-5"><Row label="Default currency" value={business.currency || 'NGN'} /></dl>
                </section>
            </div>
        </>
    );
}

function SectionHeader({ icon: Icon, title, copy }) { return <div className="nexa-card-header"><div className="flex gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-muted/60"><Icon className="size-4 text-muted-foreground" /></span><div><h2 className="font-semibold">{title}</h2><p className="mt-0.5 text-sm text-muted-foreground">{copy}</p></div></div></div>; }
function Row({ label, value, icon: Icon }) { return <div className="grid gap-1 py-3.5 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="flex items-start gap-2 text-sm font-medium">{Icon && <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />}{value || 'Not provided'}</dd></div>; }
Show.layout = { breadcrumbs: [{ title: 'Business', href: '/business' }] };
