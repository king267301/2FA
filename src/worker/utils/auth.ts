import { v4 as uuidv4 } from './uuid'

interface User {
  username: string
  password: string
  tokens: string[]
}

export async function verifyCredentials(username: string, password: string, usersKV: any): Promise<boolean> {
  try {
    const userData = await usersKV.get(`user:${username}`, { type: 'json' }) as User | null
    
    if (!userData) {
      return false
    }
    
    return userData.password === password
  } catch (error) {
    console.error('Verify credentials error:', error)
    return false
  }
}

export async function generateToken(username: string, usersKV: any): Promise<string> {
  const token = uuidv4()
  
  try {
    const userData = await usersKV.get(`user:${username}`, { type: 'json' }) as User | null
    
    if (userData) {
      userData.tokens = userData.tokens || []
      userData.tokens.push(token)
      
      // 限制token数量，保留最新的10个
      if (userData.tokens.length > 10) {
        userData.tokens = userData.tokens.slice(-10)
      }
      
      await usersKV.put(`user:${username}`, JSON.stringify(userData))
    }
  } catch (error) {
    console.error('Generate token error:', error)
  }
  
  return token
}

export async function verifyToken(token: string, usersKV: any): Promise<string | null> {
  try {
    // 获取所有用户并查找包含此token的用户
    const list = await usersKV.list({ prefix: 'user:' })
    
    for (const key of list.keys) {
      const userData = await usersKV.get(key.name, { type: 'json' }) as User | null
      
      if (userData && userData.tokens && userData.tokens.includes(token)) {
        return userData.username
      }
    }
    
    return null
  } catch (error) {
    console.error('Verify token error:', error)
    return null
  }
} 