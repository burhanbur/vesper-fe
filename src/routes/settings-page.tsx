import { useNavigate } from '@tanstack/react-router'
import {
  KeyRound,
  Monitor,
  Moon,
  Plus,
  Power,
  Settings,
  Smartphone,
  Sun,
  Tags,
  Trash2,
  User,
  WalletCards,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccountTypes, useCreateAccountType } from '@/features/accounts'
import {
  ApiKeyCreateDialog,
  useApiKeys,
  useDeleteApiKey,
  useUpdateApiKey,
} from '@/features/api-keys'
import {
  CategoryGroups,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/features/categories'
import type { CategoryType } from '@/features/categories/types/category'
import { useDevices, useProfile, useUpdateProfile } from '@/features/profile'
import { useTheme } from '@/hooks/use-theme'
import { formatDateTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan' | ''>('')

  // Category modal state
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<CategoryType>('EXPENSE')
  const { data: categories = [] } = useCategories()
  const createCat = useCreateCategory()
  const deleteCat = useDeleteCategory()

  // Account Type modal state
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeCategory, setNewTypeCategory] = useState<'CASH' | 'INVESTMENT'>(
    'CASH',
  )
  const { data: accountTypes = [] } = useAccountTypes()
  const createType = useCreateAccountType()

  // Devices state
  const { data: devices = [] } = useDevices()

  // API Keys state
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const { data: apiKeys = [], isLoading: apiKeysLoading } = useApiKeys()
  const updateApiKey = useUpdateApiKey()
  const deleteApiKey = useDeleteApiKey()

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync({
        full_name: fullName || profile?.full_name || null,
        phone_number: phoneNumber || profile?.phone_number || null,
        gender: (gender || profile?.gender) as 'Laki-laki' | 'Perempuan' | null,
        theme: theme || 'system',
        base_currency: 'IDR',
      })
      toast.success('Profil berhasil diperbarui!')
    } catch {
      toast.error('Gagal memperbarui profil.')
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return

    try {
      await createCat.mutateAsync({
        name: newCatName.trim(),
        type: newCatType,
      })
      setNewCatName('')
      setCatModalOpen(false)
      toast.success('Kategori baru berhasil ditambahkan!')
    } catch {
      toast.error('Gagal menambahkan kategori.')
    }
  }

  async function handleDeleteCategory(id: string, version: string) {
    if (window.confirm('Hapus kategori ini?')) {
      try {
        await deleteCat.mutateAsync({ id, version })
        toast.success('Kategori dihapus.')
      } catch {
        toast.error('Gagal menghapus kategori.')
      }
    }
  }

  async function handleCreateAccountType(e: React.FormEvent) {
    e.preventDefault()
    if (!newTypeName.trim()) return

    try {
      await createType.mutateAsync({
        name: newTypeName.trim(),
        category: newTypeCategory,
      })
      setNewTypeName('')
      setTypeModalOpen(false)
      toast.success('Tipe akun baru berhasil dibuat!')
    } catch {
      toast.error('Gagal membuat tipe akun.')
    }
  }

  async function handleToggleApiKey(id: string, currentStatus: boolean) {
    try {
      await updateApiKey.mutateAsync({
        id,
        input: { is_active: !currentStatus },
      })
      toast.success(
        currentStatus
          ? 'API Key dinonaktifkan.'
          : 'API Key diaktifkan kembali.',
      )
    } catch {
      toast.error('Gagal mengubah status API Key.')
    }
  }

  async function handleDeleteApiKey(id: string, name: string) {
    if (
      window.confirm(
        `Cabut dan hapus API Key "${name}"? Aplikasi atau bot yang menggunakan kunci ini tidak akan bisa mengakses API lagi.`,
      )
    ) {
      try {
        await deleteApiKey.mutateAsync(id)
        toast.success('API Key berhasil dihapus.')
      } catch {
        toast.error('Gagal menghapus API Key.')
      }
    }
  }

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            <Settings className="size-7 text-indigo-500 dark:text-indigo-400" />
            Pengaturan & Preferensi
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola data profil, tema tampilan, master kategori keuangan, tipe
            akun, perangkat, dan API Keys Anda.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid max-w-2xl grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="profile">
              <User className="mr-1.5 hidden size-3.5 sm:inline" /> Profil
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tags className="mr-1.5 hidden size-3.5 sm:inline" /> Kategori
            </TabsTrigger>
            <TabsTrigger value="account-types">
              <WalletCards className="mr-1.5 hidden size-3.5 sm:inline" /> Tipe
              Akun
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Smartphone className="mr-1.5 hidden size-3.5 sm:inline" />{' '}
              Perangkat
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <KeyRound className="mr-1.5 hidden size-3.5 sm:inline" /> API Keys
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile */}
          <TabsContent value="profile">
            <Card className="max-w-2xl p-6">
              <CardHeader className="border-b border-slate-200 p-0 pb-5 dark:border-slate-800">
                <CardTitle className="text-lg">Profil & Tampilan</CardTitle>
                <CardDescription>
                  Informasi akun, tema antarmuka (terang/gelap), dan preferensi
                  mata uang dasar.
                </CardDescription>
              </CardHeader>

              <form
                onSubmit={(e) => void handleSaveProfile(e)}
                className="space-y-5 pt-5"
              >
                {/* Theme Selector */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tema Tampilan (Theme)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilih tampilan yang paling nyaman untuk Anda.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all',
                        theme === 'light'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60',
                      )}
                    >
                      <div
                        className={cn(
                          'grid size-9 place-items-center rounded-lg',
                          theme === 'light'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                        )}
                      >
                        <Sun className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Terang
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Light Mode
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all',
                        theme === 'dark'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60',
                      )}
                    >
                      <div
                        className={cn(
                          'grid size-9 place-items-center rounded-lg',
                          theme === 'dark'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                        )}
                      >
                        <Moon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Gelap
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Dark Mode
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all',
                        theme === 'system'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60',
                      )}
                    >
                      <div
                        className={cn(
                          'grid size-9 place-items-center rounded-lg',
                          theme === 'system'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                        )}
                      >
                        <Monitor className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Sistem
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Otomatis OS
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                    htmlFor="prof-fullname"
                  >
                    Nama Lengkap
                  </label>
                  <Input
                    id="prof-fullname"
                    placeholder="Nama Anda"
                    defaultValue={profile?.full_name || ''}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                    htmlFor="prof-phone"
                  >
                    Nomor Telepon
                  </label>
                  <Input
                    id="prof-phone"
                    placeholder="+628123456789"
                    defaultValue={profile?.phone_number || ''}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="prof-gender"
                    >
                      Jenis Kelamin
                    </label>
                    <Select
                      id="prof-gender"
                      defaultValue={profile?.gender || ''}
                      onChange={(e) =>
                        setGender(
                          e.target.value as 'Laki-laki' | 'Perempuan' | '',
                        )
                      }
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="prof-curr"
                    >
                      Mata Uang Utama
                    </label>
                    <Input
                      id="prof-curr"
                      disabled
                      value="IDR (Rupiah Indonesia)"
                      className="bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending
                      ? 'Menyimpan…'
                      : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* Tab 2: Categories */}
          <TabsContent value="categories">
            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Kategori Transaksi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Klasifikasi pos pemasukan dan pengeluaran Anda.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setCatModalOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="size-4" />
                  Tambah Kategori
                </Button>
              </div>

              <CategoryGroups
                categories={categories}
                onDelete={(id, version) =>
                  void handleDeleteCategory(id, version)
                }
              />
            </Card>
          </TabsContent>

          {/* Tab 3: Account Types */}
          <TabsContent value="account-types">
            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tipe Akun Keuangan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kategori klasifikasi rekening (CASH vs INVESTMENT).
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setTypeModalOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="size-4" />
                  Tambah Tipe Akun
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {accountTypes.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {t.name}
                      </p>
                      <Badge
                        variant={
                          t.category === 'INVESTMENT' ? 'default' : 'outline'
                        }
                        className="mt-1 text-[10px]"
                      >
                        {t.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tab 4: Devices */}
          <TabsContent value="devices">
            <Card className="space-y-4 p-6">
              <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Perangkat Terdaftar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar perangkat yang terhubung dengan akun Vesper ini.
                </p>
              </div>

              {devices.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  Belum ada perangkat mobile yang terdaftar untuk sinkronisasi.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {devices.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="size-5 text-indigo-500 dark:text-indigo-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {d.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Platform: {d.platform} • App v{d.app_version}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Versi Sinkron: {d.last_sync_version}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tab 5: API Keys */}
          <TabsContent value="api-keys">
            <Card className="space-y-4 p-6">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                    <KeyRound className="size-4 text-indigo-500 dark:text-indigo-400" />
                    Manajemen API Keys
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kunci akses aman untuk integrasi bot eksternal, automation,
                    dan layanan machine-to-machine.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setApiKeyModalOpen(true)}
                  className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  <Plus className="size-4" />
                  Buat API Key Baru
                </Button>
              </div>

              {apiKeysLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                  Memuat daftar API Keys...
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-800">
                  <KeyRound className="mx-auto mb-2 size-8 text-slate-400 opacity-60 dark:text-slate-600" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Belum ada API Key aktif
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                    Buat token API rahasia untuk mengizinkan skrip atau aplikasi
                    pihak ketiga mengakses data finansial Anda secara aman.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setApiKeyModalOpen(true)}
                    className="mt-4 border-slate-700 text-xs"
                  >
                    <Plus className="mr-1 size-3.5" /> Buat Kunci Pertama
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {key.name}
                          </span>
                          {key.application ? (
                            <Badge variant="outline" className="text-[10px]">
                              {key.application}
                            </Badge>
                          ) : null}
                          <Badge
                            variant={key.is_active ? 'success' : 'secondary'}
                            className="text-[10px]"
                          >
                            {key.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                            {key.key_prefix}
                          </span>
                          <span>Batas: {key.rate_limit} req/menit</span>
                          <span>Dibuat: {formatDateTime(key.created_at)}</span>
                          {key.last_used_at ? (
                            <span>
                              Terakhir dipakai:{' '}
                              {formatDateTime(key.last_used_at)}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">
                              Belum pernah dipakai
                            </span>
                          )}
                        </div>
                        {key.description ? (
                          <p className="pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {key.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void handleToggleApiKey(key.id, key.is_active)
                          }
                          className={`text-xs ${
                            key.is_active
                              ? 'text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
                              : 'text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300'
                          }`}
                        >
                          <Power className="mr-1 size-3.5" />
                          {key.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            void handleDeleteApiKey(key.id, key.name)
                          }
                          className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 className="mr-1 size-3.5" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal API Key */}
      <ApiKeyCreateDialog
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
      />

      {/* Create Category Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <form onSubmit={(e) => void handleCreateCategory(e)}>
          <DialogHeader onClose={() => setCatModalOpen(false)}>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
            <DialogDescription>
              Kategori membantu Anda mengelompokkan pos transaksi dan anggaran.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                htmlFor="cat-name-input"
              >
                Nama Kategori
              </label>
              <Input
                id="cat-name-input"
                placeholder="Contoh: Belanja Bulanan, Gaji, Dividen"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                htmlFor="cat-type-select"
              >
                Tipe Kategori
              </label>
              <Select
                id="cat-type-select"
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as CategoryType)}
              >
                <option value="EXPENSE">💸 Pengeluaran (Expense)</option>
                <option value="INCOME">💰 Pemasukan (Income)</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCatModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createCat.isPending}>
              {createCat.isPending ? 'Menyimpan…' : 'Simpan Kategori'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Create Account Type Modal */}
      <Dialog open={typeModalOpen} onOpenChange={setTypeModalOpen}>
        <form onSubmit={(e) => void handleCreateAccountType(e)}>
          <DialogHeader onClose={() => setTypeModalOpen(false)}>
            <DialogTitle>Tambah Tipe Akun Baru</DialogTitle>
            <DialogDescription>
              Tentukan apakah tipe akun ini berupa kas/bank atau investasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                htmlFor="type-name-input"
              >
                Nama Tipe Akun
              </label>
              <Input
                id="type-name-input"
                placeholder="Contoh: Rekening Giro, RDN, Kripto"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                htmlFor="type-cat-select"
              >
                Kategori
              </label>
              <Select
                id="type-cat-select"
                value={newTypeCategory}
                onChange={(e) =>
                  setNewTypeCategory(e.target.value as 'CASH' | 'INVESTMENT')
                }
              >
                <option value="CASH">CASH (Kas & Bank)</option>
                <option value="INVESTMENT">
                  INVESTMENT (Investasi & Portofolio)
                </option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTypeModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createType.isPending}>
              {createType.isPending ? 'Menyimpan…' : 'Simpan Tipe Akun'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </AppShell>
  )
}
