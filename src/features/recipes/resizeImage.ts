/** Downscales a picture with a canvas before sending it to parse-recipe —
 * keeps the request body small without a new dependency. Longest side
 * ~1600px, JPEG quality 0.8. Returns base64 with no `data:` prefix. */
export async function resizeImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const maxSide = 1600
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}
