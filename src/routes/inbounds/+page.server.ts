import type { PageServerLoad, Actions } from "./$types";
import db from "$lib/server/db";
import { fail } from "@sveltejs/kit";
import { CreateInboundSchema } from "$lib/zod/zod-schemas";

export const load: PageServerLoad = async () => {
    const clients = await db.client.findMany();
    const inbounds = await db.inbound.findMany();
    const clientNames = clients.map(client => client.name);

    return {
        clients,
        inbounds,
        clientNames,
    };
};

export const actions: Actions = {
    async createInbound({ request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = Object.fromEntries(await request.formData());

        const safeParse = CreateInboundSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { description, clientName, isSubscribed } = safeParse.data;

        await db.inbound.create({
            data: {
                description: description as string,
                clientName: clientName as string,
                inboundNumber: '',
                isSubscribed
            }
        });

        return {
            success: true,
            message: 'Inbound created successfully',
        };
    }
}