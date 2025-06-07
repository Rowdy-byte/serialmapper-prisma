<script lang="ts">
    import type { PageProps } from './$types';
    import { 
        Eye, 
        Search, 
        Plus, 
        Package2, 
        TrendingDown, 
        Calendar, 
        Building2,
        Clock,
        CheckCircle,
        AlertCircle,
        ArrowUpRight
    } from '@lucide/svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import toast from 'svelte-french-toast';
    import { enhance } from '$app/forms';
    import { goto, invalidate, invalidateAll } from '$app/navigation';
    import BackToTop from '$lib/components/navigation/BackToTop.svelte';
    import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
    import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
    import { toastStyleErr } from '$lib/components/toast/toastStyle';
    import { toastStyleSucc } from '$lib/components/toast/toastStyle';
    import { applyAction } from '$app/forms';

    let { data, form }: PageProps = $props();

    let searchQuery = $state('');
    let loading = $state(false);
    let showCreateForm = $state(false);

    const clients = data.clients;
    const outbounds = data.outbounds;

    let filterdoutbounds = $state(outbounds);

    $effect(() => {
        filterdoutbounds = outbounds.filter((outbound) => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return (
                    (outbound.clientName && outbound.clientName.toLowerCase().includes(query)) ||
                    (outbound.description && outbound.description.toLowerCase().includes(query)) ||
                    outbound.outboundNumber.toString().toLowerCase().includes(query)
                );
            }
            return true;
        });
    });

    // Calculate stats
    const stats = {
        total: outbounds.length,
        pendingUpdate: outbounds.filter(o => o.outboundNumber === '').length,
        completed: outbounds.filter(o => o.outboundNumber !== '').length,
        uniqueClients: new Set(outbounds.map(o => o.clientName)).size
    };

    function handleCreateOutbound(event: Event) {
        if (!confirm('Are you sure you want to create this outbound?')) {
            event.preventDefault();
        }
    }

    function enhanceForm() {
        return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
            loading = true;
            try {
                if (result.type === 'failure') {
                    if (
                        result.data?.issues &&
                        Array.isArray(result.data.issues) &&
                        result.data.issues.length > 0
                    ) {
                        toast.error(
                            result.data.issues.map((issue: { message: string }) => issue.message).join(', '),
                            toastStyleErr
                        );
                    } else if (
                        result.data?.issues &&
                        typeof result.data.issues === 'object' &&
                        'message' in result.data.issues
                    ) {
                        toast.error(result.data.issues.message as string, toastStyleErr);
                    } else {
                        toast.error('An error occurred', toastStyleErr);
                    }
                } else if (result.type === 'success') {
                    toast.success('Outbound created successfully', toastStyleSucc);
                    showCreateForm = false;
                    await invalidateAll();
                } else {
                    await applyAction(result);
                }
            } finally {
                setTimeout(() => {
                    loading = false;
                }, 1500);
                await update();
            }
        };
    }

    // Handle form success/error messages
    $effect(() => {
        if (form?.success) {
            toast.success(form.message, toastStyleSucc);
        }
        if (form?.issues) {
            for (const issue of form.issues) {
                toast.error(issue.message, toastStyleErr);
            }
        }
    });
</script>

<BackToTop scrollTo="scroll to top" />

