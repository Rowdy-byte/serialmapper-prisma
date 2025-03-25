import type { Actions, PageServerLoad } from './$types';
import db from '$lib/server/db';
import { createProductSchema } from '$lib/zod/zod-schemas';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const products = await db.product.findMany();
    return {
        products
    }
};

export const actions: Actions = {
    async createProduct({ request }: { request: Request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = Object.fromEntries(await request.formData());

        const safeParse = createProductSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }
        const { name, description, number, value } = safeParse.data;

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
                value: value
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