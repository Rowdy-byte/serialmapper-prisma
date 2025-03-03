import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

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
        const productId = Number(params.id);
        const formData = await request.formData();
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
            product
        }
    },

    async deleteProduct({ params }) {
        const productId = Number(params.id);
        await db.product.delete({
            where: { id: productId }
        });

        // check if the product was deleted
        const product = await db.product.findUnique({
            where: {
                id: productId
            }
        });

        if (product) {
            return {
                status: 500,
                success: false,
                message: 'Failed to delete product'
            }
        }

        return {
            status: 200,
            success: true,
            message: 'Product deleted successfully'
        }
    }
};