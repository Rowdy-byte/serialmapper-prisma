import type { PageServerLoad, Actions } from "./$types";
import db from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url }) => {
    const { pathname } = url;
    const segments = pathname.split('/');
    const basePath = `${segments[2]}`;

    const outboundProducts = await db.outboundProduct.findMany()

    const outbound = await db.outbound.findUnique({
        where: { id: Number(basePath) },
    })

    return {
        outboundProducts,
        outbound
    }
}

export const actions: Actions = {
    async deleteOutboundProduct({ params, url }: { params: { id: string }, url: URL }) {
        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const { pathname } = url;
        const segments = pathname.split('/');
        const basePath = `/${segments[1]}/${segments[2]}`;

        console.log('basePath', basePath);

        // Zoek het outboundProduct op om de serialnumber te krijgen
        const outboundProduct = await db.outboundProduct.findUnique({
            where: { id: Number(params.id) },
            select: { serialnumber: true }
        });

        if (outboundProduct?.serialnumber) {
            // Zoek het bijbehorende InboundProduct met dezelfde serialnumber
            const inboundProduct = await db.inboundProduct.findFirst({
                where: { serialnumber: outboundProduct.serialnumber }
            });

            if (inboundProduct) {
                // Update de status van het inboundProduct naar "IN"
                await db.inboundProduct.update({
                    where: { id: inboundProduct.id },
                    data: { status: 'IN' }
                });
            }
        }

        // Verwijder het outboundProduct
        await db.outboundProduct.delete({
            where: { id: Number(params.id) }
        });

        throw redirect(303, basePath);
    },

    async updateOutboundProduct({ request, params }: { request: Request, params: { id: string } }) {

        await new Promise((fulfil) => setTimeout(fulfil, 3000));

        const formData = await request.formData();

        const product = formData.get('product') as string | null;
        const serialnumber = formData.get('serialnumber') as string | null;
        await db.outboundProduct.update({
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