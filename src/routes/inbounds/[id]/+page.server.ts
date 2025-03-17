import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

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

        // if the inbound was not deleted, return an error
        if (inbound) {
            return {
                status: 500,
                success: false,
                message: 'Inbound was not deleted'
            }
        }

        // if the inbound was deleted, return a success message
        return {
            status: 200,
            success: true,
            message: 'Inbound was deleted'
        }
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

    },
    // Add many products to the inbound with inboundId
    // split input by space, newline, each number is a product
    async addBatchInboundProductToInbound({ params, request }: { params: { id: string }, request: Request }) {

        const inboundId = Number(params.id);
        const formData = await request.formData();
        const batch = (formData.get('batch') as string).split(/\s+/);
        const product = formData.get('product');

        const inboundProducts = await Promise.all(
            batch.map(async (serialnumber) => {
                return await db.inboundProduct.create(
                    {
                        data: {
                            product: product as string,
                            serialnumber: serialnumber, // Add the serialnumber here
                            inbound: {
                                connect: {
                                    id: inboundId
                                }
                            }
                        }
                    }
                );
            })
        );

        return {
            status: 200,
            success: true,
            inboundProducts
        }


    }

}