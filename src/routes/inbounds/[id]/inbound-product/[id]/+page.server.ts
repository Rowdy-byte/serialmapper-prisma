import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async () => {
    const inboundProducts = await db.inboundProduct.findMany()

    return {
        inboundProducts
    }


}


export const actions: Actions = {
    async deleteInboundProduct({ params }) {
        await db.inboundProduct.delete({
            where: {
                id: Number(params.id)
            }
        })

        return {
            status: 200,
            success: true

        }
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
    }
}