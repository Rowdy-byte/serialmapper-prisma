import type { PageServerLoad } from "./$types";
import { fail, error } from "@sveltejs/kit";
import db from "$lib/server/db";
import { CreateOutboundSchema } from "$lib/zod/zod-schemas";
import { AddSingleProductSchema, AddMultipleProductSchema } from "$lib/zod/zod-schemas";

export const load: PageServerLoad = async ({ params }) => {
    const client = await db.outbound.findUnique({
        where: { id: Number(params.id) }
    });

    const outbound = await db.outbound.findUnique({
        where: { id: Number(params.id) }
    });

    if (!outbound) {
        throw error(404, { message: "outbound doesn't exist", code: "NOT_FOUND" });
    }

    if (!client) {
        return {
            status: 404,
            error: new Error("outbound not found")
        };
    }

    const products = await db.product.findMany();
    const outboundProducts = await db.outboundProduct.findMany();
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
            return {
                status: 400,
                success: false,
                message: "Client does not exist"
            };
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
            message: "outbound updated successfully"
        };
    },

    async addOutboundProductToOutbound({ request }: { params: { id: string }, request: Request }) {
        await new Promise((fulfil) => setTimeout(fulfil, 2000));
        const formData = Object.fromEntries(await request.formData());

        const safeParse = AddSingleProductSchema.safeParse({
            ...formData,
            outboundId: formData.outboundId
        });

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        // Hier wordt een veld uit safeParse overschreven; zorg dat je de juiste velden gebruikt.
        const { product, serialnumber, outboundId } = {
            ...safeParse.data,
            outboundId: safeParse.data.inboundId
        } as { product: string; serialnumber: string; outboundId: string };

        const existingProduct = await db.outboundProduct.findFirst({
            where: { serialnumber: serialnumber as string }
        });

        if (existingProduct) {
            return {
                status: 400,
                duplicateSuccess: false,
                message: "Duplicate serialnumber detected."
            };
        }

        const outboundProduct = await db.outboundProduct.create({
            data: {
                serialnumber,
                product: product as string,
                outbound: {
                    connect: {
                        id: Number(outboundId)
                    }
                },
                originInbound: {
                    connect: {
                        id: Number(formData.originInboundId) // Zorg dat dit veld aanwezig is in het formulier
                    }
                }
            }
        });

        return {
            status: 200,
            addProductTooutboundSuccess: true,
            message: "Product added to outbound successfully.",
            outboundProduct
        };
    },

    async addBatchoutboundProductTooutbound({ params, request }: { params: { id: string }, request: Request }) {
        await new Promise((fulfil) => setTimeout(fulfil, 2000));
        const outboundId = Number(params.id);
        const formData = await request.formData();

        const batch = (formData.get("batch") as string)
            .split(/[\s\n]+/)
            .map((serialnumber) => serialnumber.trim())
            .filter((serialnumber) => serialnumber.length > 0);

        const safeParse = AddMultipleProductSchema.safeParse({
            ...Object.fromEntries(formData),
            outboundId: formData.get("outboundId")
        });

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const existingSerialNumbers = new Set(
            (await db.outboundProduct.findMany({
                where: { serialnumber: { in: batch } },
                select: { serialnumber: true }
            })).map(({ serialnumber }) => serialnumber)
        );

        const uniqueSerialNumbers = batch.filter((serialnumber) => !existingSerialNumbers.has(serialnumber));

        if (uniqueSerialNumbers.length === 0) {
            return {
                status: 400,
                addBatchTooutboundSuccess: false,
                message: "Duplicate serialnumbers detected."
            };
        }

        const outboundProducts = await db.outboundProduct.createMany({
            data: uniqueSerialNumbers.map((serialnumber) => ({
                product: safeParse.data.product as string,
                serialnumber,
                outboundId: outboundId,
                originInboundId: Number(formData.get("originInboundId")) // Zorg dat dit veld aanwezig is
            }))
        });

        return {
            status: 200,
            addBatchTooutboundSuccess: true,
            message: "Batch added to outbound successfully.",
            outboundProducts
        };
    },

    async deleteoutbound({ params }: { params: { id: string } }) {
        const outboundId = Number(params.id);
        await db.outbound.delete({
            where: { id: outboundId }
        });

        // Controleer of de outbound is verwijderd
        const outbound = await db.outbound.findUnique({
            where: { id: outboundId }
        });

        if (outbound) {
            return {
                status: 500,
                outboundDeleteSuccess: false,
                message: "outbound delete not successfully."
            };
        }

        return {
            status: 200,
            outboundDeletesuccess: true,
            message: "outbound deleted successfully!"
        };
    },

    async moveInboundProductToOutbound({ request }: { request: Request }) {
        const formData = await request.formData();
        const serial = formData.get("serial") as string;
        const outboundNumber = formData.get("outboundNumber") as string;

        try {
            const outboundRecord = await db.$transaction(async (tx) => {
                // Zoek het inbound product op basis van het serienummer
                const inboundProduct = await tx.inboundProduct.findUnique({
                    where: { id: (await tx.inboundProduct.findFirst({ where: { serialnumber: serial } }))?.id || 0 }
                });
                if (!inboundProduct) {
                    throw new Error(`Inbound product met serial ${serial} niet gevonden.`);
                }

                // Maak een outbound record aan en koppel het outbound product
                const outboundRecord = await tx.outbound.create({
                    data: {
                        outboundNumber,
                        description: "Verzending naar klant X",
                        outboundProducts: {
                            create: {
                                product: inboundProduct.product,
                                serialnumber: inboundProduct.serialnumber,
                                originInboundId: inboundProduct.inboundId
                            }
                        }
                    }
                });

                // Verwijder het inbound product (of update de status, indien gewenst)
                await tx.inboundProduct.delete({
                    where: { id: inboundProduct.id }
                });

                return outboundRecord;
            });

            return { success: true, outbound: outboundRecord };
        } catch (error) {
            console.error("Fout opgetreden bij moveInboundProductToOutbound:", error);
            return { success: false, error: "Er is een fout opgetreden bij het verwerken van het formulier." };
        }
    }
};
