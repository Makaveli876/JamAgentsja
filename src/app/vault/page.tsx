"use client";

import { useState, useEffect } from 'react';
import { getDeviceId, cn } from '@/lib/utils';
import { getSeller, upsertSeller } from '@/app/actions/seller';
import { addVaultDoc, getVaultDocs, deleteVaultDoc } from '@/app/actions/vault';
import { Loader2, Plus, Trash2, Save, Bot, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function VaultPage() {
    const [deviceId, setDeviceId] = useState('');
    const [seller, setSeller] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [docs, setDocs] = useState<any[]>([]);

    // Onboarding State
    const [bizName, setBizName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    // Doc State
    const [newDoc, setNewDoc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const did = getDeviceId();
        setDeviceId(did);
        loadProfile(did);
    }, []);

    const loadProfile = async (did: string) => {
        setLoading(true);
        const s = await getSeller(did);
        setSeller(s);
        if (s) {
            const d = await getVaultDocs(did);
            setDocs(d);
        }
        setLoading(false);
    }

    const handleOnboard = async () => {
        setSubmitting(true);
        const id = await upsertSeller({
            deviceId,
            businessName: bizName,
            whatsapp: whatsapp
        });
        if (id) await loadProfile(deviceId);
        setSubmitting(false);
    }

    const handleAddDoc = async () => {
        if (!newDoc.trim()) return;
        setSubmitting(true);
        await addVaultDoc(deviceId, newDoc, 'Manual Entry');
        setNewDoc('');
        const d = await getVaultDocs(deviceId);
        setDocs(d);
        setSubmitting(false);
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this memory?')) return;
        await deleteVaultDoc(deviceId, id);
        const d = await getVaultDocs(deviceId);
        setDocs(d);
    }

    if (loading) return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-yard-cyan">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100 font-sans selection:bg-yard-cyan/30 pb-20">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center gap-4 bg-neutral-950/80 backdrop-blur sticky top-0 z-50">
                <Link href="/" className="p-2 -ml-2 text-neutral-400 hover:text-white transition">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yard-cyan to-yard-green">
                        Seller Vault
                    </h1>
                </div>
                <Bot className="w-6 h-6 text-yard-green" />
            </div>

            <div className="max-w-md mx-auto p-4 space-y-8">
                {/* Onboarding View */}
                {!seller ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                            <div className="w-12 h-12 bg-yard-cyan/20 rounded-full flex items-center justify-center mb-2">
                                <Bot className="w-6 h-6 text-yard-cyan" />
                            </div>
                            <h2 className="text-xl font-bold">Unleash Your Agent</h2>
                            <p className="text-neutral-400 text-sm">
                                Claim your device identity to enable AI Grounding. Your agent will answer customer questions using only the data you provide here.
                            </p>

                            <div className="space-y-3 pt-4">
                                <div>
                                    <label className="text-xs text-neutral-500 font-medium ml-1">Business Name</label>
                                    <input
                                        value={bizName}
                                        onChange={e => setBizName(e.target.value)}
                                        placeholder="e.g. JamRock Auto"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-yard-cyan transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 font-medium ml-1">WhatsApp Number</label>
                                    <input
                                        value={whatsapp}
                                        onChange={e => setWhatsapp(e.target.value)}
                                        placeholder="876-..."
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-yard-green transition"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleOnboard}
                                disabled={submitting || !bizName || !whatsapp}
                                className="w-full bg-yard-cyan/10 hover:bg-yard-cyan/20 text-yard-cyan font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Activate Agent
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Dashboard View */
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Profile Summary */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">{seller.business_name}</h3>
                                <p className="text-neutral-500 text-xs">{seller.whatsapp_e164}</p>
                            </div>
                            <div className="px-3 py-1 bg-yard-green/10 text-yard-green text-xs font-bold rounded-full border border-yard-green/20">
                                ACTIVE
                            </div>
                        </div>

                        {/* Knowledge Base */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest pl-1">Knowledge Base</h3>
                                <span className="text-xs text-neutral-600">{docs.length} items</span>
                            </div>

                            {/* Add New Input */}
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 focus-within:ring-1 focus-within:ring-yard-cyan transition">
                                <textarea
                                    value={newDoc}
                                    onChange={e => setNewDoc(e.target.value)}
                                    placeholder="Teach your agent something... (e.g. 'We are open Mon-Sat 9am-5pm' or 'We deliver to Montego Bay')"
                                    className="w-full bg-transparent border-none text-white placeholder-neutral-600 focus:outline-none resize-none min-h-[80px]"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddDoc}
                                        disabled={!newDoc.trim() || submitting}
                                        className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-neutral-200 transition disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Add Memory
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                {docs.map((doc) => (
                                    <div key={doc.id} className="group bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-start gap-3 hover:border-neutral-700 transition">
                                        <div className="flex-1">
                                            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{doc.content}</p>
                                            <p className="text-[10px] text-neutral-600 mt-2 font-mono">ID: {doc.id.slice(0, 8)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-neutral-600 hover:text-red-500 transition p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {docs.length === 0 && (
                                    <div className="text-center py-10 text-neutral-600 text-sm">
                                        No memories yet. Add something above!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
