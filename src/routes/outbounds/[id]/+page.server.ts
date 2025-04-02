import type { PageServerLoad } from "./$types";
import { fail, error } from "@sveltejs/kit";
import db from "$lib/server/db";
import { CreateOutboundSchema } from "$lib/zod/zod-schemas";
import { customAlphabet } from 'nanoid';



// Barcode generator: 12 tekens, alleen cijfers en hoofdletters
const generateBarcode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

export const load: PageServerLoad = async ({ params }) => {
    const outbound = await db.outbound.findUnique({
        where: { id: Number(params.id) },
        include: { client: true }
    });

    if (!outbound) {
        throw error(404, { message: "Outbound doesn't exist", code: "NOT_FOUND" });
    }

    const client = outbound.client;
    const products = await db.product.findMany();
    const outboundProducts = await db.outboundProduct.findMany({
        where: { outboundId: Number(params.id) }
    });
    const clients = await db.client.findMany();

    return {
        client,
        clients,
        outbound,
        products,
        outboundProducts
    };
};

export const actions = {
    async updateOutbound({ params, request }: { params: { id: string }, request: Request }) {
        // Simulate delay for demo purposes
        await new Promise((fulfil) => setTimeout(fulfil, 2000));
        const formData = Object.fromEntries(await request.formData());
        const safeParse = CreateOutboundSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { description, clientName } = safeParse.data;
        const outboundId = Number(params.id);

        const client = await db.client.findUnique({
            where: { name: clientName as string }
        });
        if (!client) {
            return { status: 400, success: false, message: "Client does not exist" };
        }

        const formattedNumber = `LC-OUT-${String(params.id).padStart(6, "0")}`;

        await db.outbound.update({
            where: { id: outboundId },
            data: {
                description: description as string,
                clientName: client.name,
                outboundNumber: formattedNumber
            }
        });

        return {
            status: 200,
            outboundUpdateSuccess: true,
            message: "Outbound updated successfully"
        };
    },

    async deleteOutbound({ params }: { params: { id: string } }) {
        const outboundId = Number(params.id);
        const outbound = await db.outbound.findUnique({
            where: { id: outboundId }
        });
        if (!outbound) {
            return { status: 400, message: "Outbound does not exist" };
        }

        await db.$transaction(async (tx) => {
            await tx.outboundProduct.deleteMany({ where: { outboundId } });
            await tx.outbound.delete({ where: { id: outboundId } });
        });
        return { status: 200, message: "Outbound deleted successfully" };
    },

    async moveInboundProductToOutbound({ request }: { request: Request }) {
        const formData = await request.formData();
        const serial = formData.get("serial") as string;
        const outboundNumber = formData.get("outboundNumber") as string;

        const outboundProduct = await db.$transaction(async (tx) => {
            const outboundRecord = await tx.outbound.findUnique({
                where: { outboundNumber }
            });
            if (!outboundRecord) {
                throw new Error(`Outbound with number ${outboundNumber} not found.`);
            }

            const inboundProduct = await tx.inboundProduct.findFirst({
                where: { serialnumber: serial }
            });
            if (!inboundProduct) {
                throw new Error(`Inbound product with serial ${serial} not found.`);
            }
            if (inboundProduct.status !== "IN") {
                throw new Error(`Inbound product with serial ${serial} is already assigned.`);
            }

            const newOutboundProduct = await tx.outboundProduct.create({
                data: {
                    product: inboundProduct.product,
                    serialnumber: inboundProduct.serialnumber,
                    value: inboundProduct.value ?? "",
                    barcode: generateBarcode(), // ✅ nieuw
                    outbound: { connect: { id: outboundRecord.id } },
                    originInbound: { connect: { id: inboundProduct.inboundId } }
                }
            });

            await tx.inboundProduct.update({
                where: { id: inboundProduct.id },
                data: { status: "OUT" }
            });

            return newOutboundProduct;
        });

        return {
            movedSingleSuccess: true,
            message: "Product moved successfully!",
            outboundProduct
        };
    },

    async moveBatchToOutbound({ request }: { request: Request }) {
        const formData = await request.formData();
        const outboundNumber = formData.get("outboundNumber") as string;
        const batchRaw = formData.get("batch") as string;

        const batch = batchRaw
            .split(/[\s\n]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (batch.length === 0) {
            return fail(400, { message: "No serial numbers provided." });
        }

        try {
            const result = await db.$transaction(async (tx) => {
                const outboundRecord = await tx.outbound.findUnique({
                    where: { outboundNumber }
                });
                if (!outboundRecord) {
                    throw new Error(`Outbound with number ${outboundNumber} not found.`);
                }

                const inboundProducts = await tx.inboundProduct.findMany({
                    where: { serialnumber: { in: batch } }
                });

                const validInbound = inboundProducts.filter(p => p.status === "IN");
                const alreadyAssigned = inboundProducts.filter(p => p.status !== "IN");
                const notFoundSerials = batch.filter(
                    serial => !inboundProducts.find(p => p.serialnumber === serial)
                );

                if (validInbound.length === 0) {
                    return {
                        success: false,
                        message: "No valid products found to move.",
                        alreadyAssigned: alreadyAssigned.map(p => p.serialnumber),
                        notFoundSerials
                    };
                }

                await tx.outboundProduct.createMany({
                    data: validInbound.map(product => ({
                        product: product.product,
                        serialnumber: product.serialnumber,
                        value: product.value ?? "",
                        barcode: generateBarcode(), // ✅ nieuw
                        outboundId: outboundRecord.id,
                        originInboundId: product.inboundId
                    }))
                });

                await tx.inboundProduct.updateMany({
                    where: { id: { in: validInbound.map(p => p.id) } },
                    data: { status: "OUT" }
                });

                return {
                    movedBatchSuccess: true,
                    message: "Batch moved successfully.",
                    createdCount: validInbound.length,
                    skipped: alreadyAssigned.map(p => p.serialnumber),
                    notFound: notFoundSerials
                };
            });

            return { status: 200, ...result };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error.";
            console.error("moveBatchToOutbound error:", err);
            return fail(500, { success: false, message });
        }
    }
    ,

    async deleteOutboundProducts({ request }: { request: Request }) {
        const formData = await request.formData();
        const rawProductIds = formData.get('productIds');

        if (!rawProductIds) {
            return fail(400, { message: 'No products selected' });
        }

        const productIds = JSON.parse(rawProductIds as string);

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return fail(400, { message: 'Invalid product selection' });
        }

        await db.outboundProduct.deleteMany({
            where: { id: { in: productIds } }
        });

        return {
            success: true,
            deletedIds: productIds
        };

    },

};
