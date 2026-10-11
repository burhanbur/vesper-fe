import { useNavigate } from '@tanstack/react-router'
import { Copy, Plus, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
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
import { Input } from '@/components/ui/input'
import {
  useCreateGroup,
  useGroupMembers,
  useGroups,
  useJoinGroup,
} from '@/features/groups'
import { formatDate } from '@/lib/formatters'

export function GroupsPage() {
  const navigate = useNavigate()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const { data: groups = [], isLoading } = useGroups()
  const createGroup = useCreateGroup()
  const joinGroup = useJoinGroup()

  const activeGroupId = selectedGroupId || (groups[0]?.id ?? null)
  const { data: members = [] } = useGroupMembers(activeGroupId || '')

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!newGroupName.trim()) return

    try {
      const res = await createGroup.mutateAsync({ name: newGroupName.trim() })
      setNewGroupName('')
      setCreateModalOpen(false)
      if (res.code) {
        toast.success(`Grup berhasil dibuat! Kode undangan: ${res.code}`)
      }
    } catch {
      toast.error('Gagal membuat grup baru.')
    }
  }

  async function handleJoinGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!joinCode.trim() || !activeGroupId) return

    try {
      await joinGroup.mutateAsync({
        groupId: activeGroupId,
        input: { code: joinCode.trim().toUpperCase() },
      })
      setJoinCode('')
      setJoinModalOpen(false)
      toast.success('Berhasil bergabung ke grup!')
    } catch {
      toast.error('Kode undangan tidak valid atau kedaluwarsa.')
    }
  }

  function copyCode(code?: string) {
    if (!code) return
    void navigator.clipboard.writeText(code)
    toast.info('Kode undangan disalin ke clipboard!')
  }

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              <Users className="size-7 text-indigo-400" />
              Keuangan Bersama & Grup Keluarga
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Bagikan visibilitas rekening dengan pasangan atau keluarga secara
              transparan dan aman.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={() => setCreateModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              Buat Grup Baru
            </Button>
            <Button
              variant="outline"
              onClick={() => setJoinModalOpen(true)}
              className="gap-1.5 border-slate-700"
            >
              <UserPlus className="size-4 text-indigo-400" />
              Gabung via Kode
            </Button>
          </div>
        </div>

        {/* Groups Grid / List */}
        {isLoading ? (
          <Card className="p-12 text-center text-sm text-slate-400">
            Memuat data grup keuangan…
          </Card>
        ) : groups.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="mx-auto mb-3 size-12 text-slate-600" />
            <h3 className="text-base font-bold text-white">
              Belum Ada Grup Keuangan
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              Buat grup baru untuk berbagi pengeluaran dengan pasangan atau
              rekan Anda.
            </p>
            <Button className="mt-4" onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-1.5 size-4" /> Buat Grup Pertama
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Group Selection Cards (1 col) */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Daftar Grup Anda
              </h2>
              {groups.map((grp) => {
                const isSelected = grp.id === activeGroupId
                return (
                  <Card
                    key={grp.id}
                    onClick={() => setSelectedGroupId(grp.id)}
                    className={`cursor-pointer p-4 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : 'hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">
                        {grp.name}
                      </h3>
                      <Badge
                        variant={grp.role === 'OWNER' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {grp.role}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Dibuat: {formatDate(grp.created_at)}</span>
                      {grp.code ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyCode(grp.code)
                          }}
                          className="flex items-center gap-1 font-mono text-indigo-400 hover:text-indigo-300"
                        >
                          <Copy className="size-3" />
                          {grp.code}
                        </button>
                      ) : null}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Active Group Details & Members (2 cols) */}
            <div className="space-y-4 lg:col-span-2">
              <Card className="space-y-6 p-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Anggota Grup
                    </h2>
                    <p className="text-xs text-slate-400">
                      Daftar anggota yang memiliki akses ke akun bersama di grup
                      ini.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {members.length} Anggota
                  </Badge>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {members.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Belum ada data anggota lain di grup ini.
                    </div>
                  ) : (
                    members.map((m) => (
                      <div
                        key={m.user_id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 place-items-center rounded-xl bg-slate-800 text-sm font-bold text-slate-200">
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-100">
                              {m.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Bergabung: {formatDate(m.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={m.role === 'OWNER' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {m.role}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <form onSubmit={(e) => void handleCreateGroup(e)}>
          <DialogHeader onClose={() => setCreateModalOpen(false)}>
            <DialogTitle>Buat Grup Keuangan Baru</DialogTitle>
            <DialogDescription>
              Grup memungkinkan Anda mengelola anggaran bersama dan berbagi akun
              finansial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="grp-name"
            >
              Nama Grup
            </label>
            <Input
              id="grp-name"
              placeholder="Contoh: Keluarga Mafazi, Pasutri Hemat"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createGroup.isPending}>
              {createGroup.isPending ? 'Membuat…' : 'Buat Grup'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <form onSubmit={(e) => void handleJoinGroup(e)}>
          <DialogHeader onClose={() => setJoinModalOpen(false)}>
            <DialogTitle>Gabung ke Grup via Kode</DialogTitle>
            <DialogDescription>
              Masukkan 12-karakter kode undangan yang diberikan oleh pemilik
              grup.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="join-code"
            >
              Kode Undangan (12 Karakter)
            </label>
            <Input
              id="join-code"
              placeholder="Contoh: ABC123XYZ789"
              maxLength={12}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setJoinModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={joinGroup.isPending}>
              {joinGroup.isPending ? 'Bergabung…' : 'Gabung Grup'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </AppShell>
  )
}
