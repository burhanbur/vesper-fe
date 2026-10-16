import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react'
import {
  formatCompactCurrency,
  formatCurrency,
  parseCurrency,
  sanitizeCurrency,
  terbilangRupiah,
} from '@/lib/currency'
import { cn } from '@/lib/utils'

export interface CurrencyValueChangeDetail {
  readonly raw: number
  readonly backend: string
  readonly formatted: string
  readonly compact: string
}

export interface CurrencyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'prefix'
> {
  /**
   * Controlled value: can be a raw number (1000000), numeric string ("1000000"),
   * formatted string ("1.000.000"), or shorthand ("1jt").
   */
  readonly value?: number | string | null | undefined

  /**
   * Callback providing standard React change event where e.target.value
   * is the sanitized backend string (e.g. "1000000").
   */
  readonly onChange?: (e: ChangeEvent<HTMLInputElement>) => void

  /**
   * Direct callback providing the sanitized backend string (e.g. "1000000").
   * Ideal for direct state setter: onRawChange={setAmount}
   */
  readonly onRawChange?: (raw: string) => void

  /**
   * Rich detail callback providing all computed representations.
   */
  readonly onValueChange?: (detail: CurrencyValueChangeDetail) => void

  /**
   * Currency prefix symbol. Defaults to 'Rp'. Set to empty string or undefined to omit.
   */
  readonly prefix?: string | undefined

  /**
   * Whether to display the compact badge (e.g. "1 jt", "1,5 jt", "500 rb")
   * on the right side of the input when amount >= 1.000.
   * Default: true
   */
  readonly showCompactBadge?: boolean | undefined

  /**
   * Whether to display Indonesian words terbilang (e.g. "Satu Juta Rupiah")
   * underneath the input field. Default: false
   */
  readonly showTerbilang?: boolean | undefined

  /**
   * Additional wrapper container CSS class name.
   */
  readonly wrapperClassName?: string | undefined
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onChange,
      onRawChange,
      onValueChange,
      prefix = 'Rp',
      showCompactBadge = true,
      showTerbilang = false,
      className,
      wrapperClassName,
      placeholder = '0',
      disabled = false,
      onBlur,
      onKeyDown,
      ...restProps
    },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement,
    )

    const internalId = useId()
    const inputId = restProps.id ?? internalId

    // Local display string
    const [displayValue, setDisplayValue] = useState<string>(() => {
      if (value === null || value === undefined || value === '') return ''
      return formatCurrency(value)
    })

    const [isFocused, setIsFocused] = useState(false)

    // Sync external value changes when not actively typing or if external value reset (controlled mode)
    useEffect(() => {
      if (isFocused || value === undefined) return

      if (value === null || value === '') {
        setDisplayValue('')
        return
      }

      const formatted = formatCurrency(value)
      setDisplayValue(formatted)
    }, [value, isFocused])

    // Current parsed numeric value & representations
    const parsedNumber = parseCurrency(displayValue)
    const compactLabel =
      parsedNumber >= 1_000 ? formatCompactCurrency(parsedNumber) : ''

    const notifyChange = useCallback(
      (newDisplay: string) => {
        const num = parseCurrency(newDisplay)
        const sanitized = sanitizeCurrency(newDisplay)
        const formatted = formatCurrency(num)
        const compact = num >= 1_000 ? formatCompactCurrency(num) : ''

        onRawChange?.(sanitized)

        onValueChange?.({
          raw: num,
          backend: sanitized,
          formatted,
          compact,
        })

        if (onChange && inputRef.current) {
          const domInput = inputRef.current
          const eventTarget = {
            name: domInput.name,
            id: domInput.id,
            value: sanitized,
          }

          const syntheticEvent = {
            target: eventTarget,
            currentTarget: eventTarget,
            bubbles: true,
            cancelable: false,
            defaultPrevented: false,
            eventPhase: 3,
            isTrusted: true,
            nativeEvent: new Event('change'),
            preventDefault: () => { },
            isDefaultPrevented: () => false,
            stopPropagation: () => { },
            isPropagationStopped: () => false,
            persist: () => { },
            timeStamp: Date.now(),
            type: 'change',
          } as unknown as ChangeEvent<HTMLInputElement>

          onChange(syntheticEvent)
        }
      },
      [onChange, onRawChange, onValueChange],
    )

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value

      // Strict numeric filtering: strip all non-digit characters (including alphabets)
      const digitsOnly = rawInput.replace(/\D/g, '')

      if (!digitsOnly) {
        setDisplayValue('')
        notifyChange('')
        return
      }

      const num = parseInt(digitsOnly, 10)
      const formatted = formatCurrency(num)

      setDisplayValue(formatted)
      notifyChange(formatted)
    }

    const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)

      if (displayValue.trim()) {
        const num = parseCurrency(displayValue)
        if (num > 0) {
          const finalFormatted = formatCurrency(num)
          setDisplayValue(finalFormatted)
          notifyChange(finalFormatted)
        } else {
          setDisplayValue('')
          notifyChange('')
        }
      }

      onBlur?.(e)
    }

    const handleInputFocus = () => {
      setIsFocused(true)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Allow browser shortcuts (Cmd+A, Cmd+C, Cmd+V, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        onKeyDown?.(e)
        return
      }

      // Allow navigation and editing keys
      const allowedNavigationKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Enter',
        'Escape',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ]

      if (allowedNavigationKeys.includes(e.key)) {
        onKeyDown?.(e)
        return
      }

      // Block any character that is not a numeric digit (0-9)
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        return
      }

      onKeyDown?.(e)
    }

    return (
      <div className={cn('relative w-full', wrapperClassName)}>
        <div
          className={cn(
            'flex h-10 w-full items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:focus-within:ring-indigo-500/50',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          {prefix ? (
            <span className="mr-2 text-xs font-semibold tracking-wider text-slate-500 select-none dark:text-slate-400">
              {prefix}
            </span>
          ) : null}

          <input
            {...restProps}
            id={inputId}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          {showCompactBadge && compactLabel ? (
            <span
              data-testid="compact-badge"
              className="ml-2 inline-flex shrink-0 items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
              title={`Nominal ringkas: ${compactLabel}`}
            >
              ≈ {compactLabel}
            </span>
          ) : null}
        </div>

        {showTerbilang && parsedNumber > 0 ? (
          <p
            data-testid="terbilang-text"
            className="mt-1 text-[11px] text-slate-500 italic dark:text-slate-400"
          >
            {terbilangRupiah(parsedNumber)}
          </p>
        ) : null}
      </div>
    )
  },
)
