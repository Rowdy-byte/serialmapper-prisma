import { json } from '@sveltejs/kit';
import db from '$lib/server/db.js';

export async function GET({ url }) {
    const search = url.searchParams.get('q') || '';

    const inbounds = await db.inbound.findMany({
        where: {
            OR: [
                { description: { contains: search, mode: 'insensitive' } },
                { clientName: { contains: search, mode: 'insensitive' } },
                { inboundNumber: { contains: search, mode: 'insensitive' } }
            ]
        },
        include: {
            client: true, // als je client info ook wilt meegeven
            inboundProducts: true // optioneel
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return json(inbounds);
}
