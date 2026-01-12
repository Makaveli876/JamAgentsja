"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Listing {
    id: string;
    slug: string;
    title: string;
    price: string;
    location: string;
    created_at: string;
}

export function ListingTable({ listings }: { listings: Listing[] }) {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-white/5 text-xs uppercase font-bold tracking-wider text-white">
                        <tr>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">Price / Location</th>
                            <th className="px-6 py-4">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {listings.map((item) => (
                            <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-base">{item.title}</span>
                                        <span className="text-xs uppercase tracking-widest text-zinc-600 font-mono">
                                            #{item.slug.split('-').pop()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-yard-cyan font-bold">{item.price}</span>
                                        <span className="text-xs text-zinc-500">{item.location}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/item/${item.slug}`}
                                            target="_blank"
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors border border-white/5 hover:border-white/20 text-zinc-300"
                                        >
                                            View Page <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {listings.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
                                    No listings found. Create a flyer first.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
