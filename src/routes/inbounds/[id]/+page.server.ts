import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import db from "$lib/server/db";
import { CreateInboundSchema } from "$lib/zod/zod-schemas";
import { AddSingleProductSchema } from "$lib/zod/zod-schemas";
import { error } from "@sveltejs/kit";
import { customAlphabet } from 'nanoid';

// Barcode generator: 12 tekens, alleen cijfers en hoofdletters
const generateBarcode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

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
    const inbounds = await db.inbound.findMany();
    const inboundProducts = await db.inboundProduct.findMany()
    const clients = await db.client.findMany();

    return {
        client,
        clients,
        inbound,
        products,
        inboundProducts,
        inbounds,
    }
}

export const actions = {
    async updateInbound({ params, request }: { params: { id: string }, request: Request }) {

        await new Promise((fulfil: (value: unknown) => void) => setTimeout(fulfil, 2000));

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
            success: true,
            message: 'Inbound updated successfully',

        }

    },

    async addInboundProductToInbound({ params, request }: { params: { id: string }, request: Request }) {

        await new Promise((fulfil: (value: unknown) => void) => setTimeout(fulfil, 2000));

        const formData = Object.fromEntries(await request.formData());

        const safeParse = AddSingleProductSchema.safeParse({
            ...formData,
            inboundId: params.id
        });

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { product, serialnumber, value } = safeParse.data as { product: string; serialnumber: string; value: string; inboundId: string };

        const existingProduct = await db.inboundProduct.findFirst({
            where: { serialnumber: serialnumber as string },
        });

        if (existingProduct) {
            return {
                status: 400,
                success: false,
                message: 'Duplicate serialnumber detected.'
            };
        }

        // Generate barcode
        const barcode = generateBarcode();

        const inboundProduct = await db.inboundProduct.create({
            data: {
                serialnumber,
                product: product as string,
                value: value,  // value is already a string from the form data
                barcode,  // Save the barcode
                inbound: {
                    connect: {
                        id: Number(params.id)
                    }
                }
            }
        });

        return {
            status: 200,
            success: true,
            message: 'Product added successfully.',
            inboundProduct
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
                success: false,
                message: 'Inbound delete not successfully.'
            }
        }

        return {
            status: 200,
            success: true,
            message: 'Inbound deleted successfully!'
        }
    }
}