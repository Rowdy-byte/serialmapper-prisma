import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async () => {
    const clients = await db.client.findMany();
    const inbounds = await db.inbound.findMany();
    return {
        clients,
        inbounds
    }

};

export const actions: Actions = {

    async createInbound({ request }) {
        const formData = await request.formData();
        const client = formData.get('client');
        const description = formData.get('description');
        // const serialNumber = formData.get('serialNumber')?.toString().split(',');


        const inbound = await db.inbound.create({
            data: {
                client: {
                    connect: {
                        id: Number(client)
                    }
                },
                description: description as string,
                // Replace with appropriate value
                // serialNumber: {
                //     create: serialNumber?.map(sn => ({ serial: sn }))
                // }
            }
        })

        return {
            inbound,
            status: 200,
            success: true
        }
    }
};