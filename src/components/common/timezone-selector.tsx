import { Check, Clock, Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTimezone } from '@/hooks/use-timezone'
import { SUPPORTED_TIMEZONES } from '@/lib/timezone'
import { cn } from '@/lib/utils'

interface TimezoneToggleProps {
    readonly className?: string
    readonly size?: 'sm' | 'default'
    readonly showLabel?: boolean
}

export function TimezoneToggle({
    className,
    size = 'default',
    showLabel = true,
}: TimezoneToggleProps) {
    const { timezone, setTimezone, activeOption } = useTimezone()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    return (
        <div
            className={cn('relative inline-block text-left', className)}
            ref={dropdownRef}
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'flex cursor-pointer items-center gap-1.5 rounded-xl border transition-all duration-200 select-none',
                    size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-xs',
                    'border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900',
                    'dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:shadow-none dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                )}
                aria-label="Pilih Zona Waktu"
                title={`Zona Waktu: ${activeOption.label} (${activeOption.offsetLabel})`}
                aria-expanded={isOpen}
            >
                <Globe className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {activeOption.code}
                </span>
                {showLabel && (
                    <span className="hidden text-[10px] text-slate-500 sm:inline dark:text-slate-400">
                        {activeOption.offsetLabel}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#0c1220] dark:shadow-2xl">
                    <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800/80">
                        <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-indigo-500" />
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                Pilih Zona Waktu
                            </p>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            Menentukan waktu pencatatan transaksi & tampilan
                        </p>
                    </div>

                    <div className="mt-1 space-y-1">
                        {SUPPORTED_TIMEZONES.map((option) => {
                            const isSelected = option.value === timezone
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setTimezone(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        'flex w-full cursor-pointer items-start justify-between rounded-xl p-2.5 text-left transition-colors',
                                        isSelected
                                            ? 'bg-indigo-50/80 text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-200'
                                            : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60',
                                    )}
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold">
                                                {option.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                                                )}
                                            >
                                                {option.offsetLabel}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {option.description}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <Check className="mt-0.5 size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

interface InlineTimezoneSelectProps {
    readonly value: string
    readonly onChange: (tz: string) => void
    readonly className?: string
}

export function InlineTimezoneSelect({
    value,
    onChange,
    className,
}: InlineTimezoneSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                'h-7 rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700',
                className,
            )}
            aria-label="Zona Waktu Form"
        >
            {SUPPORTED_TIMEZONES.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.code} ({option.offsetLabel})
                </option>
            ))}
        </select>
    )
}
