import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import { createClientSchema } from '$lib/zod/zod-schemas';

export const load: PageServerLoad = async ({ params }) => {
    const clientId = Number(params.id);
    const client = await db.client.findUnique({
        where: {
            id: clientId
        }
    });
    return {
        client
    }
};

export const actions: Actions = {
    async updateClient({ params, request }) {

        const formData = Object.fromEntries(await request.formData());

        const safeParse = createClientSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }
        const { name } = safeParse.data;

        const clientId = Number(params.id);

        const clientNameExists = await db.client.findUnique({
            where: {
                name: name as string
            }
        });

        if (clientNameExists) {
            return {
                status: 400,
                success: false,
                message: 'Client name already exists'
            }
        }

        const client = await db.client.update({
            where: {
                id: clientId
            },
            data: {
                name: name as string
            }
        });

        return {
            status: 200,
            success: true,
            message: 'Client updated successfully',
            client
        }
    },

    async deleteClient({ params }) {
        const clientId = Number(params.id);
        await db.client.delete({
            where: {
                id: clientId
            }
        });

        throw redirect(301, '/clients');
    }
};




