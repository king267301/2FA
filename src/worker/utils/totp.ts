// Base32解码
function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const padding = '='
  
  let bits = 0
  let value = 0
  const output: number[] = []
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i).toUpperCase()
    if (char === padding) break
    
    const index = alphabet.indexOf(char)
    if (index === -1) continue
    
    value = (value << 5) | index
    bits += 5
    
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xFF)
      bits -= 8
    }
  }
  
  return new Uint8Array(output)
}

// HMAC-SHA1
async function hmacSHA1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message)
  return new Uint8Array(signature)
}

// 动态截断
function dynamicTruncation(hash: Uint8Array): number {
  const offset = hash[hash.length - 1] & 0x0F
  const code = ((hash[offset] & 0x7F) << 24) |
               ((hash[offset + 1] & 0xFF) << 16) |
               ((hash[offset + 2] & 0xFF) << 8) |
               (hash[offset + 3] & 0xFF)
  
  return code % 1000000
}

// 生成TOTP（基于时间）
export async function generateTOTP(secret: string, digits: number = 6): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const timeStep = 30
  const counter = Math.floor(now / timeStep)
  
  return await generateHOTP(secret, counter, digits)
}

// 生成HOTP（基于计数器）
export async function generateHOTP(secret: string, counter: number, digits: number = 6): Promise<string> {
  const key = base32Decode(secret)
  
  // 将计数器转换为8字节的大端序字节数组
  const counterBytes = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xFF
    counter = counter >>> 8
  }
  
  // 计算HMAC-SHA1
  const hash = await hmacSHA1(key, counterBytes)
  
  // 动态截断
  const code = dynamicTruncation(hash)
  
  // 格式化为指定位数的字符串
  return code.toString().padStart(digits, '0')
} 