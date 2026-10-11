import { useNavigate } from '@tanstack/react-router'
import {
  Plus,
  Settings,
  Smartphone,
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
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/features/categories'
import type { CategoryType } from '@/features/categories/types/category'
import { useDevices, useProfile, useUpdateProfile } from '@/features/profile'

export function SettingsPage() {
  const navigate = useNavigate()
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

  // Devices
  const { data: devices = [] } = useDevices()

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync({
        full_name: fullName || profile?.full_name || null,
        phone_number: phoneNumber || profile?.phone_number || null,
        gender: (gender || profile?.gender) as 'Laki-laki' | 'Perempuan' | null,
        theme: (profile?.theme as 'dark' | 'light' | 'system') || 'dark',
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

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            <Settings className="size-7 text-indigo-400" />
            Pengaturan & Preferensi
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Kelola data profil, master kategori keuangan, tipe akun, dan
            perangkat Anda.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid max-w-xl grid-cols-4">
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
          </TabsList>

          {/* Tab 1: Profile */}
          <TabsContent value="profile">
            <Card className="max-w-2xl p-6">
              <CardHeader className="border-b border-slate-800 p-0 pb-5">
                <CardTitle className="text-lg">Profil Pengguna</CardTitle>
                <CardDescription>
                  Informasi akun dan preferensi mata uang dasar.
                </CardDescription>
              </CardHeader>

              <form
                onSubmit={(e) => void handleSaveProfile(e)}
                className="space-y-4 pt-5"
              >
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-slate-300"
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
                    className="text-xs font-medium text-slate-300"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-medium text-slate-300"
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
                      className="text-xs font-medium text-slate-300"
                      htmlFor="prof-curr"
                    >
                      Mata Uang Utama
                    </label>
                    <Input
                      id="prof-curr"
                      disabled
                      value="IDR (Rupiah Indonesia)"
                      className="bg-slate-800/50"
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
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Kategori Transaksi
                  </h3>
                  <p className="text-xs text-slate-400">
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">
                        {c.type === 'INCOME' ? '💰' : '💸'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {c.name}
                        </p>
                        <Badge
                          variant={
                            c.type === 'INCOME' ? 'success' : 'destructive'
                          }
                          className="text-[10px]"
                        >
                          {c.type}
                        </Badge>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDeleteCategory(c.id, c.version)}
                      className="rounded p-1 text-slate-500 hover:text-rose-400"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tab 3: Account Types */}
          <TabsContent value="account-types">
            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Tipe Akun Keuangan
                  </h3>
                  <p className="text-xs text-slate-400">
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
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
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
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white">
                  Perangkat Terdaftar
                </h3>
                <p className="text-xs text-slate-400">
                  Daftar perangkat yang terhubung dengan akun Vesper ini.
                </p>
              </div>

              {devices.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada perangkat mobile yang terdaftar untuk sinkronisasi.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {devices.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="size-5 text-indigo-400" />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {d.name}
                          </p>
                          <p className="text-xs text-slate-400">
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
        </Tabs>
      </div>

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
                className="text-xs font-medium text-slate-300"
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
                className="text-xs font-medium text-slate-300"
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
                className="text-xs font-medium text-slate-300"
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
                className="text-xs font-medium text-slate-300"
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
