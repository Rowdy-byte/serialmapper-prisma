import type { PageServerLoad } from "./$types";
import { fail, error } from "@sveltejs/kit";
import db from "$lib/server/db";
import { CreateOutboundSchema } from "$lib/zod/zod-schemas";

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
        const outboundNumber = formData.get("outboundNumber") as string; // Using outboundNumber for lookup

        try {
            const outboundProduct = await db.$transaction(async (tx) => {
                // Find the outbound record by its unique outboundNumber
                const outboundRecord = await tx.outbound.findUnique({
                    where: { outboundNumber }
                });
                if (!outboundRecord) {
                    throw new Error(`Outbound with number ${outboundNumber} not found.`);
                }

                // Find the inbound product by its serial number
                const inboundProduct = await tx.inboundProduct.findFirst({
                    where: { serialnumber: serial }
                });
                if (!inboundProduct) {
                    throw new Error(`Inbound product with serial ${serial} not found.`);
                }
                if (inboundProduct.status !== "IN") {
                    throw new Error(`Inbound product with serial ${serial} is already assigned.`);
                }

                // Create a new outbound product, ensuring that only the allowed fields are passed
                const newOutboundProduct = await tx.outboundProduct.create({
                    data: {
                        product: inboundProduct.product,
                        serialnumber: inboundProduct.serialnumber,
                        value: inboundProduct.value ?? "", // Supply a default if value is null
                        outbound: { connect: { id: outboundRecord.id } },
                        originInbound: { connect: { id: inboundProduct.inboundId } }
                    }
                });

                // Update the inbound product's status to "OUT"
                await tx.inboundProduct.update({
                    where: { id: inboundProduct.id },
                    data: { status: "OUT" }
                });

                return newOutboundProduct;
            });

            return { success: true, outboundProduct };
        } catch (error: Error | unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error in moveInboundProductToOutbound:", error);
            return { success: false, error: errorMessage };
        }
    }
};
