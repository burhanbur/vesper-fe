import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
    dashboardPeriodLabel,
    type DashboardPeriod,
} from '../utils/dashboard-period'

const MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
]
const MIN_YEAR = 1000
const MAX_YEAR = 9998
const clampYear = (year: number) => Math.min(MAX_YEAR, Math.max(MIN_YEAR, year))

type DashboardPeriodPickerProps = {
    id: string
    label: string
    period: DashboardPeriod
    value: string
    onChange: (value: string) => void
    invalid?: boolean
    describedBy?: string | undefined
}

export function DashboardPeriodPicker({
    id,
    label,
    period,
    value,
    onChange,
    invalid,
    describedBy,
}: DashboardPeriodPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    let formatted = 'Pilih periode'
    try {
        formatted = dashboardPeriodLabel({ period, value })
    } catch {
        // Invalid URL drafts remain editable without exposing an invalid calendar.
    }
    return (
        <>
            <Button
                id={id}
                type="button"
                variant="outline"
                aria-label={`${label}: ${formatted}`}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className="h-10 w-full justify-start gap-2 px-3 text-left font-normal"
                onClick={() => setIsOpen(true)}
            >
                <CalendarDays
                    className="size-4 shrink-0 text-indigo-400"
                    aria-hidden="true"
                />
                <span className="truncate">{formatted}</span>
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <PickerPanel
                    label={label}
                    period={period}
                    value={value}
                    onClose={() => setIsOpen(false)}
                    onSelect={(selected) => {
                        onChange(selected)
                        setIsOpen(false)
                    }}
                />
            </Dialog>
        </>
    )
}

type PickerPanelProps = Pick<
    DashboardPeriodPickerProps,
    'label' | 'period' | 'value'
> & {
    onClose: () => void
    onSelect: (value: string) => void
}

