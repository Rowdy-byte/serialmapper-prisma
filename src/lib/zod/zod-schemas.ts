import { z } from 'zod'

export const createClientSchema = z.object({
    name: z.string()
        .min(2, { message: 'Client name must be at least 2 characters' })
        .max(15, { message: 'Client name must be at most 15 characters' })
        .regex(/^([A-Z][a-z]*)( [A-Z][a-z]*)*$/, { message: 'Client name must be in the format "First Last"' }),
    email: z.string()
        .min(2, { message: 'Email must be at least 2 characters' })
        .max(30, { message: 'Email must be at most 30 characters' })
        .email({ message: 'Email must be a valid email' }),
    phone: z.string()
        .min(5, { message: 'Phone number must be at least 5 characters' })
        .max(20, { message: 'Phone number must be at most 20 characters' })
        .regex(/^\+?\d{5,}$/, { message: 'Phone number must be a valid phone number' }),
    address: z.string()
        .min(2, { message: 'Address must be at least 2 characters' })
        .max(50, { message: 'Address must be at most 50 characters' })
        .regex(/^([A-Z][a-z]*)( [A-Z][a-z]*)*$/, { message: 'Address must be in the format "First Last"' }),
    city: z.string()
        .min(2, { message: 'City must be at least 2 characters' })
        .max(50, { message: 'City must be at most 50 characters' })
        .regex(/^([A-Z][a-z]*)( [A-Z][a-z]*)*$/, { message: 'City must be in the format "First Last"' }),
})

export const createProductSchema = z.object({
    name: z.string()
        .min(2, { message: 'Product name must be at least 2 characters' })
        .max(50, { message: 'Product name must be at most 50 characters' })
        .regex(/^([A-Z0-9][a-zA-Z0-9]*)( [A-Z0-9][a-zA-Z0-9]*)*$/
            , { message: 'Product name must be in the format "First Last"' }),
    description: z.string()
        .min(2, { message: 'Description must be at least 2 characters' })
        .max(50, { message: 'Description must be at most 200 characters' })
        .regex(/^([A-Z][a-z]*)( [A-Z][a-z]*)*$/, { message: 'Description must be in the format "First Last"' }),
    number: z.string()
        .min(5, { message: 'Number must be at least 5 characters' })
        .max(50, { message: 'Number must be at most 20 characters' })
        .regex(/^\d{4,} \([^()]+\)$/, { message: 'Number must be one number' }),
    value: z.string()
        .min(1, { message: 'Value must be at least 1 characters' })
        .max(7, { message: 'Value must be at most 50 characters' })
        .regex(/^\d{1,}$/, { message: 'Value must be one number' }),
})

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

export const CreateOutboundSchema = z.object({
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
    value: z.string()
        .min(1, { message: 'Value must be at least 1 characters' })
        .max(7, { message: 'Value must be at most 50 characters' })
        .regex(/^\d{1,}$/, { message: 'Value must be one number' }),
})

export const AddMultipleProductSchema = z.object({
    inboundId: z.string(),
    product: z.string()
        .min(2, { message: 'Product name must be at least 2 characters' })
        .max(50, { message: 'Product name must be at most 15 characters' }),
    batch: z.string()
        .min(5, { message: 'Serialnumber Batch must be at least 5 numbers' })
        .max(2000, { message: 'Serialnumbers Batch must be at most 2000 numbers' })
        .regex(/^\d{5,}( \d{5,})+$/, { message: 'Serialnumber must be at least 2 serialnumbers' }),
    value: z.string()
        .min(1, { message: 'Value must be at least 1 characters' })
        .max(7, { message: 'Value must be at most 50 characters' })
        .regex(/^\d{1,}$/, { message: 'Value must be one number' }),


})