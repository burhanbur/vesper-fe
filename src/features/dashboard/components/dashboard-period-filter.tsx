import { useState } from 'react'
import { Clock3, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardPeriodPicker } from './dashboard-period-picker'
import {
    currentPeriodValue,
    dashboardPeriodSchema,
    dashboardSearchSchema,
    type DashboardSearch,
} from '../utils/dashboard-period'

type DashboardPeriodFilterProps = {
    search: DashboardSearch
    onChange: (search: DashboardSearch) => void
}

export function DashboardPeriodFilter(props: DashboardPeriodFilterProps) {
    // Remount drafts on URL navigation, including browser back/forward.
    return (
        <PeriodRangeForm
            key={`${props.search.period}:${props.search.value}:${props.search.end_value ?? props.search.value}`}
            {...props}
        />
    )
}

function PeriodRangeForm({ search, onChange }: DashboardPeriodFilterProps) {
    const [draft, setDraft] = useState(() => ({
        ...search,
        end_value: search.end_value ?? search.value,
    }))
    const result = dashboardSearchSchema.safeParse(draft)
    const label = { daily: 'Tanggal', monthly: 'Bulan', yearly: 'Tahun' }[
        draft.period
    ]

    return (
        <section
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            aria-label="Filter periode dashboard"
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <SlidersHorizontal
                        className="size-4 text-indigo-400"
                        aria-hidden="true"
                    />
                    Filter arus kas
                </h2>
                <span
                    title="Waktu Indonesia Barat"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400"
                >
                    <Clock3 className="size-3" aria-hidden="true" /> WIB
                </span>
            </div>
            <form
                noValidate
                onSubmit={(event) => {
                    event.preventDefault()
                    if (result.success) onChange(result.data)
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <fieldset className="min-w-0">
                    <legend className="mb-1.5 text-xs font-medium text-slate-400">
                        Periode arus kas
                    </legend>
                    <div className="inline-flex gap-1 rounded-lg border border-slate-700 bg-slate-950/50 p-1">
                        {dashboardPeriodSchema.options.map((period) => (
                            <Button
                                key={period}
                                type="button"
                                size="sm"
                                variant={draft.period === period ? 'default' : 'ghost'}
                                aria-pressed={draft.period === period}
                                onClick={() => {
                                    const value = currentPeriodValue(period)
                                    setDraft({ period, value, end_value: value })
                                }}
                            >
                                {
                                    { daily: 'Harian', monthly: 'Bulanan', yearly: 'Tahunan' }[
                                    period
                                    ]
                                }
                            </Button>
                        ))}
                    </div>
                </fieldset>
                {(['value', 'end_value'] as const).map((field) => {
                    const error = result.success
                        ? undefined
                        : result.error.issues.find((issue) => issue.path[0] === field)
                            ?.message
                    return (
                        <div key={field} className="min-w-0 flex-1 basis-36 sm:max-w-48">
                            <label
                                htmlFor={`dashboard-${field}`}
                                className="mb-1.5 block text-xs font-medium text-slate-400"
                            >
                                {label} {field === 'value' ? 'dari' : 'sampai'}
                            </label>
                            <DashboardPeriodPicker
                                id={`dashboard-${field}`}
                                label={`${label} ${field === 'value' ? 'dari' : 'sampai'}`}
                                period={draft.period}
                                value={draft[field]}
                                invalid={Boolean(error)}
                                describedBy={error ? `dashboard-${field}-error` : undefined}
                                onChange={(value) => setDraft({ ...draft, [field]: value })}
                            />
                        </div>
                    )
                })}
                <Button type="submit" disabled={!result.success} className="h-10">
                    Terapkan
                </Button>
                {!result.success && (
                    <div className="w-full space-y-1">
                        {result.error.issues.map((issue) => (
                            <p
                                key={String(issue.path[0])}
                                id={`dashboard-${String(issue.path[0])}-error`}
                                role="alert"
                                className="text-xs text-rose-400"
                            >
                                {issue.message}
                            </p>
                        ))}
                    </div>
                )}
            </form>
        </section>
    )
}
