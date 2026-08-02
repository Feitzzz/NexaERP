import { Link } from '@inertiajs/react';
import {
    Boxes,
    Building2,
    FileText,
    LayoutGrid,
    Tags,
    ReceiptText,
    Users,
    ChartNoAxesCombined,
    Warehouse,
    ClipboardPenLine,
    PackageSearch,
    Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const workspaceItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: FileText,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Boxes,
    },
    {
        title: 'Inventory',
        href: '/inventory',
        icon: PackageSearch,
    },
    {
        title: 'Sales',
        href: '/sales',
        icon: ChartNoAxesCombined,
    },
];

const configurationItems: NavItem[] = [
    {
        title: 'Taxes',
        href: '/taxes',
        icon: ReceiptText,
    },
    { title: 'Categories', href: '/categories', icon: Tags },
    { title: 'Warehouses', href: '/warehouses', icon: Warehouse },
    {
        title: 'Stock Adjustments',
        href: '/inventory-adjustments',
        icon: ClipboardPenLine,
    },
    { title: 'Business', href: '/business', icon: Building2 },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-sidebar-border/80"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={workspaceItems} />
                <NavMain items={configurationItems} label="Configuration" />
            </SidebarContent>

            <SidebarFooter>
                <div className="mx-2 mb-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 group-data-[collapsible=icon]:hidden dark:bg-emerald-950/40 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-amber-500" /> NRS
                    compliance in progress
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
