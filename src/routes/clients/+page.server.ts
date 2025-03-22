import type { Actions, PageServerLoad } from './$types';
import db from '$lib/server/db';

export const actions: Actions = {

    async default({ request }) {
        const formData = await request.formData();
        const name = formData.get('name');

        // Check if the client already exists
        const existingClient = await db.client.findUnique({
            where: { name: name as string }
        });
        if (existingClient) {
            return {
                status: 400,
                success: false,
                message: 'Client already exists'
            };
        }

        const client = await db.client.create({
            data: {
                name: name as string
            }
        })

        return {
            status: 201,
            success: true,
            message: 'Client created successfully',
            client: client
        }
    }
};

export const load: PageServerLoad = async () => {
    const clients = await db.client.findMany();
    return {
        clients
    }
};