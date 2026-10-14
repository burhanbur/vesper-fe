import { useEffect, useId, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { AccountDto, AccountTypeDto } from '../types/account'

type AccountDetailDialogProps = {
    account: AccountDto
    accountType: AccountTypeDto | undefined
    parent: AccountDto | undefined
    onClose: () => void
}

function formatTimestamp(value: string) {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'UTC',
        }).format(date) + ' UTC'
}

function formatBalance(account: AccountDto) {
    const balance = Number(account.balance)
    if (!Number.isFinite(balance)) return `${account.balance} ${account.currency}`
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: account.currency,
        }).format(balance)
    } catch {
        return `${account.balance} ${account.currency}`
    }
}

export function AccountDetailDialog({
    account,
    accountType,
    parent,
    onClose,
}: AccountDetailDialogProps) {
    const contentRef = useRef<HTMLDivElement>(null)
    const titleId = useId()
    const descriptionId = useId()

    useEffect(() => {
        const trigger = document.activeElement
        const content = contentRef.current
        const dialog = content?.closest('[role="dialog"]')
        // The shared Dialog does not yet expose labelling or focus-management props.
        dialog?.setAttribute('aria-labelledby', titleId)
        dialog?.setAttribute('aria-describedby', descriptionId)
        content?.querySelector('button')?.focus()
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Tab') return
            const buttons = content?.querySelectorAll('button')
            const first = buttons?.[0]
            const last = buttons?.[buttons.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first?.focus()
            }
        }
        content?.addEventListener('keydown', handleKeyDown)
        return () => {
            content?.removeEventListener('keydown', handleKeyDown)
            if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus()
        }
    }, [titleId, descriptionId])

    const fields = [
        ['Nama akun', account.name],
        ['Tipe akun', accountType?.name ?? 'Tipe akun tidak tersedia'],
        [
            'Kategori tipe',
            accountType
                ? accountType.category === 'INVESTMENT'
                    ? 'Investasi'
                    : 'Kas'
                : 'Tidak tersedia',
        ],
        ['Mata uang', account.currency],
        ['Saldo akun', formatBalance(account)],
        [
            'Akun induk',
            account.parent_account_id
                ? (parent?.name ?? 'Akun induk tidak tersedia')
                : 'Tidak ada (akun utama)',
        ],
        ['Deskripsi', account.description || 'Tidak ada deskripsi'],
        ['Visibilitas', account.is_visible ? 'Ditampilkan' : 'Disembunyikan'],
        ['Dihitung dalam total', account.is_include_total ? 'Ya' : 'Tidak'],
        ['Dibuat', formatTimestamp(account.created_at)],
        ['Diperbarui', formatTimestamp(account.updated_at)],
    ]

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <div ref={contentRef}>
                <DialogHeader onClose={onClose}>
                    <DialogTitle id={titleId}>Detail Akun</DialogTitle>
                    <DialogDescription id={descriptionId} className="break-words">
                        {account.name}. Saldo akun adalah saldo tersimpan, bukan total
                        gabungan kantong.
                    </DialogDescription>
                </DialogHeader>
                <dl className="my-4 max-h-[55dvh] space-y-3 overflow-y-auto pr-2">
                    {fields.map(([label, value]) => (
                        <div key={label} className="grid gap-1 sm:grid-cols-2 sm:gap-4">
                            <dt className="text-sm text-slate-400">{label}</dt>
                            <dd className="text-sm break-words text-slate-100">{value}</dd>
                        </div>
                    ))}
                </dl>
                <DialogFooter>
                    <Button onClick={onClose}>Tutup</Button>
                </DialogFooter>
            </div>
        </Dialog>
    )
}