function PickerPanel({
    label,
    period,
    value,
    onClose,
    onSelect,
}: PickerPanelProps) {
    const [selectedYear = 2026, selectedMonth = 1] = value.split('-').map(Number)
    const [year, setYear] = useState(clampYear(selectedYear))
    const [month, setMonth] = useState(Math.min(12, Math.max(1, selectedMonth)))
    const [view, setView] = useState<DashboardPeriod>(period)
    const [yearPage, setYearPage] = useState(
        Math.min(
            MAX_YEAR - 11,
            Math.max(MIN_YEAR, selectedYear - (selectedYear % 12)),
        ),
    )
    const panelRef = useRef<HTMLDivElement>(null)
    const titleId = useId()
    useEffect(() => {
        const previousFocus = document.activeElement
        const panel = panelRef.current
        panel?.closest('[role="dialog"]')?.setAttribute('aria-labelledby', titleId)
        panel?.focus()
        return () => {
            if (previousFocus instanceof HTMLElement) previousFocus.focus()
        }
    }, [titleId])
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7
    const monthValue = `${year}-${String(month).padStart(2, '0')}`
    const canPrevious =
        view === 'yearly'
            ? yearPage > MIN_YEAR
            : view === 'monthly'
                ? year > MIN_YEAR
                : year > MIN_YEAR || month > 1
    const canNext =
        view === 'yearly'
            ? yearPage < MAX_YEAR - 11
            : view === 'monthly'
                ? year < MAX_YEAR
                : year < MAX_YEAR || month < 12
    function navigate(direction: number) {
        if (view === 'yearly')
            setYearPage(
                Math.min(MAX_YEAR - 11, Math.max(MIN_YEAR, yearPage + direction * 12)),
            )
        else if (view === 'monthly') setYear(clampYear(year + direction))
        else {
            const index = Math.min(
                MAX_YEAR * 12 + 11,
                Math.max(MIN_YEAR * 12, year * 12 + month - 1 + direction),
            )
            setYear(Math.floor(index / 12))
            setMonth((index % 12) + 1)
        }
    }
    function openYears() {
        setYearPage(Math.min(MAX_YEAR - 11, Math.max(MIN_YEAR, year - (year % 12))))
        setView('yearly')
    }

    useEffect(() => {
        const panel = panelRef.current
        if (!panel) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return
            const buttons = panel.querySelectorAll<HTMLButtonElement>(
                'button:not(:disabled)',
            )
            const first = buttons[0]
            const last = buttons[buttons.length - 1]
            if (
                event.shiftKey &&
                (document.activeElement === first || document.activeElement === panel)
            ) {
                event.preventDefault()
                last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first?.focus()
            }
        }

        panel.addEventListener('keydown', handleKeyDown)
        return () => panel.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div
            ref={panelRef}
            tabIndex={-1}
            className="mx-auto w-full max-w-sm outline-none"
        >
            <DialogHeader onClose={onClose}>
                <DialogTitle id={titleId}>Pilih {label.toLowerCase()}</DialogTitle>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {view === 'daily'
                        ? 'Pilih tanggal pada kalender'
                        : view === 'monthly'
                            ? 'Pilih bulan'
                            : 'Pilih tahun'}{' '}
                    · WIB
                </p>
            </DialogHeader>
            <div className="my-4 flex items-center justify-between gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Periode sebelumnya"
                    disabled={!canPrevious}
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
                <div className="flex items-center gap-1" aria-live="polite">
                    {view === 'daily' && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('monthly')}
                        >
                            {MONTHS[month - 1]}
                        </Button>
                    )}
                    {view === 'yearly' ? (
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {yearPage} – {yearPage + 11}
                        </span>
                    ) : (
                        <Button type="button" variant="ghost" size="sm" onClick={openYears}>
                            {year}
                        </Button>
                    )}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Periode berikutnya"
                    disabled={!canNext}
                    onClick={() => navigate(1)}
                >
                    <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
            </div>
            {view === 'daily' ? (
                <div className="grid grid-cols-7 gap-1">
                    {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                        <span
                            key={day}
                            className="pb-2 text-center text-xs font-medium text-slate-500"
                        >
                            {day}
                        </span>
                    ))}
                    {Array.from({ length: offset }, (_, index) => (
                        <span key={`blank-${index}`} aria-hidden="true" />
                    ))}
                    {Array.from({ length: days }, (_, index) => {
                        const day = index + 1
                        const dateValue = `${monthValue}-${String(day).padStart(2, '0')}`
                        return (
                            <Button
                                key={day}
                                type="button"
                                variant={dateValue === value ? 'default' : 'ghost'}
                                className="h-10 rounded-lg px-0 text-sm"
                                aria-label={`${day} ${MONTHS[month - 1]} ${year}`}
                                aria-pressed={dateValue === value}
                                onClick={() => onSelect(dateValue)}
                            >
                                {day}
                            </Button>
                        )
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 12 }, (_, index) => {
                        const candidate =
                            view === 'monthly'
                                ? `${year}-${String(index + 1).padStart(2, '0')}`
                                : String(yearPage + index)
                        const selected =
                            view === 'monthly'
                                ? value.slice(0, 7) === candidate
                                : value.slice(0, 4) === candidate
                        return (
                            <Button
                                key={candidate}
                                type="button"
                                variant={selected ? 'default' : 'outline'}
                                aria-pressed={selected}
                                className={cn(
                                    'h-12 rounded-lg text-xs',
                                    selected && 'ring-1 ring-indigo-400/50',
                                )}
                                onClick={() => {
                                    if (view === period) onSelect(candidate)
                                    else if (view === 'yearly') {
                                        setYear(yearPage + index)
                                        setView('monthly')
                                    } else {
                                        setMonth(index + 1)
                                        setView('daily')
                                    }
                                }}
                            >
                                {view === 'monthly' ? MONTHS[index] : candidate}
                            </Button>
                        )
                    })}
                </div>
            )}
            <p className="mt-4 border-t border-slate-200 pt-3 text-center text-xs text-slate-500 dark:border-slate-800">
                {period === 'daily'
                    ? 'Klik bulan atau tahun untuk berpindah cepat.'
                    : 'Rentang tahun 1000–9998.'}
            </p>
        </div>
    )
}
