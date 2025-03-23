import type { Actions, PageServerLoad } from './$types';
import db from '$lib/server/db';

export const load: PageServerLoad = async () => {
    const products = await db.product.findMany();
    return {
        products
    }
};

export const actions: Actions = {
    async createProduct({ request }: { request: Request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const number = formData.get('number');

        // check if product already exists
        const existingProduct = await db.product.findFirst({
            where: {
                name: name as string
            }
        });

        if (existingProduct) {
            return {
                status: 400,
                success: false,
                message: 'Product already exists'
            }
        }

        const products = await db.product.create({
            data: {
                name: name as string,
                number: number as string,
                description: description as string,
            }
        });
        return {
            products,
            status: 200,
            success: true,
            message: 'Product created successfully'

        }
    }
};