<!-- Loading Overlay -->
{#if loading}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="flex items-center gap-3 rounded-lg bg-gray-900 px-6 py-4 shadow-xl">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-orange-500"></div>
            <span class="text-gray-300">Processing...</span>
        </div>
    </div>
{/if}

<div class="container mx-auto max-w-7xl px-4 py-6">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="border-b border-gray-700 pb-6">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight text-white">Outbound Management</h1>
                    <p class="mt-1 text-sm text-gray-400">Track and manage outgoing inventory shipments</p>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                    <Package2 class="h-4 w-4" />
                    <span>{stats.total} Total Outbounds</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 backdrop-blur-sm">
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-400">Total Outbounds</span>
                <div class="rounded-lg bg-orange-500/20 p-2">
                    <TrendingDown class="h-4 w-4 text-orange-400" />
                </div>
            </div>
            <p class="mt-2 text-2xl font-bold text-white">{stats.total}</p>
        </div>

        <div class="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-sm">
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-400">Active Clients</span>
                <div class="rounded-lg bg-purple-500/20 p-2">
                    <Building2 class="h-4 w-4 text-purple-400" />
                </div>
            </div>
            <p class="mt-2 text-2xl font-bold text-white">{stats.uniqueClients}</p>
        </div>

        <div class="rounded-xl border border-green-500/20 bg-green-500/10 p-4 backdrop-blur-sm">
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-400">Completed</span>
                <div class="rounded-lg bg-green-500/20 p-2">
                    <CheckCircle class="h-4 w-4 text-green-400" />
                </div>
            </div>
            <p class="mt-2 text-2xl font-bold text-white">{stats.completed}</p>
        </div>

        <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm">
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-400">Pending Update</span>
                <div class="rounded-lg bg-red-500/20 p-2">
                    <AlertCircle class="h-4 w-4 text-red-400" />
                </div>
            </div>
            <p class="mt-2 text-2xl font-bold text-white">{stats.pendingUpdate}</p>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-12">
        <!-- Create Outbound Form - Sidebar -->
        <aside class="lg:col-span-4 xl:col-span-3">
            <div class="sticky top-6 rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm p-6 shadow-lg">
                <div class="mb-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="rounded-lg bg-orange-500/10 p-2">
                            <Plus class="h-5 w-5 text-orange-400" />
                        </div>
                        <h2 class="text-lg font-semibold text-white">Create Outbound</h2>
                    </div>
                    <button
                        onclick={() => showCreateForm = !showCreateForm}
                        class="rounded-lg bg-gray-800/50 p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
                    >
                        {#if showCreateForm}
                            <Plus class="h-4 w-4 rotate-45" />
                        {:else}
                            <Plus class="h-4 w-4" />
                        {/if}
                    </button>
                </div>

                <div class="lg:block {showCreateForm ? 'block' : 'hidden'}">
                    <form
                        class="space-y-4"
                        action="?/createOutbound"
                        method="post"
                        use:enhance={enhanceForm}
                    >
                        <div>
                            <label for="clientName" class="block text-sm font-medium text-gray-300 mb-2">
                                Client *
                            </label>
                            <select
                                id="clientName"
                                disabled={form?.success || loading}
                                class="select select-neutral w-full bg-gray-800/50 border-gray-600 text-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                name="clientName"
                                required
                            >
                                <option value="">-- Select Client --</option>
                                {#each clients as client}
                                    <option value={client.name}>{client.name}</option>
                                {/each}
                            </select>
                        </div>

                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                                Description *
                            </label>
                            <input
                                id="description"
                                disabled={form?.success || loading}
                                type="text"
                                name="description"
                                placeholder="Outbound description"
                                class="input input-neutral w-full bg-gray-800/50 border-gray-600 text-gray-300 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <PrimaryBtn 
                            disabled={form?.success || loading} 
                            type="submit"
                            onclick={handleCreateOutbound}
                            class="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                        >
                            {#if loading}
                                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                Creating...
                            {:else}
                                <Plus class="h-4 w-4" />
                                Create Outbound
                            {/if}
                        </PrimaryBtn>
                    </form>
                </div>
            </div>
        </aside>

        <!-- Outbounds List - Main Content -->
        <main class="lg:col-span-8 xl:col-span-9">
            <div class="rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm shadow-lg">
                <!-- Search Header -->
                <div class="border-b border-gray-700/50 p-6">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h3 class="text-lg font-semibold text-white">Outbound Directory</h3>
                        
                        <!-- Search Form -->
                        <div class="relative max-w-md w-full sm:w-auto">
                            <input
                                bind:value={searchQuery}
                                type="text"
                                name="search"
                                placeholder="Search outbounds..."
                                class="input input-neutral w-full bg-gray-800/50 border-gray-600 text-gray-300 placeholder-gray-500 rounded-full pl-10 pr-4 focus:border-orange-500 focus:ring-orange-500"
                            />
                            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                <!-- Desktop Table View -->
                <div class="hidden lg:block overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-700/50 bg-gray-800/30">
                                <th class="px-6 py-4 text-left font-medium text-gray-300">Outbound Number</th>
                                <th class="px-6 py-4 text-left font-medium text-gray-300">Client</th>
                                <th class="px-6 py-4 text-left font-medium text-gray-300">Description</th>
                                <th class="px-6 py-4 text-left font-medium text-gray-300">Created</th>
                                <th class="px-6 py-4 text-left font-medium text-gray-300">Status</th>
                                <th class="px-6 py-4 text-left font-medium text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each filterdoutbounds as outbound, index (outbound.id)}
                                <tr 
                                    class="border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-800/50"
                                    in:fade={{ delay: index * 50 }}
                                >
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            {#if outbound.outboundNumber === ''}
                                                <span class="text-xs text-red-400 italic">Update Required</span>
                                            {:else}
                                                <span class="font-mono text-gray-300">{outbound.outboundNumber}</span>
                                            {/if}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="flex-shrink-0">
                                                <div class="rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-2">
                                                    <span class="text-sm font-bold text-white">
                                                        {outbound.clientName?.charAt(0).toUpperCase() || 'C'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span class="font-medium text-gray-300">{outbound.clientName}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-400">
                                        <span class="max-w-xs truncate">{outbound.description}</span>
                                    </td>
                                    <td class="px-6 py-4 text-gray-400">
                                        <div class="flex items-center gap-2">
                                            <Calendar class="h-3 w-3 text-gray-500" />
                                            <span class="text-sm">{new Date(outbound.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium {outbound.outboundNumber === '' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}">
                                            {#if outbound.outboundNumber === ''}
                                                <Clock class="h-3 w-3" />
                                                Pending
                                            {:else}
                                                <CheckCircle class="h-3 w-3" />
                                                Complete
                                            {/if}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <a
                                            href="/outbounds/{outbound.id}"
                                            class="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-orange-700"
                                            title="View Outbound Details"
                                        >
                                            <Eye class="h-4 w-4" />
                                            View
                                        </a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Card View -->
                <div class="block lg:hidden space-y-4 p-6">
                    {#each filterdoutbounds as outbound, index (outbound.id)}
                        <div 
                            class="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
                            in:fly={{ y: 20, delay: index * 100 }}
                        >
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0">
                                        <div class="rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-2">
                                            <span class="text-sm font-bold text-white">
                                                {outbound.clientName?.charAt(0).toUpperCase() || 'C'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-300">{outbound.clientName}</div>
                                        <div class="text-xs text-gray-500">
                                            {#if outbound.outboundNumber === ''}
                                                <span class="text-red-400 italic">Update Required</span>
                                            {:else}
                                                <span class="font-mono">{outbound.outboundNumber}</span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                                <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {outbound.outboundNumber === '' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}">
                                    {#if outbound.outboundNumber === ''}
                                        <Clock class="h-3 w-3" />
                                        Pending
                                    {:else}
                                        <CheckCircle class="h-3 w-3" />
                                        Complete
                                    {/if}
                                </span>
                            </div>
                            
                            <div class="space-y-2 text-sm mb-4">
                                <div class="text-gray-400">{outbound.description}</div>
                                <div class="flex items-center gap-2 text-gray-500">
                                    <Calendar class="h-3 w-3" />
                                    <span>{new Date(outbound.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <a
                                href="/outbounds/{outbound.id}"
                                class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700"
                            >
                                <Eye class="h-4 w-4" />
                                View Details
                                <ArrowUpRight class="h-3 w-3" />
                            </a>
                        </div>
                    {/each}
                </div>

                <!-- Empty State -->
                {#if filterdoutbounds.length === 0}
                    <div class="p-12 text-center">
                        <TrendingDown class="mx-auto h-12 w-12 text-gray-500 mb-4" />
                        <h3 class="text-lg font-medium text-gray-300 mb-2">No outbounds found</h3>
                        <p class="text-sm text-gray-500 mb-6">
                            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first outbound'}
                        </p>
                        {#if !searchQuery}
                            <button 
                                onclick={() => { showCreateForm = true; document.getElementById('clientName')?.focus(); }}
                                class="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700"
                            >
                                <Plus class="h-4 w-4" />
                                Create First Outbound
                            </button>
                        {/if}
                    </div>
                {/if}
            </div>
        </main>
    </div>
</div>

<style>
    /* Custom focus styles */
    :global(.input:focus, .select:focus) {
        outline: none;
        border-color: #ea580c;
        box-shadow: 0 0 0 1px #ea580c;
    }

    /* Smooth transitions */
    :global(.transition-colors) {
        transition-property: color, background-color, border-color;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
    }
</style>
