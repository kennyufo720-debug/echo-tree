'use client'
import Link from 'next/link'
import { Search, User, Menu, CheckCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useTicketCount, useUser } from '@/lib/store'
import { useUnreadCount } from '@/lib/messages'

export default function Navbar() {
  const ticketCount = useTicketCount()
  const user = useUser()
  const unreadMessages = useUnreadCount()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.svg" alt="回音樹 Echo Tree" className="h-11 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋演唱會、藝人、場館..."
              className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 ml-auto">
          <Link href="/events">
            <Button variant="ghost" size="sm">活動</Button>
          </Link>
          <Link href="/forum">
            <Button variant="ghost" size="sm"> 論壇</Button>
          </Link>
          <Link href="/treasure">
            <Button variant="ghost" size="sm"> 藏寶圖</Button>
          </Link>
          <Link href="/points">
            <Button variant="ghost" size="sm"> 點數兌換</Button>
          </Link>
          <Link href="/forest">
            <Button variant="ghost" size="sm"> 名人堂</Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="sm">後台</Button>
          </Link>
          <Link href="/messages">
            <Button variant="ghost" size="sm" className="relative">
              <MessageCircle className="h-4 w-4 mr-1" />私訊
              {unreadMessages > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 text-[10px] flex items-center justify-center bg-red-500">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/tickets">
            <Button variant="ghost" size="sm" className="relative">
              我的票券
              {ticketCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 text-[10px] flex items-center justify-center bg-emerald-600">
                  {ticketCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/verify">
            <Button size="sm" className={`ml-2 ${user.verified ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}>
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

        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden ml-auto" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/events"><Button variant="ghost" className="w-full justify-start">活動</Button></Link>
              <Link href="/tickets">
                <Button variant="ghost" className="w-full justify-start">
                  我的票券
                  {ticketCount > 0 && (
                    <Badge className="ml-auto bg-emerald-600 text-white text-xs">{ticketCount}</Badge>
                  )}
                </Button>
              </Link>
              <Link href="/forum"><Button variant="ghost" className="w-full justify-start"> 論壇</Button></Link>
              <Link href="/messages">
                <Button variant="ghost" className="w-full justify-start">
                   私訊
                  {unreadMessages > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">{unreadMessages}</Badge>
                  )}
                </Button>
              </Link>
              <Link href="/treasure"><Button variant="ghost" className="w-full justify-start"> 子瑜藏寶圖</Button></Link>
              <Link href="/points"><Button variant="ghost" className="w-full justify-start"> 點數兌換</Button></Link>
              <Link href="/forest"><Button variant="ghost" className="w-full justify-start"> 回音森林名人堂</Button></Link>
              <Link href="/admin"><Button variant="ghost" className="w-full justify-start">後台管理</Button></Link>
              <Link href="/verify">
                <Button className={`w-full ${user.verified ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {user.verified ? ` 已驗證 ${user.phone}` : '登入 / 驗證'}
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
