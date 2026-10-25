import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import {
    SUPPORTED_TIMEZONES,
    TIMEZONE_STORAGE_KEY,
    getActiveTimezone,
    getTimezoneOption,
    isValidTimezone,
    setActiveTimezone as persistTimezone,
    toDatetimeLocalValue,
    toDateInputValue,
    fromDatetimeLocalValue,
    type TimezoneOption,
} from '@/lib/timezone'
import { TimezoneContext, type TimezoneContextValue } from './timezone-context'

export interface TimezoneProviderProps {
    readonly children: ReactNode
    readonly defaultTimezone?: string
}

export function TimezoneProvider({
    children,
    defaultTimezone,
}: TimezoneProviderProps) {
    const [timezone, setTimezoneState] = useState<string>(() => {
        if (defaultTimezone && isValidTimezone(defaultTimezone)) {
            return defaultTimezone
        }
        return getActiveTimezone()
    })

    const setTimezone = useCallback((newTimezone: string) => {
        if (!isValidTimezone(newTimezone)) return
        setTimezoneState(newTimezone)
        persistTimezone(newTimezone)
    }, [])

    // Listen to cross-tab or custom event storage updates
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (
                e.key === TIMEZONE_STORAGE_KEY &&
                e.newValue &&
                isValidTimezone(e.newValue)
            ) {
                setTimezoneState(e.newValue)
            }
        }
        const handleCustomChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ timezone: string }>
            if (
                customEvent.detail?.timezone &&
                isValidTimezone(customEvent.detail.timezone)
            ) {
                setTimezoneState(customEvent.detail.timezone)
            }
        }

        window.addEventListener('storage', handleStorage)
        window.addEventListener('vesper-timezone-change', handleCustomChange)
        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('vesper-timezone-change', handleCustomChange)
        }
    }, [])

    const activeOption = useMemo<TimezoneOption>(
        () => getTimezoneOption(timezone),
        [timezone],
    )

    const toDatetimeLocal = useCallback(
        (dateInput?: Date | string | number) =>
            toDatetimeLocalValue(dateInput, timezone),
        [timezone],
    )

    const toDateInput = useCallback(
        (dateInput?: Date | string | number) =>
            toDateInputValue(dateInput, timezone),
        [timezone],
    )

    const fromDatetimeLocal = useCallback(
        (localIso: string) => fromDatetimeLocalValue(localIso, timezone),
        [timezone],
    )

    const contextValue = useMemo<TimezoneContextValue>(
        () => ({
            timezone,
            activeOption,
            supportedTimezones: SUPPORTED_TIMEZONES,
            setTimezone,
            toDatetimeLocal,
            toDateInput,
            fromDatetimeLocal,
        }),
        [
            timezone,
            activeOption,
            setTimezone,
            toDatetimeLocal,
            toDateInput,
            fromDatetimeLocal,
        ],
    )

    return (
        <TimezoneContext.Provider value={contextValue}>
            {children}
        </TimezoneContext.Provider>
    )
}
