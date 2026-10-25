import {
    Copy,
    Crown,
    LogOut,
    Share2,
    UserCheck,
    UserMinus,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/features/auth'
import { useGroupMembers, useManageGroupMembership } from '../hooks/use-groups'
import type { GroupMemberDto, GroupRole } from '../types/group'
import { formatDate } from '@/lib/formatters'

interface GroupMembersViewProps {
    readonly groupId: string
    readonly groupName: string
    readonly groupCode?: string | undefined
    readonly currentRole: GroupRole
    readonly onGroupLeft?: (() => void) | undefined
}

function copyInviteCode(code?: string) {
    if (!code) return
    void navigator.clipboard.writeText(code)
    toast.info('Kode undangan disalin ke clipboard!')
}

function getMembershipDialogTitle(
    target: { member: GroupMemberDto; action: 'REMOVE' | 'TRANSFER_OWNER' } | null,
    currentUserId?: string,
): string {
    if (!target) return ''
    if (target.action === 'TRANSFER_OWNER') {
        return 'Alihkan Kepemilikan Grup?'
    }
    if (target.member.user_id === currentUserId) {
        return 'Keluar dari Grup Keuangan?'
    }
    return 'Keluarkan Anggota dari Grup?'
}

export function GroupMembersView({
    groupId,
    groupName,
    groupCode,
    currentRole,
    onGroupLeft,
}: GroupMembersViewProps) {
    const { user } = useAuth()
    const currentUserId = user?.id

    const [targetMember, setTargetMember] = useState<{
        member: GroupMemberDto
        action: 'REMOVE' | 'TRANSFER_OWNER'
    } | null>(null)

    const { data: members = [], isLoading } = useGroupMembers(groupId)
    const manageMembership = useManageGroupMembership()

    const isOwner = currentRole === 'OWNER'

    function handleShareWhatsApp() {
        if (!groupCode) return
        const text = encodeURIComponent(
            `Hai! Mari bergabung ke grup keuangan bersama kami "${groupName}" di Vesper menggunakan kode undangan: ${groupCode}`,
        )
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
    }

    async function handleConfirmMembershipAction() {
        if (!targetMember) return

        try {
            await manageMembership.mutateAsync({
                groupId,
                input: {
                    user_id: targetMember.member.user_id,
                    action: targetMember.action,
                },
            })

            if (targetMember.action === 'TRANSFER_OWNER') {
                toast.success(
                    `Kepemilikan grup berhasil dialihkan ke ${targetMember.member.name}.`,
                )
            } else if (targetMember.member.user_id === currentUserId) {
                toast.success(`Anda telah keluar dari grup "${groupName}".`)
                onGroupLeft?.()
            } else {
                toast.success(
                    `Anggota ${targetMember.member.name} berhasil dikeluarkan dari grup.`,
                )
            }

            setTargetMember(null)
        } catch {
            toast.error('Gagal memperbarui keanggotaan grup.')
        }
    }

    return (
        <div className="space-y-6">
            {/* Invite Code Section Card */}
            {groupCode ? (
                <Card className="relative overflow-hidden border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 p-6 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-indigo-950/10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:text-indigo-400">
                                <Share2 className="size-3.5" /> Kode Undangan Grup
                            </span>
                            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Undang Pasangan atau Anggota Keluarga
                            </h3>
                            <p className="max-w-md text-xs text-slate-600 dark:text-slate-400">
                                Bagikan kode 12-karakter berikut kepada anggota keluarga Anda
                                agar mereka dapat bergabung melalui menu "Gabung via Kode".
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="rounded-xl border border-indigo-300 bg-white px-4 py-2 font-mono text-base font-extrabold tracking-wider text-indigo-700 shadow-xs dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-300">
                                {groupCode}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyInviteCode(groupCode)}
                                className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                            >
                                <Copy className="size-3.5" /> Salin Kode
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleShareWhatsApp}
                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                            >
                                <Share2 className="size-3.5" /> Bagikan ke WA
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : null}

            {/* Member Management List Card */}
            <Card className="p-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Daftar Anggota Grup
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Anggota yang memiliki hak akses kolaborasi pada grup{' '}
                            <strong>{groupName}</strong>.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {members.length} Anggota
                    </Badge>
                </div>

                {(() => {
                    if (isLoading) {
                        return (
                            <div className="py-8 text-center text-xs text-slate-500">
                                Memuat daftar anggota…
                            </div>
                        )
                    }
                    if (members.length === 0) {
                        return (
                            <div className="py-8 text-center text-xs text-slate-500">
                                Belum ada anggota lain di grup ini.
                            </div>
                        )
                    }
                    return (
                        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                            {members.map((m) => {
                                const isCurrentUser = m.user_id === currentUserId
                                const memberIsOwner = m.role === 'OWNER'

                                return (
                                    <div
                                        key={m.user_id}
                                        className="flex flex-col gap-3 py-4 first:pt-2 last:pb-2 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                    {m.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                {memberIsOwner ? (
                                                    <div className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-amber-500 text-white shadow-xs">
                                                        <Crown className="size-2.5" />
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {m.name}
                                                    </span>
                                                    {isCurrentUser ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] text-indigo-600 dark:text-indigo-400"
                                                        >
                                                            Anda
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    Bergabung sejak {formatDate(m.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={memberIsOwner ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {memberIsOwner ? 'Pemilik Grup' : 'Anggota'}
                                            </Badge>

                                            {/* Owner actions on other members */}
                                            {isOwner && !isCurrentUser ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setTargetMember({
                                                                member: m,
                                                                action: 'TRANSFER_OWNER',
                                                            })
                                                        }
                                                        className="h-8 gap-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                                                        title="Alihkan Kepemilikan"
                                                    >
                                                        <UserCheck className="size-3.5" />
                                                        <span className="hidden md:inline">Jadikan Pemilik</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setTargetMember({
                                                                member: m,
                                                                action: 'REMOVE',
                                                            })
                                                        }
                                                        className="h-8 gap-1 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                                        title="Keluarkan Anggota"
                                                    >
                                                        <UserMinus className="size-3.5" />
                                                        <span className="hidden md:inline">Keluarkan</span>
                                                    </Button>
                                                </div>
                                            ) : null}

                                            {/* Member self-leave action */}
                                            {!isOwner && isCurrentUser ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setTargetMember({
                                                            member: m,
                                                            action: 'REMOVE',
                                                        })
                                                    }
                                                    className="h-8 gap-1 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                                >
                                                    <LogOut className="size-3.5" />
                                                    Keluar dari Grup
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })()}
            </Card>

            {/* Confirmation Dialog for Membership Action */}
            <Dialog
                open={Boolean(targetMember)}
                onOpenChange={(open) => !open && setTargetMember(null)}
            >
                <DialogHeader onClose={() => setTargetMember(null)}>
                    <DialogTitle>
                        {getMembershipDialogTitle(targetMember, currentUserId)}
                    </DialogTitle>
                    <DialogDescription>
                        {(() => {
                            if (targetMember?.action === 'TRANSFER_OWNER') {
                                return (
                                    <span>
                                        Apakah Anda yakin ingin memindahkan status Pemilik grup kepada{' '}
                                        <strong>{targetMember.member.name}</strong>? Anda akan berubah
                                        menjadi anggota biasa.
                                    </span>
                                )
                            }
                            if (targetMember?.member.user_id === currentUserId) {
                                return (
                                    <span>
                                        Apakah Anda yakin ingin keluar dari grup{' '}
                                        <strong>{groupName}</strong>? Semua rekening dan mutasi yang
                                        Anda bagikan akan langsung dilepaskan dari grup ini.
                                    </span>
                                )
                            }
                            return (
                                <span>
                                    Apakah Anda yakin ingin mengeluarkan{' '}
                                    <strong>{targetMember?.member.name}</strong> dari grup? Rekening
                                    dan kategori yang dibagikan oleh mereka akan dicabut secara
                                    permanen.
                                </span>
                            )
                        })()}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTargetMember(null)}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant={
                            targetMember?.action === 'TRANSFER_OWNER'
                                ? 'default'
                                : 'destructive'
                        }
                        onClick={() => void handleConfirmMembershipAction()}
                        disabled={manageMembership.isPending}
                    >
                        {manageMembership.isPending ? 'Memproses…' : 'Konfirmasi'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
