import type { PageServerLoad, Actions } from "./$types";
import db from "$lib/server/db";
import { fail } from "@sveltejs/kit";
import { CreateInboundSchema } from "$lib/zod/zod-schemas";

export const load: PageServerLoad = async () => {
    const clients = await db.client.findMany();
    const outbounds = await db.outbound.findMany();

    return {
        clients,
        outbounds
    };
};

export const actions: Actions = {
    async createOutbound({ request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = Object.fromEntries(await request.formData());

        const safeParse = CreateInboundSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { description, clientName } = safeParse.data;

        await db.outbound.create({
            data: {
                description: description as string,
                clientName: clientName as string,
                outboundNumber: '',
            }
        });

        return {
            success: true,
            message: 'Outbound created successfully',

        };
    }
}