import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";

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

        await new Promise((fulfil) => setTimeout(fulfil, 3000));

        const formData = await request.formData();
        const clientName = formData.get('clientName');
        const description = formData.get('description');

        if (!clientName || !description) {
            error(404, 'Client name and description are required');
            return {
                error: true,
            }
        }

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
}