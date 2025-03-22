import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {

    const product = await db.product.findUnique(
        { where: { id: Number(params.id) } }
    );
    return {
        success: true,
        product
    }
};

export const actions = {
    async updateProduct({ params, request }) {
        const formData = await request.formData();

        const productId = Number(params.id);

        const name = formData.get('name');
        const description = formData.get('description');
        const number = formData.get('number');

        const product = await db.product.update({
            where: {
                id: productId
            },

            data: {
                name: name as string,
                number: number as string,
                description: description as string
            }
        });

        return {
            status: 200,
            success: true,
            message: 'Product updated successfully',
            product
        }
    },

    async deleteProduct({ params }) {
        const productId = Number(params.id);
        await db.product.delete({
            where: { id: productId }
        });

        await db.product.findUnique({
            where: {
                id: productId
            }
        });

        throw redirect(303, '/products');


    }
};