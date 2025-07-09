export function v4(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  
  // 设置版本位 (版本4)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  // 设置变体位
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-')
} 