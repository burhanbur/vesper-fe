import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Info,
  XCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useMarkNotificationAsRead,
  useNotifications,
} from '../hooks/use-notifications'
import type { NotificationDto } from '../types/notification'
import { formatDateTime } from '@/lib/formatters'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifications = [], isLoading } = useNotifications()
  const markRead = useMarkNotificationAsRead()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read
    return true
  })

  // Close when clicking outside
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

  async function handleMarkRead(id: string) {
    await markRead.mutateAsync(id)
  }

  async function handleMarkAllAsRead() {
    const unread = notifications.filter((n) => !n.is_read)
    for (const item of unread) {
      await markRead.mutateAsync(item.id)
    }
  }

  function renderIcon(type: NotificationDto['type']) {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="size-4 text-amber-500 dark:text-amber-400" />
      case 'error':
        return <XCircle className="size-4 text-rose-500 dark:text-rose-400" />
      case 'info':
      default:
        return <Info className="size-4 text-indigo-600 dark:text-indigo-400" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id="notification-bell-btn"
        aria-label="Pemberitahuan"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid size-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:shadow-none dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl backdrop-blur-xl duration-150 sm:w-96 dark:border-slate-800/90 dark:bg-slate-900/95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Pemberitahuan
              </h3>
              {unreadCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="border-indigo-200 bg-indigo-50 text-[10px] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400"
                >
                  {unreadCount} Baru
                </Badge>
              ) : null}
            </div>
            {unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                onClick={() => void handleMarkAllAsRead()}
              >
                <CheckCheck className="mr-1 size-3" />
                Tandai Semua Dibaca
              </Button>
            ) : null}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 pt-2 pb-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filter === 'all'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filter === 'unread'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Memuat notifikasi...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto mb-2 size-7 text-slate-400 opacity-50 dark:text-slate-600" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filter === 'unread'
                    ? 'Tidak ada notifikasi yang belum dibaca.'
                    : 'Belum ada pemberitahuan baru.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group relative flex items-start gap-3 rounded-xl border p-3 transition-all ${notif.is_read
                    ? 'border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800/50 dark:bg-slate-900/40 dark:text-slate-400'
                    : 'border-indigo-200 bg-indigo-50/50 text-slate-900 dark:border-indigo-500/20 dark:bg-indigo-500/5 dark:text-slate-200'
                    }`}
                >
                  <div className="mt-0.5 shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-950">
                    {renderIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate text-xs font-semibold text-slate-900 dark:text-slate-200">
                        {notif.title}
                      </h4>
                      {!notif.is_read ? (
                        <button
                          type="button"
                          title="Tandai dibaca"
                          onClick={() => void handleMarkRead(notif.id)}
                          className="rounded p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        >
                          <Check className="size-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {notif.body}
                    </p>
                    <span className="mt-1.5 block text-[10px] text-slate-500">
                      {formatDateTime(notif.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
