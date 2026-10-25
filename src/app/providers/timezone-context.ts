import { createContext, useContext } from 'react'
import {
    DEFAULT_TIMEZONE,
    SUPPORTED_TIMEZONES,
    fromDatetimeLocalValue,
    getTimezoneOption,
    toDateInputValue,
    toDatetimeLocalValue,
    type TimezoneOption,
} from '@/lib/timezone'

export interface TimezoneContextValue {
    readonly timezone: string
    readonly activeOption: TimezoneOption
    readonly supportedTimezones: readonly TimezoneOption[]
    readonly setTimezone: (tz: string) => void
    readonly toDatetimeLocal: (dateInput?: Date | string | number) => string
    readonly toDateInput: (dateInput?: Date | string | number) => string
    readonly fromDatetimeLocal: (localIso: string) => string
}

export const TimezoneContext = createContext<TimezoneContextValue | null>(null)

export function useTimezone(): TimezoneContextValue {
    const context = useContext(TimezoneContext)
    if (!context) {
        return {
            timezone: DEFAULT_TIMEZONE,
            activeOption: getTimezoneOption(DEFAULT_TIMEZONE),
            supportedTimezones: SUPPORTED_TIMEZONES,
            setTimezone: () => { },
            toDatetimeLocal: (dateInput) =>
                toDatetimeLocalValue(dateInput, DEFAULT_TIMEZONE),
            toDateInput: (dateInput) => toDateInputValue(dateInput, DEFAULT_TIMEZONE),
            fromDatetimeLocal: (localIso) =>
                fromDatetimeLocalValue(localIso, DEFAULT_TIMEZONE),
        }
    }
    return context
}
