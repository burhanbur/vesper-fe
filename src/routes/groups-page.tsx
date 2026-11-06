import { useNavigate } from '@tanstack/react-router'
import {
  Layers,
  Plus,
  ReceiptText,
  Share2,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  GroupAccountsView,
  GroupCategoriesView,
  GroupCollaborationView,
  GroupMembersView,
  GroupPocketsView,
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
  const [activeTab, setActiveTab] = useState('saldo')

  // Default period to current UTC year-month YYYY-MM
  const now = new Date()
  const initialPeriod = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const [period, setPeriod] = useState(initialPeriod)

  const { data: groups = [], isLoading } = useGroups()
  const createGroup = useCreateGroup()
  const joinGroup = useJoinGroup()

  // Resolved active group
  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) || groups[0] || null
  const activeGroupId = activeGroup?.id ?? null

  const { data: members = [] } = useGroupMembers(activeGroupId || '')

  async function handleCreateGroup(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newGroupName.trim()) return

    try {
      const res = await createGroup.mutateAsync({ name: newGroupName.trim() })
      setNewGroupName('')
      setCreateModalOpen(false)
      setSelectedGroupId(res.id)
      if (res.code) {
        toast.success(`Grup berhasil dibuat! Kode undangan: ${res.code}`)
      } else {
        toast.success('Grup berhasil dibuat!')
      }
    } catch {
      toast.error('Gagal membuat grup baru.')
    }
  }

  async function handleJoinGroup(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmedCode = joinCode.trim().toUpperCase()
    if (!trimmedCode) return

    try {
      const joined = await joinGroup.mutateAsync({
        code: trimmedCode,
      })
      setJoinCode('')
      setJoinModalOpen(false)
      if (joined?.id) {
        setSelectedGroupId(joined.id)
      }
      toast.success('Berhasil bergabung ke grup!')
    } catch {
      toast.error('Kode undangan tidak valid, kedaluwarsa, atau grup tidak ditemukan.')
    }
  }

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              <Users className="size-7 text-indigo-600 dark:text-indigo-400" />
              Keuangan Bersama & Grup Keluarga
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Kelola kas bersama, rekening terhubung, dan alokasi anggaran keluarga secara transparan dan aman.
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
              className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <UserPlus className="size-4 text-indigo-600 dark:text-indigo-400" />
              Gabung via Kode
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {(() => {
          if (isLoading) {
            return (
              <Card className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Memuat data grup keuangan…
              </Card>
            )
          }

          if (groups.length === 0) {
            return (
              <Card className="relative overflow-hidden p-12 text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Users className="size-8" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Belum Ada Grup Keuangan
                </h2>
                <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Buat grup keuangan bersama untuk memantau pengeluaran keluarga atau pasangan secara otomatis tanpa perlu merekap struk secara manual.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                    <Plus className="size-4" /> Buat Grup Pertama
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setJoinModalOpen(true)}
                    className="gap-1.5"
                  >
                    <UserPlus className="size-4 text-indigo-600 dark:text-indigo-400" /> Gabung via Kode
                  </Button>
                </div>
              </Card>
            )
          }

          return (
            <div className="space-y-6">
              {/* Group Switcher Bar (when multiple groups exist) */}
              {groups.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-semibold text-slate-400">Grup:</span>
                  {groups.map((grp) => {
                    const isSelected = grp.id === activeGroupId
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setSelectedGroupId(grp.id)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60'
                          }`}
                      >
                        <span>{grp.name}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] ${isSelected
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                        >
                          {grp.role}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Active Group Header Hero Card */}
              {activeGroup && (
                <Card className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {activeGroup.name}
                        </h2>
                        <Badge
                          variant={activeGroup.role === 'OWNER' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {activeGroup.role === 'OWNER' ? 'Pemilik' : 'Anggota'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Grup aktif • Dibuat pada {formatDate(activeGroup.created_at)} •{' '}
                        {members.length} Anggota terdaftar
                      </p>
                    </div>

                    {activeGroup.code && activeGroup.role === 'OWNER' && (
                      <div className="flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/60 px-3.5 py-2 dark:border-indigo-900/60 dark:bg-indigo-950/40">
                        <div className="text-left">
                          <span className="block text-[10px] font-semibold text-indigo-600 uppercase dark:text-indigo-400">
                            Kode Undangan
                          </span>
                          <span className="font-mono text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
                            {activeGroup.code}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            void navigator.clipboard.writeText(activeGroup.code || '')
                            toast.info('Kode undangan disalin ke clipboard!')
                          }}
                          className="size-8 p-0 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                          title="Salin Kode"
                        >
                          <Share2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Workspace Tabs Navigation */}
                  <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                    {(() => {
                      const resolvedTab =
                        activeTab === 'ringkasan'
                          ? 'aktivitas'
                          : activeTab === 'rekening'
                            ? 'saldo'
                            : activeTab

                      return (
                        <Tabs value={resolvedTab} onValueChange={setActiveTab}>
                          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                            <TabsTrigger value="saldo" className="gap-2">
                              <Wallet className="size-4" />
                              <span>Kantong & Saldo</span>
                            </TabsTrigger>
                            <TabsTrigger value="aktivitas" className="gap-2">
                              <ReceiptText className="size-4" />
                              <span>Aktivitas & Mutasi</span>
                            </TabsTrigger>
                            <TabsTrigger value="anggota" className="gap-2">
                              <Users className="size-4" />
                              <span>Anggota & Akses</span>
                            </TabsTrigger>
                            <TabsTrigger value="kategori" className="gap-2">
                              <Layers className="size-4" />
                              <span>Kategori & Laporan</span>
                            </TabsTrigger>
                          </TabsList>

                          {/* Tab 1: Kantong Tujuan Grup & Rekening Terhubung */}
                          <TabsContent value="saldo" className="mt-6 space-y-8">
                            <GroupPocketsView groupId={activeGroup.id} />
                            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                              <GroupAccountsView groupId={activeGroup.id} />
                            </div>
                          </TabsContent>

                          {/* Tab 2: Aktivitas & Mutasi (Tanpa Fake Unified Totals) */}
                          <TabsContent value="aktivitas" className="mt-6">
                            <GroupCollaborationView
                              groupId={activeGroup.id}
                              members={members}
                              period={period}
                              onPeriodChange={setPeriod}
                            />
                          </TabsContent>

                          {/* Tab 3: Anggota & Akses */}
                          <TabsContent value="anggota" className="mt-6">
                            <GroupMembersView
                              groupId={activeGroup.id}
                              groupName={activeGroup.name}
                              groupCode={activeGroup.code}
                              currentRole={activeGroup.role}
                              onGroupLeft={() => setSelectedGroupId(null)}
                            />
                          </TabsContent>

                          {/* Tab 4: Kategori & Laporan */}
                          <TabsContent value="kategori" className="mt-6">
                            <GroupCategoriesView
                              groupId={activeGroup.id}
                              period={period}
                            />
                          </TabsContent>
                        </Tabs>
                      )
                    })()}
                  </div>
                </Card>
              )}
            </div>
          )
        })()}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <form onSubmit={(e) => void handleCreateGroup(e)}>
          <DialogHeader onClose={() => setCreateModalOpen(false)}>
            <DialogTitle>Buat Grup Keuangan Baru</DialogTitle>
            <DialogDescription>
              Grup memungkinkan Anda mengelola anggaran bersama dan berbagi visibilitas akun finansial dengan pasangan atau keluarga.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
              htmlFor="grp-name"
            >
              Nama Grup
            </label>
            <Input
              id="grp-name"
              placeholder="Contoh: Keluarga Cemara, Rumah Tangga Sejahtera"
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
              Masukkan 12-karakter kode undangan yang diberikan oleh pemilik grup untuk langsung bergabung.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
              htmlFor="join-code"
            >
              Kode Undangan (12 Karakter)
            </label>
            <Input
              id="join-code"
              placeholder="Contoh: A1B2C3D4E5F6"
              maxLength={12}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="font-mono text-base tracking-wider uppercase"
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
            <Button
              type="submit"
              disabled={joinCode.trim().length !== 12 || joinGroup.isPending}
            >
              {joinGroup.isPending ? 'Bergabung…' : 'Gabung ke Grup'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </AppShell>
  )
}
