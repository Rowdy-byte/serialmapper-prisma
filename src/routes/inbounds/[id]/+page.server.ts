import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
    const clients = await db.client.findMany();

    const client = await db.inbound.findUnique({
        where: { id: Number(params.id) }
    });

    const inbound = await db.inbound.findUnique(
        { where: { id: Number(params.id) } }
    );

    const products = await db.product.findMany();
    const inboundProducts = await db.inboundProduct.findMany()

    return {
        client,
        clients,
        inbound,
        products,
        inboundProducts
    }
}

export const actions = {
    async updateInbound({ params, request }: { params: { id: string }, request: Request }) {
        const inboundId = Number(params.id);
        const formData = await request.formData();
        const clientName = formData.get('clientName');
        const description = formData.get('description');


        const inbound = await db.inbound.update({
            where: {
                id: inboundId
            },
            data: {

                description: description as string,
                clientName: clientName as string
            }
        });

        return {
            status: 200,
            success: true,
            inbound
        }
        throw redirect(301, '/inbounds');
    },

    async deleteInbound({ params }) {
        const inboundId = Number(params.id);
        await db.inbound.delete({
            where: { id: inboundId }
        });

        // check if the inbound was deleted
        const inbound = await db.inbound.findUnique({
            where: { id: inboundId }
        });

        if (!inbound) {
            return {
                status: 200,
                success: true
            }
        }
        throw redirect(301, '/inbounds');
    },

    // Add a product to the inbound with inboundId
    async addInboundProductToInbound({ request }: { params: { id: string }, request: Request }) {


        const formData = await request.formData();
        const inboundId = Number(formData.get('inboundId'));
        const product = formData.get('product');
        const serialnumber = formData.get('serialnumber');


        const inboundProduct = await db.inboundProduct.create(
            {
                data: {

                    serialnumber: serialnumber as string,
                    product: product as string,
                    inbound: {
                        connect: {
                            id: inboundId
                        }
                    }

                }
            }
        );

        return {
            status: 200,
            success: true,
            inboundProduct
        }

    }

}