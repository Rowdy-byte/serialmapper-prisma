import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const actions: Actions = {

    async default({ request }) {
        const formData = await request.formData();
        const name = formData.get('name');


        const client = await db.client.create({
            data: {
                name: name as string
            }
        })

        return {
            status: 201,
            body: client
        }
    }
};

export const load: PageServerLoad = async () => {
    const clients = await db.client.findMany();
    return {
        clients
    }
};