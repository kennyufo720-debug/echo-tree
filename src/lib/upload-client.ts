// ╔══════════════════════════════════════════════════════╗
// ║  CLIENT UTIL: uploadFile                             ║
// ║  [MODULE: Upload] 上傳檔案並取得 Storage 公開 URL     ║
// ╚══════════════════════════════════════════════════════╝

/**
 * Upload a File to /api/upload (Supabase Storage) and return the public URL.
 * The database should only ever store the returned URL, never raw file data.
 */
export async function uploadFile(file: File, folder = 'uploads'): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)

  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? '上傳失敗')
  }
  const { url } = await res.json() as { url: string }
  return url
}
