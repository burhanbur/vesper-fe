export interface TimezoneOption {
    readonly value: string
    readonly label: string
    readonly code: string
    readonly offsetLabel: string
    readonly description: string
}

export const DEFAULT_TIMEZONE = 'Asia/Jakarta'
export const TIMEZONE_STORAGE_KEY = 'vesper-timezone'

export const SUPPORTED_TIMEZONES: readonly TimezoneOption[] = [
    {
        value: 'Asia/Jakarta',
        label: 'WIB — Jakarta',
        code: 'WIB',
        offsetLabel: 'UTC+7',
        description: 'Waktu Indonesia Barat (Sumatra, Jawa, Kalbar, Kalteng)',
    },
    {
        value: 'Asia/Makassar',
        label: 'WITA — Makassar',
        code: 'WITA',
        offsetLabel: 'UTC+8',
        description:
            'Waktu Indonesia Tengah (Sulawesi, Bali, NTB, NTT, Kalsel, Kaltim, Kaltara)',
    },
    {
        value: 'Asia/Jayapura',
        label: 'WIT — Jayapura',
        code: 'WIT',
        offsetLabel: 'UTC+9',
        description: 'Waktu Indonesia Timur (Maluku, Papua)',
    },
    {
        value: 'UTC',
        label: 'UTC — Universal',
        code: 'UTC',
        offsetLabel: 'UTC+0',
        description: 'Coordinated Universal Time (Standar Internasional)',
    },
] as const

export function isValidTimezone(tz: string): boolean {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz })
        return true
    } catch {
        return false
    }
}

export function getActiveTimezone(): string {
    if (typeof window === 'undefined') return DEFAULT_TIMEZONE
    try {
        const stored = window.localStorage.getItem(TIMEZONE_STORAGE_KEY)
        if (stored && isValidTimezone(stored)) {
            return stored
        }
    } catch {
        // localStorage unavailable or restricted
    }
    return DEFAULT_TIMEZONE
}

export function setActiveTimezone(tz: string): void {
    if (typeof window === 'undefined') return
    try {
        if (isValidTimezone(tz)) {
            window.localStorage.setItem(TIMEZONE_STORAGE_KEY, tz)
            window.dispatchEvent(
                new CustomEvent('vesper-timezone-change', { detail: { timezone: tz } }),
            )
        }
    } catch {
        // localStorage unavailable
    }
}

export function getTimezoneOffsetLabel(
    tz: string,
    date: Date = new Date(),
): string {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'shortOffset',
        }).formatToParts(date)
        const tzPart = parts.find((p) => p.type === 'timeZoneName')
        if (tzPart?.value) {
            return tzPart.value.replace('GMT', 'UTC')
        }
    } catch {
        // fallback
    }
    return 'UTC'
}

export function getTimezoneOption(
    tz: string = getActiveTimezone(),
): TimezoneOption {
    const found = SUPPORTED_TIMEZONES.find((item) => item.value === tz)
    if (found) return found

    return {
        value: tz,
        label: tz,
        code: tz.split('/').pop()?.replace(/_/g, ' ') || tz,
        offsetLabel: getTimezoneOffsetLabel(tz),
        description: `Zona waktu kustom (${tz})`,
    }
}

/**
 * Format a Date or ISO string to 'YYYY-MM-DDTHH:mm' suitable for <input type="datetime-local" />
 * in the specified timezone (defaults to getActiveTimezone()).
 */
export function toDatetimeLocalValue(
    dateInput: Date | string | number = new Date(),
    timeZone: string = getActiveTimezone(),
): string {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput)
    if (Number.isNaN(d.getTime())) {
        return ''
    }

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(d)

    const map: Record<string, string> = {}
    for (const part of parts) {
        map[part.type] = part.value
    }

    const hour = map.hour === '24' ? '00' : (map.hour ?? '00')
    return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}`
}

/**
 * Format a Date or ISO string to 'YYYY-MM-DD' suitable for <input type="date" />
 * in the specified timezone (defaults to getActiveTimezone()).
 */
export function toDateInputValue(
    dateInput: Date | string | number = new Date(),
    timeZone: string = getActiveTimezone(),
): string {
    const localIso = toDatetimeLocalValue(dateInput, timeZone)
    return localIso ? localIso.slice(0, 10) : ''
}

/**
 * Converts a datetime-local input string ('YYYY-MM-DDTHH:mm' or 'YYYY-MM-DDTHH:mm:ss')
 * entered in the specified timezone into a valid UTC ISO 8601 string for backend storage.
 */
export function fromDatetimeLocalValue(
    localIso: string,
    timeZone: string = getActiveTimezone(),
): string {
    if (!localIso) {
        return new Date().toISOString()
    }

    const [datePart, timePart = ''] = localIso.split('T')
    if (!datePart) return new Date().toISOString()
    const [year = 0, month = 1, day = 1] = datePart.split('-').map(Number)
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number)

    const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second))

    const getOffset = (d: Date) => {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(d)
        const map: Record<string, string> = {}
        for (const part of parts) {
            map[part.type] = part.value
        }
        const tzDateInGuess = new Date(
            Date.UTC(
                Number(map.year),
                Number(map.month) - 1,
                Number(map.day),
                Number(map.hour),
                Number(map.minute),
                Number(map.second),
            ),
        )
        return tzDateInGuess.getTime() - d.getTime()
    }

    const offset = getOffset(guess)
    const target = new Date(guess.getTime() - offset)
    const targetOffset = getOffset(target)
    const finalDate =
        targetOffset !== offset ? new Date(guess.getTime() - targetOffset) : target

    return finalDate.toISOString()
}
