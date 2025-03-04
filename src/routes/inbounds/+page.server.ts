import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async () => {
    const clients = await db.client.findMany();
    const inbounds = await db.inbound.findMany();

    return {
        clients,
        inbounds
    };
};

export const actions: Actions = {
    async createInbound({ request }) {
        const formData = await request.formData();
        const clientName = formData.get('clientName');
        const description = formData.get('description');




        await db.inbound.create({
            data: {
                description: description as string,
                clientName: clientName as string
            }
        });

        return {
            success: true
        };
    }
};