import type { PageServerLoad } from "./$types";
import { fail, error } from "@sveltejs/kit";
import db from "$lib/server/db";
import { CreateOutboundSchema } from "$lib/zod/zod-schemas";
import { AddSingleProductSchema } from "$lib/zod/zod-schemas";

export const load: PageServerLoad = async ({ params }) => {
    // Haal het outbound record op en include de gekoppelde client
    const outbound = await db.outbound.findUnique({
        where: { id: Number(params.id) },
        include: { client: true }
    });

    if (!outbound) {
        throw error(404, { message: "Outbound doesn't exist", code: "NOT_FOUND" });
    }

    // Gebruik de client uit het outbound record
    const client = outbound.client;

    const products = await db.product.findMany();
    // Haal alleen de outboundProducts voor dit outbound record op
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
            message: "Outbound updated successfully"
        };
    },

    async addOutboundProductToOutbound({ request }: { params: { id: string }, request: Request }) {
        await new Promise((fulfil) => setTimeout(fulfil, 2000));
        const formData = Object.fromEntries(await request.formData());

        // Neem aan dat het schema product, serialnumber en outboundId levert
        const safeParse = AddSingleProductSchema.safeParse(formData);

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        const { product, serialnumber, inboundId } = safeParse.data as { product: string; serialnumber: string; inboundId: string };
        const outboundId = inboundId; // Map inboundId to outboundId

        const existingProduct = await db.outboundProduct.findFirst({
            where: { serialnumber }
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
                product,
                outbound: {
                    connect: { id: Number(outboundId) }
                },
                // Hier verwacht je dat het formulier een 'originInboundId' meestuurt die overeenkomt met Inbound.id
                originInbound: {
                    connect: { id: Number(formData.originInboundId) }
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

    async addInboundProductToOutbound({ request }: { request: Request }) {
        const formData = await request.formData();
        const serial = formData.get("serial") as string;
        const outboundId = Number(formData.get("outboundId")); // Zorg dat dit veld in je formulier staat

        try {
            const outboundProduct = await db.$transaction(async (tx) => {
                // Controleer of de Outbound bestaat
                const outboundExists = await tx.outbound.findUnique({
                    where: { id: outboundId }
                });
                if (!outboundExists) {
                    throw new Error(`Outbound met id ${outboundId} niet gevonden.`);
                }

                // Zoek het inbound product op basis van het serienummer
                const inboundProduct = await tx.inboundProduct.findFirst({
                    where: { serialnumber: serial }
                });
                if (!inboundProduct) {
                    throw new Error(`Inbound product met serial ${serial} niet gevonden.`);
                }
                // Controleer of het product nog niet is toegewezen
                if (inboundProduct.status !== "IN") {
                    throw new Error(`Inbound product met serial ${serial} is al toegewezen.`);
                }

                // Voeg het inbound product toe aan de bestaande outbound.
                // Let op: de 'originInbound' relatie verbindt met het Inbound record, dus we gebruiken inboundProduct.inboundId.
                const newOutboundProduct = await tx.outboundProduct.create({
                    data: {
                        product: inboundProduct.product,
                        serialnumber: inboundProduct.serialnumber,
                        outbound: {
                            connect: { id: outboundId }
                        },
                        originInbound: {
                            connect: { id: inboundProduct.inboundId }
                        }
                    }
                });

                // Update de status van het inbound product naar "OUT"
                await tx.inboundProduct.update({
                    where: { id: inboundProduct.id },
                    data: { status: "OUT" }
                });

                return newOutboundProduct;
            });

            return { success: true, outboundProduct };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return { success: false, error: error.message };
            }
            return { success: false, error: "An unknown error occurred" };
        }
    },

    // Alternatieve action (dezelfde als addInboundProductToOutbound) – overweeg om slechts één versie te gebruiken
    async moveInboundProductToOutbound({ request }: { request: Request }) {
        const formData = await request.formData();
        const serial = formData.get("serial") as string;
        const outboundNumber = formData.get("outboundNumber") as string; // Gebruik outboundNumber uit het formulier

        try {
            const outboundProduct = await db.$transaction(async (tx) => {
                // Zoek de Outbound op basis van het outboundNumber
                const outboundRecord = await tx.outbound.findUnique({
                    where: { outboundNumber }
                });
                if (!outboundRecord) {
                    throw new Error(`Outbound with number ${outboundNumber} not found.`);
                }

                // Zoek het inbound product op basis van het serienummer
                const inboundProduct = await tx.inboundProduct.findFirst({
                    where: { serialnumber: serial }
                });
                if (!inboundProduct) {
                    throw new Error(`Inbound product with serial ${serial} not found.`);
                }
                // Controleer of het product nog beschikbaar is (status "IN")
                if (inboundProduct.status !== "IN") {
                    throw new Error(`Inbound product with serial ${serial} is already assigned.`);
                }

                // Maak een nieuw OutboundProduct aan, waarbij de Outbound-relatie wordt gekoppeld via het gevonden record
                const newOutboundProduct = await tx.outboundProduct.create({
                    data: {
                        product: inboundProduct.product,
                        serialnumber: inboundProduct.serialnumber,
                        outbound: {
                            connect: { id: outboundRecord.id }
                        },
                        // Verbind de originInbound met het Inbound record via inboundProduct.inboundId
                        originInbound: {
                            connect: { id: inboundProduct.inboundId }
                        }
                    }
                });

                // Update de status van het inbound product naar "OUT"
                await tx.inboundProduct.update({
                    where: { id: inboundProduct.id },
                    data: { status: "OUT" }
                });

                return newOutboundProduct;
            });

            return { success: true, outboundProduct };
        } catch (error: any) {
            console.error("Error in moveInboundProductToOutbound:", error);
            return { success: false, error: error.message };
        }
    }

};
