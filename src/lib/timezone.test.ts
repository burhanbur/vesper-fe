import { describe, expect, it, beforeEach } from 'vitest'
import {
    DEFAULT_TIMEZONE,
    SUPPORTED_TIMEZONES,
    fromDatetimeLocalValue,
    getActiveTimezone,
    getTimezoneOption,
    isValidTimezone,
    setActiveTimezone,
    toDateInputValue,
    toDatetimeLocalValue,
} from './timezone'

describe('timezone library', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('configuration & defaults', () => {
        it('defaults to Asia/Jakarta (WIB)', () => {
            expect(DEFAULT_TIMEZONE).toBe('Asia/Jakarta')
            expect(getActiveTimezone()).toBe('Asia/Jakarta')
        })

        it('contains Indonesian timezones and UTC', () => {
            const values = SUPPORTED_TIMEZONES.map((tz) => tz.value)
            expect(values).toContain('Asia/Jakarta')
            expect(values).toContain('Asia/Makassar')
            expect(values).toContain('Asia/Jayapura')
            expect(values).toContain('UTC')
        })

        it('identifies supported timezones correctly', () => {
            expect(isValidTimezone('Asia/Jakarta')).toBe(true)
            expect(isValidTimezone('Asia/Makassar')).toBe(true)
            expect(isValidTimezone('Asia/Jayapura')).toBe(true)
            expect(isValidTimezone('UTC')).toBe(true)
            expect(isValidTimezone('invalid-time-zone')).toBe(false)
        })

        it('returns appropriate options and labels', () => {
            const jakartaOption = getTimezoneOption('Asia/Jakarta')
            expect(jakartaOption.label).toContain('WIB')
            expect(jakartaOption.label).toContain('Jakarta')
            expect(jakartaOption.code).toBe('WIB')
            expect(jakartaOption.offsetLabel).toBe('UTC+7')

            expect(getTimezoneOption('Asia/Makassar').code).toBe('WITA')
            expect(getTimezoneOption('Asia/Jayapura').code).toBe('WIT')
            expect(getTimezoneOption('UTC').code).toBe('UTC')
        })
    })

    describe('persistence', () => {
        it('saves and retrieves chosen timezone from localStorage', () => {
            setActiveTimezone('Asia/Makassar')
            expect(getActiveTimezone()).toBe('Asia/Makassar')
            expect(localStorage.getItem('vesper-timezone')).toBe('Asia/Makassar')
        })

        it('falls back to default if invalid value stored in localStorage', () => {
            localStorage.setItem('vesper-timezone', 'invalid-tz')
            expect(getActiveTimezone()).toBe(DEFAULT_TIMEZONE)
        })
    })

    describe('toDatetimeLocalValue', () => {
        it('formats a UTC ISO string into target timezone wall-clock time', () => {
            // 14:00 UTC = 21:00 WIB (UTC+7)
            const utcIso = '2026-10-24T14:00:00.000Z'

            expect(toDatetimeLocalValue(utcIso, 'Asia/Jakarta')).toBe(
                '2026-10-24T21:00',
            )
            expect(toDatetimeLocalValue(utcIso, 'Asia/Makassar')).toBe(
                '2026-10-24T22:00',
            )
            expect(toDatetimeLocalValue(utcIso, 'Asia/Jayapura')).toBe(
                '2026-10-24T23:00',
            )
            expect(toDatetimeLocalValue(utcIso, 'UTC')).toBe('2026-10-24T14:00')
        })

        it('handles Date instances', () => {
            const date = new Date(Date.UTC(2026, 9, 24, 14, 0, 0))
            expect(toDatetimeLocalValue(date, 'Asia/Jakarta')).toBe(
                '2026-10-24T21:00',
            )
        })

        it('handles day rollover correctly', () => {
            // 2026-10-24 20:00 UTC = 2026-10-25 03:00 WIB
            const utcIso = '2026-10-24T20:00:00.000Z'
            expect(toDatetimeLocalValue(utcIso, 'Asia/Jakarta')).toBe(
                '2026-10-25T03:00',
            )
        })
    })

    describe('fromDatetimeLocalValue', () => {
        it('converts local wall-clock string to exact UTC ISO string', () => {
            // User entered 21:00 in WIB (Jakarta UTC+7) -> backend must receive 14:00 UTC
            const localInput = '2026-10-24T21:00'
            const utcResult = fromDatetimeLocalValue(localInput, 'Asia/Jakarta')
            expect(utcResult).toBe('2026-10-24T14:00:00.000Z')

            // User entered 22:00 in WITA (Makassar UTC+8) -> backend must receive 14:00 UTC
            expect(fromDatetimeLocalValue('2026-10-24T22:00', 'Asia/Makassar')).toBe(
                '2026-10-24T14:00:00.000Z',
            )

            // User entered 23:00 in WIT (Jayapura UTC+9) -> backend must receive 14:00 UTC
            expect(fromDatetimeLocalValue('2026-10-24T23:00', 'Asia/Jayapura')).toBe(
                '2026-10-24T14:00:00.000Z',
            )

            // User entered 14:00 in UTC -> backend receives 14:00 UTC
            expect(fromDatetimeLocalValue('2026-10-24T14:00', 'UTC')).toBe(
                '2026-10-24T14:00:00.000Z',
            )
        })

        it('preserves seconds if provided', () => {
            const localInput = '2026-10-24T21:30:45'
            expect(fromDatetimeLocalValue(localInput, 'Asia/Jakarta')).toBe(
                '2026-10-24T14:30:45.000Z',
            )
        })
    })

    describe('round-trip conversions', () => {
        it('preserves exact instant in time across toDatetimeLocalValue and fromDatetimeLocalValue', () => {
            const originalIso = '2026-05-15T08:35:00.000Z'
            for (const tz of SUPPORTED_TIMEZONES) {
                const local = toDatetimeLocalValue(originalIso, tz.value)
                const roundTrip = fromDatetimeLocalValue(local, tz.value)
                expect(roundTrip).toBe(originalIso)
            }
        })
    })

    describe('toDateInputValue', () => {
        it('returns YYYY-MM-DD corresponding to the wall clock in the timezone', () => {
            // 18:00 UTC on Oct 24 is 01:00 on Oct 25 in Jakarta (UTC+7)
            const lateUtc = new Date(Date.UTC(2026, 9, 24, 18, 0, 0))
            expect(toDateInputValue(lateUtc, 'UTC')).toBe('2026-10-24')
            expect(toDateInputValue(lateUtc, 'Asia/Jakarta')).toBe('2026-10-25')
            expect(toDateInputValue(lateUtc, 'Asia/Jayapura')).toBe('2026-10-25')
        })
    })
})
