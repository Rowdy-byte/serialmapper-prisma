import type { PageServerLoad } from "./$types";
import db from "$lib/server/db";
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

        // await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = await request.formData();

        const inboundId = Number(params.id);
        const clientName = formData.get('clientName');
        const description = formData.get('description');


        const client = await db.client.findUnique({
            where: { name: clientName as string }
        });

        if (!client) {
            return {
                status: 400,
                success: false,
                message: 'Client does not exist'
            };
        }

        const formattedNumber = `IN-${String(params.id).padStart(6, '0')}`;

        await db.inbound.update({
            where: { id: inboundId },
            data: {
                description: description as string,
                clientName: client.name,
                inboundNumber: formattedNumber
            }
        });

        throw redirect(303, '/inbounds');


        return {
            status: 200,
            success: true,

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

        await new Promise((fulfil) => setTimeout(fulfil, 3000));

        const formData = await request.formData();
        const inboundId = Number(formData.get('inboundId'));
        const product = formData.get('product');
        const serialnumber = formData.get('serialnumber') as string;

        // 🔎 Step 1: Check if the serial number already exists
        const existingProduct = await db.inboundProduct.findFirst({
            where: { serialnumber: serialnumber },
        });

        // 🛑 Step 2: If a product with the same serialnumber exists, return an error
        if (existingProduct) {
            return {
                status: 400,
                success: false,
                message: 'Duplicate serial number. This product already exists in the database.'
            };
        }

        // ✅ Step 3: Proceed with creating the new inbound product
        const inboundProduct = await db.inboundProduct.create({
            data: {
                serialnumber,
                product: product as string,
                inbound: {
                    connect: {
                        id: inboundId
                    }
                }
            }
        });

        return {
            status: 200,
            success: true,
            inboundProduct
        };
    },


    async addBatchInboundProductToInbound({ params, request }: { params: { id: string }, request: Request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 3000));

        const inboundId = Number(params.id);
        const formData = await request.formData();
        const batch = (formData.get('batch') as string)
            .split(/\s+/) // Split by spaces/newlines
            .map(serialnumber => serialnumber.trim()) // Trim whitespace
            .filter(serialnumber => serialnumber.length > 0); // Remove empty values

        const product = formData.get('product') as string;

        // 🔎 Step 1: Get existing serial numbers from DB
        const existingSerialNumbers = new Set(
            (await db.inboundProduct.findMany({
                where: { serialnumber: { in: batch } },
                select: { serialnumber: true }
            })).map(({ serialnumber }) => serialnumber)
        );

        // 🛑 Step 2: Filter out duplicates
        const uniqueSerialNumbers = batch.filter(serialnumber => !existingSerialNumbers.has(serialnumber));

        if (uniqueSerialNumbers.length === 0) {
            return {
                status: 400,
                success: false,
                message: 'All serial numbers already exist.'
            };
        }

        // ✅ Step 3: Insert only unique serial numbers
        const inboundProducts = await db.inboundProduct.createMany({
            data: uniqueSerialNumbers.map(serialnumber => ({
                product,
                serialnumber,
                inboundId
            }))
        });

        return {
            status: 200,
            success: true,
            inboundProducts
        };
    }


}