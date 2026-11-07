import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { creditLimitSchema } from '../schemas/account-schema'
import { useUpdateAccount } from '../hooks/use-accounts'
import type { AccountDto } from '../types/account'
import { useAuth } from '@/features/auth'

const schema = z.object({
    limit: z
        .string()
        .refine(
            (value) => value === '' || creditLimitSchema.safeParse(value).success,
            'Limit harus positif dengan maksimal dua desimal.',
        ),
})

/** Metadata-only edit: never send subtype, mapping, hierarchy or balance. */
export function CreditLimitForm({ account }: { account: AccountDto }) {
    const mutation = useUpdateAccount()
    const { user } = useAuth()
    const submitting = useRef(false)
    const canEdit =
        account.is_credit_card &&
        !account.deleted_at &&
        !account.parent_account_id &&
        account.currency === 'IDR' &&
        account.user_id === user?.id
    const [message, setMessage] = useState('')
    const [needsReload, setNeedsReload] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { limit: account.credit_limit ?? '' },
    })
    return (
        <form
            className="space-y-2"
            onSubmit={(event) =>
                void handleSubmit(async ({ limit }) => {
                    if (!canEdit || needsReload || submitting.current) return
                    submitting.current = true
                    setMessage('')
                    try {
                        await mutation.mutateAsync({
                            id: account.id,
                            input: { version: account.version, credit_limit: limit || null },
                        })
                        setMessage('Limit berhasil diperbarui.')
                    } catch {
                        setNeedsReload(true)
                        setMessage(
                            'Gagal memperbarui limit. Muat ulang detail sebelum mencoba lagi.',
                        )
                    } finally {
                        submitting.current = false
                    }
                })(event)
            }
        >
            <label htmlFor="edit-card-limit" className="text-sm">
                Limit Kredit (opsional)
            </label>
            <Input id="edit-card-limit" inputMode="decimal" {...register('limit')} />
            {errors.limit && <p role="alert">{errors.limit.message}</p>}
            <p className="text-xs">
                Kosong = Limit Tidak Dipantau. Limit lebih rendah dari utang tetap boleh
                disimpan. Jenis akun tidak dapat diubah.
            </p>
            <Button
                type="submit"
                disabled={!canEdit || needsReload || isSubmitting || mutation.isPending}
            >
                Simpan Limit
            </Button>
            {message && (
                <p role="status" className="text-sm">
                    {message}
                </p>
            )}
        </form>
    )
}
