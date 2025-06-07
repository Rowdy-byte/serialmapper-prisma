import type { Actions, PageServerLoad } from './$types';
import db from '$lib/server/db';
import { createClientSchema } from '$lib/zod/zod-schemas';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {

    const clients = await db.client.findMany();

    if (!clients) {
        throw error(404, { message: "Inbound doesn't exist", code: 'NOT_FOUND' });
    }

    return {
        clients
    }
};

export const actions: Actions = {

    async createClient({ request }: { request: Request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = Object.fromEntries(await request.formData());

        const safeParse = createClientSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { name, email, phone, address, city } = safeParse.data as { name: string; email: string; phone: string; address: string; city: string };

        const existingClient = await db.client.findUnique({
            where: { name }
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
                name,
                email,
                phone,
                address,
                city
            }
        });

        return {
            status: 201,
            success: true,
            message: 'Client created successfully',
            client: client
        };
    },
}