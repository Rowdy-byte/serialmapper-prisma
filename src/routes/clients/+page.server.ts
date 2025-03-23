import type { Actions, PageServerLoad } from './$types';
import db from '$lib/server/db';

export const load: PageServerLoad = async () => {
    const clients = await db.client.findMany();
    return {
        clients
    }
};

export const actions: Actions = {

    async default({ request }: { request: Request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = await request.formData();
        const name = formData.get('name');

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

