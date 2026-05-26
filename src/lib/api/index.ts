// ╔══════════════════════════════════════════════════════╗
// ║  API Modules — 統一入口                               ║
// ║                                                      ║
// ║  每個模組對應一個功能域，方便替換或修改：                 ║
// ║  • events   → 演唱會活動  /api/events                 ║
// ║  • users    → 使用者認證  /api/users                  ║
// ║  • orders   → 票券訂單    /api/orders                 ║
// ║  • points   → 忠誠點數    /api/points                 ║
// ║  • forum    → 論壇系統    /api/forum                  ║
// ║  • forest   → ESG 森林    /api/forest                 ║
// ║  • store    → 點數商城    /api/store                  ║
// ║  • messages → 私訊系統    /api/messages               ║
// ╚══════════════════════════════════════════════════════╝

export * as eventsApi  from './events'
export * as usersApi   from './users'
export * as ordersApi  from './orders'
export * as pointsApi  from './points'
export * as forumApi   from './forum'
export * as forestApi  from './forest'
export * as storeApi   from './store'
export * as messagesApi from './messages'
