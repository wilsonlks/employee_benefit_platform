const POSTER_PATTERN = /^data:image\/(?:jpeg|jpg|png|webp|gif|svg\+xml)[;,]/i
const MAX_POSTER_LENGTH = 550_000

export function posterSrc(value: unknown) {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_POSTER_LENGTH) return ""
  if (!POSTER_PATTERN.test(trimmed)) return ""
  return trimmed
}

export async function readPoster(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("請上傳圖片檔，例如 JPG 或 PNG")
  if (file.size > 8 * 1024 * 1024) throw new Error("原圖超過 8MB，請先縮小再上傳")
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error("未能讀取這張圖片，請改用 JPG 或 PNG")
  const maxEdge = 1280
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("這個瀏覽器未能處理圖片")
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  let quality = 0.82
  let url = canvas.toDataURL("image/jpeg", quality)
  while (url.length > 450_000 && quality > 0.46) {
    quality -= 0.12
    url = canvas.toDataURL("image/jpeg", quality)
  }
  if (!posterSrc(url)) throw new Error("圖片仍然太大，請改用較細的海報")
  return url
}
