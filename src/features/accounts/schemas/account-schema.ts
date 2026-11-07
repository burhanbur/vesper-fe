import { z } from 'zod'

export const creditLimitSchema = z
    .string()
    .regex(
        /^(0|[1-9]\d{0,17})(\.\d{1,2})?$/,
        'Masukkan nominal positif, maksimal dua desimal.',
    )
    .refine((value) => /[1-9]/.test(value), 'Limit kredit harus positif.')
    .nullable()

// Older API responses omit card metadata. Preserve all existing account fields.
export const accountCardMetadataSchema = z
    .object({
        balance: z
            .string()
            .regex(
                /^-?\d{1,18}(\.\d{1,2})?$/,
                'Saldo harus berupa string desimal eksak.',
            ),
        version: z.string().min(1),
        is_credit_card: z.boolean().default(false),
        credit_limit: creditLimitSchema.default(null),
    })
    .passthrough()

export const accountFormSchema = z.object({
    name: z.string().trim().min(1, 'Nama akun wajib diisi.').max(120),
    account_type_id: z.string().min(1, 'Pilih tipe akun.'),
    parent_account_id: z.string(),
    icon: z.string(),
    description: z.string().max(5000),
    is_include_total: z.boolean(),
    is_credit_card: z.boolean(),
    credit_limit: z
        .string()
        .refine(
            (value) => value === '' || creditLimitSchema.safeParse(value).success,
            'Limit kredit harus positif dengan maksimal dua desimal.',
        ),
})
