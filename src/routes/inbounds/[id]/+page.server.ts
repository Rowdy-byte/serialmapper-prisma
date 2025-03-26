import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import db from "$lib/server/db";
import { CreateInboundSchema } from "$lib/zod/zod-schemas";
import { AddSingleProductSchema, AddMultipleProductSchema } from "$lib/zod/zod-schemas";
import { error } from "@sveltejs/kit";
export const load: PageServerLoad = async ({ params }) => {

    const client = await db.inbound.findUnique({
        where: { id: Number(params.id) }
    });

    const inbound = await db.inbound.findUnique(
        { where: { id: Number(params.id) } }
    );

    if (!inbound) {
        throw error(404, { message: "Inbound doesn't exist", code: 'NOT_FOUND' });
    }

    if (!client) {
        return {
            status: 404,
            error: new Error('Inbound not found')
        }
    }

    const products = await db.product.findMany();
    const inboundProducts = await db.inboundProduct.findMany()
    const clients = await db.client.findMany();

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

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = Object.fromEntries(await request.formData());

        const safeParse = CreateInboundSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { description, clientName, isSubscribed } = safeParse.data;

        const inboundId = Number(params.id);


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

        const formattedNumber = `LC-IN-${String(params.id).padStart(6, '0')}`;

        await db.inbound.update({
            where: { id: inboundId },
            data: {
                description: description as string,
                clientName: client.name,
                inboundNumber: formattedNumber,
                isSubscribed

            }
        });

        return {
            status: 200,
            inboundUpdateSuccess: true,
            message: 'Inbound updated successfully',

        }

    },

    async addInboundProductToInbound({ request }: { params: { id: string }, request: Request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const formData = Object.fromEntries(await request.formData());

        const safeParse = AddSingleProductSchema.safeParse({
            ...formData,
            inboundId: formData.inboundId
        });

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { product, serialnumber, inboundId, value } = safeParse.data as { product: string; serialnumber: string; value: string; inboundId: string };

        const existingProduct = await db.inboundProduct.findFirst({
            where: { serialnumber: serialnumber as string },
        });

        if (existingProduct) {
            return {
                status: 400,
                duplicateSuccess: false,
                message: 'Duplicate serialnumber detected.'
            };
        }

        const inboundProduct = await db.inboundProduct.create({
            data: {
                serialnumber,
                product: product as string,
                value: value,  // value is already a string from the form data
                inbound: {
                    connect: {
                        id: Number(inboundId)
                    }
                }
            }
        });

        return {
            status: 200,
            addProductToInboundSuccess: true,
            message: 'Product added to inbound successfully.',
            inboundProduct
        };
    },

    async addBatchInboundProductToInbound({ params, request }: { params: { id: string }, request: Request }) {

        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const inboundId = Number(params.id);

        const formData = await request.formData();

        const batch = (formData.get('batch') as string)
            .split(/[\s\n]+/)
            .map(serialnumber => serialnumber.trim())
            .filter(serialnumber => serialnumber.length > 0);

        const safeParse = AddMultipleProductSchema.safeParse({
            ...Object.fromEntries(formData),
            inboundId: formData.get('inboundId')
        });

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const existingSerialNumbers = new Set(
            (await db.inboundProduct.findMany({
                where: { serialnumber: { in: batch } },
                select: { serialnumber: true }
            })).map(({ serialnumber }) => serialnumber)
        );

        const uniqueSerialNumbers = batch.filter(serialnumber => !existingSerialNumbers.has(serialnumber));

        if (uniqueSerialNumbers.length === 0) {
            return {
                status: 400,
                addBatchToInboundSuccess: false,
                message: 'Duplicate serialnumbers detected.'
            };
        }

        const inboundProducts = await db.inboundProduct.createMany({
            data: uniqueSerialNumbers.map(serialnumber => ({
                product: safeParse.data.product as string,
                serialnumber,
                value: safeParse.data.value as string,
                inboundId: inboundId
            }))
        });

        return {
            status: 200,
            addBatchToInboundSuccess: true,
            message: 'Batch added to inbound successfully.',
            inboundProducts
        };
    },

    async deleteInbound({ params }: { params: { id: string } }) {
        const inboundId = Number(params.id);
        await db.inbound.delete({
            where: { id: inboundId }
        });

        // check if the inbound was deleted
        const inbound = await db.inbound.findUnique({
            where: { id: inboundId }
        });

        if (inbound) {
            return {
                status: 500,
                inboundDeleteSuccess: false,
                message: 'Inbound delete not successfully.'
            }
        }

        return {
            status: 200,
            inboundDeletesuccess: true,
            message: 'Inbound deleted successfully!'
        }
    }
}