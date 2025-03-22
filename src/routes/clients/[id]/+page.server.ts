import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

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

// update client action

export const actions: Actions = {
    async updateClient({ params, request }) {
        const clientId = Number(params.id);
        const formData = await request.formData();
        const name = formData.get('name');

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

        // check if the client was deleted
        const client = await db.client.findUnique({
            where: {
                id: clientId
            }
        });

        if (client) {
            return {
                status: 500,
                success: false,
                message: 'Failed to delete client'
            }
        }

        throw redirect(301, '/clients');
    }
};




