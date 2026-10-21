import { Link } from '@tanstack/react-router'
import { ArrowRight, Layers, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'

export function LandingHeader() {
    const { user, status } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const isAuthenticated = status === 'authenticated' && Boolean(user)

    const navLinks = [
        { href: '#fitur', label: 'Fitur Utama' },
        { href: '#multi-aset', label: 'Portofolio' },
        { href: '#kolaborasi', label: 'Keuangan Bersama' },
        { href: '#offline', label: 'Bebas Kuota' },
        { href: '#simulasi', label: 'Simulasi Tabungan' },
        { href: '#faq', label: 'Tanya Jawab' },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-colors duration-200 dark:border-white/10 dark:bg-[#090D16]/80">
            <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo */}
                <Link to="/" className="group flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-md shadow-indigo-600/30 transition-transform duration-200 group-hover:scale-105">
                        <Layers className="size-5" aria-hidden />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            VESPER
                        </span>
                        <span className="text-[11px] font-medium tracking-tight text-slate-500 dark:text-slate-400">
                            Keuangan Pribadi & Keluarga
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav
                    aria-label="Navigasi Utama"
                    className="hidden items-center gap-1 md:flex"
                >
                    {navLinks.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-3 md:flex">
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <Button asChild variant="default" size="sm" className="gap-2">
                            <Link to="/dashboard">
                                <LayoutDashboard className="size-4" aria-hidden />
                                <span>Buka Dashboard</span>
                                <ArrowRight className="size-4" aria-hidden />
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="gap-2 bg-indigo-600 font-semibold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500"
                        >
                            <Link to="/login">
                                <span>Masuk ke Akun</span>
                                <ArrowRight className="size-4" aria-hidden />
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu navigasi'}
                        className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {mobileMenuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="border-b border-slate-200 bg-white/95 px-4 pt-2 pb-6 shadow-xl backdrop-blur-2xl md:hidden dark:border-slate-800 dark:bg-[#090D16]/95">
                    <div className="flex flex-col gap-1.5 py-3">
                        {navLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="mt-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                        {isAuthenticated ? (
                            <Button
                                asChild
                                variant="default"
                                className="w-full justify-center gap-2"
                            >
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <LayoutDashboard className="size-4" aria-hidden />
                                    <span>Buka Dashboard</span>
                                    <ArrowRight className="size-4" aria-hidden />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                asChild
                                variant="default"
                                className="w-full justify-center gap-2 bg-indigo-600 font-semibold text-white hover:bg-indigo-700"
                            >
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <span>Masuk ke Akun</span>
                                    <ArrowRight className="size-4" aria-hidden />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
