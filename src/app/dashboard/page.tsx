
import { supabase } from "@/lib/supabase";
import { ListingTable } from "@/components/Dashboard/ListingTable";
import { Shield, Zap, LayoutDashboard } from "lucide-react";
import Link from "next/link";

// Force dynamic because we want to see new listings instantly
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { data: listings, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Dashboard error:", error);
        return <div className="p-8 text-red-500">Error loading dashboard: {error.message}</div>;
    }

    // Calculate stats
    const total = listings?.length || 0;
    const totalVal = listings?.reduce((acc, curr) => acc + (parseInt(curr.price.replace(/,/g, '')) || 0), 0) || 0;

    return (
        <main className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-yard-purple/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-yard-cyan/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yard-cyan mb-1">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
                            JAM Concierge <span className="text-transparent bg-clip-text bg-gradient-to-r from-yard-purple to-yard-cyan">HQ</span>
                        </h1>
                        <p className="text-zinc-500 max-w-lg">
                            Manage active Yard Wire listings.
                        </p>
                    </div>

                    <Link href="/" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                        Open Studio
                    </Link>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard label="Total Listings" value={total.toString()} icon={<Zap className="w-5 h-5 text-zinc-500" />} />
                    <StatCard label="Pipeline Value (JMD)" value={`$${totalVal.toLocaleString()}`} />
                </div>

                {/* Main Table */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <div className="w-2 h-8 bg-yard-cyan rounded-full" />
                        Recent Traps
                    </h2>
                    <ListingTable listings={listings || []} />
                </div>

            </div>
        </main>
    );
}

function StatCard({ label, value, icon, active }: { label: string, value: string, icon?: React.ReactNode, active?: boolean }) {
    return (
        <div className={`p-6 rounded-2xl border flex flex-col gap-2 ${active
            ? 'bg-yard-green/10 border-yard-green/50 shadow-[0_0_30px_rgba(0,255,65,0.1)]'
            : 'bg-white/5 border-white/10'}`}>
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center justify-between">
                {label}
                {icon}
            </span>
            <span className={`text-4xl font-black tracking-tighter ${active ? 'text-yard-green' : 'text-white'}`}>
                {value}
            </span>
        </div>
    )
}
