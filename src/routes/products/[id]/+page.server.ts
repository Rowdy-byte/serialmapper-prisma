import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { createProductSchema } from '$lib/zod/zod-schemas';

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

        const formData = Object.fromEntries(await request.formData());

        const safeParse = createProductSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }
        const productId = Number(params.id);


        const product = await db.product.update({
            where: {
                id: productId
            },

            data: {
                name: safeParse.data.name as string,
                number: safeParse.data.number as string,
                description: safeParse.data.description as string,
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