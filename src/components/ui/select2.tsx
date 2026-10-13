import { Check, ChevronDown, Search, X } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { cn } from '@/lib/utils'

export interface Select2Option {
  readonly value: string
  readonly label: string
  readonly badge?: string | undefined
  readonly description?: string | undefined
  readonly icon?: ReactNode | undefined
}

export interface Select2Props {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly options: readonly Select2Option[]
  readonly placeholder?: string | undefined
  readonly searchPlaceholder?: string | undefined
  readonly emptyMessage?: string | undefined
  readonly className?: string | undefined
  readonly disabled?: boolean | undefined
  readonly id?: string | undefined
  readonly size?: 'sm' | 'default' | undefined
  readonly align?: 'left' | 'right' | undefined
}

export function Select2({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Cari...',
  emptyMessage = 'Tidak ada opsi yang cocok.',
  className,
  disabled = false,
  id,
  size = 'default',
  align = 'right',
}: Select2Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [manualHighlightedIndex, setManualHighlightedIndex] = useState<
    number | null
  >(null)
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down')

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return options

    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q)
      const matchBadge = opt.badge?.toLowerCase().includes(q)
      const matchDesc = opt.description?.toLowerCase().includes(q)
      const matchValue = opt.value.toLowerCase().includes(q)
      return matchLabel || matchBadge || matchDesc || matchValue
    })
  }, [options, searchQuery])

  // Determine active highlighted index without calling setState in an effect
  const defaultHighlightedIndex = useMemo(() => {
    const selectedIdx = filteredOptions.findIndex((opt) => opt.value === value)
    return selectedIdx >= 0 ? selectedIdx : 0
  }, [filteredOptions, value])

  const activeHighlightedIndex =
    manualHighlightedIndex !== null &&
    manualHighlightedIndex >= 0 &&
    manualHighlightedIndex < filteredOptions.length
      ? manualHighlightedIndex
      : defaultHighlightedIndex

  // Smart direction detection and focus search input when opening
  useEffect(() => {
    if (isOpen) {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const dropdownHeight = 280

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          setOpenDirection('up')
        } else {
          setOpenDirection('down')
        }
      }

      const timeout = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 30)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
        setManualHighlightedIndex(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && activeHighlightedIndex >= 0) {
      const el = optionRefs.current[activeHighlightedIndex]
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [isOpen, activeHighlightedIndex])

  function closeDropdown() {
    setIsOpen(false)
    setSearchQuery('')
    setManualHighlightedIndex(null)
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue)
    closeDropdown()
    triggerRef.current?.focus()
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === 'Enter' ||
      e.key === ' '
    ) {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filteredOptions.length > 0) {
        setManualHighlightedIndex(
          (activeHighlightedIndex + 1) % filteredOptions.length,
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filteredOptions.length > 0) {
        setManualHighlightedIndex(
          (activeHighlightedIndex - 1 + filteredOptions.length) %
            filteredOptions.length,
        )
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const currentItem = filteredOptions[activeHighlightedIndex]
      if (currentItem) {
        handleSelect(currentItem.value)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeDropdown()
      triggerRef.current?.focus()
    } else if (e.key === 'Tab') {
      closeDropdown()
    }
  }

  const isSmall = size === 'sm'

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block w-full', isOpen && 'z-30')}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (disabled) return
          if (isOpen) {
            closeDropdown()
          } else {
            setIsOpen(true)
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'group flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/80 text-left text-slate-100 shadow-sm transition-all select-none',
          'hover:border-slate-600 hover:bg-slate-900/95 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isSmall ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 text-sm',
          isOpen && 'border-indigo-500/80 ring-2 ring-indigo-500/30',
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {selectedOption?.icon ? (
            <span className="shrink-0">{selectedOption.icon}</span>
          ) : null}
          <span className={cn('truncate', !selectedOption && 'text-slate-500')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge ? (
            <span
              className={cn(
                'ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                selectedOption.value === 'NEW'
                  ? 'border border-indigo-500/30 bg-indigo-500/20 text-indigo-300'
                  : 'border border-slate-800 bg-slate-800/80 text-slate-400',
              )}
            >
              {selectedOption.badge}
            </span>
          ) : null}
        </div>

        <ChevronDown
          className={cn(
            'shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-slate-200',
            isSmall ? 'size-3.5' : 'size-4',
            isOpen && 'rotate-180 text-indigo-400',
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen ? (
        <div
          className={cn(
            'absolute z-50 flex flex-col rounded-xl border border-slate-700/80 bg-slate-900/95 p-1.5 text-slate-100 shadow-2xl backdrop-blur-xl',
            'w-full min-w-[280px] sm:min-w-[320px]',
            align === 'right' ? 'right-0' : 'left-0',
            openDirection === 'up'
              ? 'animate-in fade-in-0 zoom-in-95 bottom-full mb-1.5'
              : 'animate-in fade-in-0 zoom-in-95 top-full mt-1.5',
          )}
        >
          {/* Search Input Box */}
          <div className="relative px-1 pt-1 pb-1.5">
            <Search className="pointer-events-none absolute top-3.5 left-3 size-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setManualHighlightedIndex(0)
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-lg border border-slate-800 bg-slate-950/80 pr-7 pl-8 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setManualHighlightedIndex(0)
                  searchInputRef.current?.focus()
                }}
                className="absolute top-3 right-2.5 grid size-5 place-items-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Hapus pencarian"
              >
                <X className="size-3" />
              </button>
            ) : null}
          </div>

          {/* Options List */}
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-56 overflow-y-auto px-0.5 py-1 text-xs"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-slate-500">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value
                const isHighlighted = idx === activeHighlightedIndex

                return (
                  <li key={opt.value} role="presentation">
                    <button
                      type="button"
                      ref={(el) => {
                        optionRefs.current[idx] = el
                      }}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setManualHighlightedIndex(idx)}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors select-none',
                        isSelected
                          ? 'border-l-2 border-indigo-500 bg-indigo-600/20 font-semibold text-indigo-200'
                          : isHighlighted
                            ? 'bg-slate-800/80 text-white'
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white',
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {opt.icon ? (
                          <span className="shrink-0">{opt.icon}</span>
                        ) : null}
                        <div className="min-w-0">
                          <span className="block truncate">{opt.label}</span>
                          {opt.description ? (
                            <span className="block truncate text-[10px] font-normal text-slate-500">
                              {opt.description}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {opt.badge ? (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-normal',
                              opt.value === 'NEW'
                                ? 'border border-indigo-500/30 bg-indigo-500/20 text-indigo-300'
                                : 'border border-slate-800 bg-slate-800/80 text-slate-400',
                            )}
                          >
                            {opt.badge}
                          </span>
                        ) : null}
                        {isSelected ? (
                          <Check className="size-3.5 shrink-0 text-indigo-400" />
                        ) : null}
                      </div>
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          {/* Quick Counter Footer if many items */}
          {options.length > 5 ? (
            <div className="flex items-center justify-between border-t border-slate-800/60 px-3 py-1.5 text-[10px] text-slate-500">
              <span>{filteredOptions.length} pilihan ditemukan</span>
              {searchQuery ? (
                <span className="text-indigo-400">
                  Tekan Enter untuk memilih
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
