import type { PageServerLoad } from './$types';
import db from '$lib/server/db';

export const load: PageServerLoad = async () => {
    const inbounds = await db.inbound.findMany()
    const clients = await db.client.findMany()
    const products = await db.product.findMany()
    const inboundProducts = await db.inboundProduct.findMany()

    return {
        inbounds,
        clients,
        products,
        inboundProducts
    }
};