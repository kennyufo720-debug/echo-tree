// ╔══════════════════════════════════════════════════════╗
// ║  [MODULE: Treasure] 藏寶圖 — 暫時關閉                 ║
// ║                                                      ║
// ║  重新啟用步驟：                                        ║
// ║  1. 刪除此檔，把 _page.disabled.tsx 改名為 page.tsx   ║
// ║  2. 取消 navbar.tsx 第 14 行的註解                    ║
// ║  3. 取消 forum/page.tsx CATEGORIES 的 treasure 項目  ║
// ╚══════════════════════════════════════════════════════╝
import { notFound } from 'next/navigation'

export default function TreasurePage() {
  notFound()
}
