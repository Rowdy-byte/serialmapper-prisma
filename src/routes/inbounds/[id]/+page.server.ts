import type { PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import db from "$lib/server/db";
import { CreateInboundSchema } from "$lib/zod/zod-schemas";
import { AddSingleProductSchema, AddMultipleProductSchema } from "$lib/zod/zod-schemas";
import { error } from "@sveltejs/kit";

import { customAlphabet } from 'nanoid';

import * as XLSX from 'xlsx';

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

    async addBatchInboundProductToInbound({ params, request }: { params: { id: string }, request: Request }) {
        await new Promise((fulfil) => setTimeout(fulfil, 2000));

        const inboundId = Number(params.id);
        const formData = await request.formData();

        const batch = (formData.get('batch') as string)
            .split(/[\s\n]+/)
            .map(serialnumber => serialnumber.trim())
            .filter(serialnumber => serialnumber.length > 0);

        // Validate data using Zod schema
        const safeParse = AddMultipleProductSchema.safeParse({
            ...Object.fromEntries(formData),
            inboundId: formData.get('inboundId')
        });

        if (!safeParse.success) {
            return fail(400, { issues: safeParse.error.issues });
        }

        // Check for duplicate serial numbers in the database
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
                success: false,
                message: 'Duplicate serial numbers detected.'
            };
        }

        // **Generate barcodes for each inbound product**
        const inboundProducts = await db.inboundProduct.createMany({
            data: uniqueSerialNumbers.map(serialnumber => ({
                product: safeParse.data.product as string,
                serialnumber,
                value: safeParse.data.value as string,
                barcode: generateBarcode(), // ✅ Each product gets a unique barcode
                inboundId: inboundId
            }))
        });

        return {
            status: 200,
            success: true,
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
                success: false,
                message: 'Inbound delete not successfully.'
            }
        }

        throw redirect(302, '/inbounds');
    },

    async deleteInboundProducts({ request }: { request: Request }) {
        const formData = await request.formData();
        const rawProductIds = formData.get("productIds");

        if (!rawProductIds) {
            return fail(400, { message: "No products selected" });
        }

        // Parse the JSON string into an array
        const productIds = JSON.parse(rawProductIds as string);

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return fail(400, { message: "Invalid product selection" });
        }

        try {
            await db.inboundProduct.deleteMany({
                where: { id: { in: productIds } }
            });

            return {
                status: 200,
                success: true,
                message: "Selected inbound products deleted successfully."
            };
        } catch (error) {
            console.error("Error deleting inbound products:", error);
            return fail(500, { message: "Failed to delete selected inbound products" });
        }
    },

    uploadExcelInboundProducts: async ({ params, request }) => {
        const formData = await request.formData();
        const file = formData.get('excel') as File;

        if (!file) {
            return fail(400, { message: 'No Excel file provided' });
        }

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

        // Skip header row
        const [header, ...data] = rows;

        const requiredColumns = ['product', 'serialnumber', 'value'];
        const headerIndex: Record<string, number> = {};

        for (const column of requiredColumns) {
            const idx = header.findIndex(h => h.toLowerCase().includes(column));
            if (idx === -1) return fail(400, { message: `Missing column: ${column}` });
            headerIndex[column] = idx;
        }

        const seenSerials = new Set<string>();
        const validRows: {
            product: string;
            serialnumber: string;
            value: string;
            barcode: string;
            inboundId: number;
        }[] = [];

        for (const row of data) {
            const product = row[headerIndex['product']]?.trim();
            const serialnumber = row[headerIndex['serialnumber']]?.trim();
            const value = row[headerIndex['value']]?.trim();

            if (!product || !serialnumber || !value) continue;
            if (seenSerials.has(serialnumber)) continue;

            seenSerials.add(serialnumber);

            validRows.push({
                product,
                serialnumber,
                value,
                barcode: generateBarcode(),
                inboundId: Number(params.id)
            });
        }

        // Check welke serials al in de DB zitten
        const existingSerials = new Set(
            (await db.inboundProduct.findMany({
                where: {
                    serialnumber: {
                        in: Array.from(seenSerials)
                    }
                },
                select: { serialnumber: true }
            })).map(r => r.serialnumber)
        );

        const uniqueRows = validRows.filter(row => !existingSerials.has(row.serialnumber));

        if (uniqueRows.length === 0) {
            return fail(400, {
                message: 'No new products to import. All serials already exist.'
            });
        }

        await db.inboundProduct.createMany({
            data: uniqueRows
        });

        return {
            status: 200,
            success: true,
            message: `Imported ${uniqueRows.length} products. Skipped ${validRows.length - uniqueRows.length} duplicate(s).`,
            created: uniqueRows.map(r => r.serialnumber),
            duplicates: Array.from(existingSerials)
        };
    }



}