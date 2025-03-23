import { z } from 'zod'

export const CreateInboundSchema = z.object({
    clientName: z.string()
        .min(2, { message: 'Client name must be at least 2 characters' })
        .max(15, { message: 'Client name must be at most 15 characters' })
        .regex(/^([A-Z][a-z]*)( [A-Z][a-z]*)*$/, { message: 'Client name must be in the format "First Last"' }),
    description: z.string()
        .min(2, { message: 'Description must be at least 2 characters' })
        .max(20, { message: 'Description must be at most 20 characters' })
        .regex(/^([A-Z][a-z]*)( [A-Z][a-z]*)*$/, { message: 'Description must be in the format "First Last"' })
})

export const AddSingleProductSchema = z.object({
    inboundId: z.string(),
    product: z.string()
        .min(2, { message: 'Product name must be at least 2 characters' })
        .max(50, { message: 'Product name must be at most 15 characters' }),
    serialnumber: z.string()
        .min(5, { message: 'Serial number must be at least 5 characters' })
        .max(200, { message: 'Serial number must be at most 200 characters' })
        .regex(/^\d{5,}$/, { message: 'Serial number must be one number' }),
})