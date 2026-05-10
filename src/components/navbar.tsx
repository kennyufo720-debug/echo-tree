'use client'
import Link from 'next/link'
import { Search, User, Menu, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useTicketCount, useUser } from '@/lib/store'

const NAV_ITEMS = [
  { label: '首頁',         href: '/'         },
  { label: '活動',         href: '/events'   },
  { label: '論壇',         href: '/forum'    },
  { label: '藏寶圖',       href: '/treasure' },
  { label: '回音森林名人堂', href: '/forest'   },
  { label: '限量商城',     href: '/store'    },
  { label: '點數兌換',     href: '/points'   },
  { label: '會員後台',     href: '/member'   },
]

export default function Navbar() {
  const ticketCount = useTicketCount()
  const user = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">

        {/* Logo → 隱藏後台入口 */}
        <Link href="/admin" className="flex items-center shrink-0">
          <img src="/logo.svg" alt="回音樹 Echo Tree" className="h-8 md:h-10 w-auto object-contain" />
        </Link>

        {/* 搜尋列 */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋演唱會、藝人、場館..."
              className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* 桌面導覽 */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link key={href} href={href}>
              <Button variant="ghost" size="sm">{label}</Button>
            </Link>
          ))}

          {/* 登入 / 驗證 */}
          <Link href="/verify">
            <Button
              size="sm"
              className={`ml-2 ${user.verified ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
            >
              {user.verified ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {user.phone.slice(-4) ? `已驗證 ${user.phone.slice(-4)}` : '已驗證'}
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-1" />
                  登入 / 驗證
                </>
              )}
            </Button>
          </Link>
        </nav>

        {/* 手機選單 */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden ml-auto" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-3 mt-8">
              {NAV_ITEMS.map(({ label, href }) => (
                <Link key={href} href={href}>
                  <Button variant="ghost" className="w-full justify-start">{label}</Button>
                </Link>
              ))}
              <Link href="/verify">
                <Button className={`w-full mt-2 ${user.verified ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {user.verified ? `已驗證 ${user.phone}` : '登入 / 驗證'}
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  )
}
