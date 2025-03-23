import type { PageServerLoad, Actions } from "./$types";
import db from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url }) => {
    const { pathname } = url;
    const segments = pathname.split('/');
    const basePath = `${segments[2]}`;

    const inboundProducts = await db.inboundProduct.findMany()

    const inbound = await db.inbound.findUnique({
        where: { id: Number(basePath) },
    })

    return {
        inboundProducts,
        inbound
    }
}

export const actions: Actions = {
    async deleteInboundProduct({ params, url }) {
        const { pathname } = url;
        const segments = pathname.split('/');
        const basePath = `/${segments[1]}/${segments[2]}`;

        console.log('basePath', basePath)

        await db.inboundProduct.delete({
            where: {
                id: Number(params.id)
            }
        })

        throw redirect(303, basePath);
    },

    async updateInboundProduct({ request, params }) {
        const formData = await request.formData();

        const product = formData.get('product') as string | null;
        const serialnumber = formData.get('serialnumber') as string | null;
        await db.inboundProduct.update({
            where: {
                id: Number(params.id)
            },
            data: {
                product: product ?? undefined,
                serialnumber: serialnumber ?? undefined,
            }
        })

        return {
            status: 200,
            success: true,
            message: 'Inbound Product updated successfully'
        }
    },
}