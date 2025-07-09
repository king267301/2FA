import { generateTOTP, generateHOTP } from '../utils/totp'
import { v4 as uuidv4 } from '../utils/uuid'

interface TwoFAKey {
  id: string
  name: string
  secret: string
  type: 'time' | 'counter'
  counter?: number
  createdAt: string
}

export const keysHandler = {
  async getKeys(request: Request, env: any): Promise<Response> {
    try {
      const user = (request as any).user
      const keys = await env.KEYS.get(`keys:${user}`, { type: 'json' }) || []
      
      return new Response(JSON.stringify({ keys }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    } catch (error) {
      console.error('Get keys error:', error)
      return new Response(JSON.stringify({ error: '获取密钥失败' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
  },

  async addKey(request: Request, env: any): Promise<Response> {
    try {
      const user = (request as any).user
      const { name, secret, type, counter } = await request.json()
      
      if (!name || !secret || !type) {
        return new Response(JSON.stringify({ error: '缺少必要参数' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
      
      const key: TwoFAKey = {
        id: uuidv4(),
        name,
        secret,
        type,
        counter: type === 'counter' ? (counter || 0) : undefined,
        createdAt: new Date().toISOString()
      }
      
      const keys = await env.KEYS.get(`keys:${user}`, { type: 'json' }) || []
      keys.push(key)
      await env.KEYS.put(`keys:${user}`, JSON.stringify(keys))
      
      return new Response(JSON.stringify({ key, message: '密钥添加成功' }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    } catch (error) {
      console.error('Add key error:', error)
      return new Response(JSON.stringify({ error: '添加密钥失败' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
  },

  async deleteKey(request: Request, env: any): Promise<Response> {
    try {
      const user = (request as any).user
      const url = new URL(request.url)
      const keyId = url.pathname.split('/').pop()
      
      if (!keyId) {
        return new Response(JSON.stringify({ error: '密钥ID不能为空' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
      
      const keys = await env.KEYS.get(`keys:${user}`, { type: 'json' }) || []
      const filteredKeys = keys.filter((key: TwoFAKey) => key.id !== keyId)
      
      if (filteredKeys.length === keys.length) {
        return new Response(JSON.stringify({ error: '密钥不存在' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
      
      await env.KEYS.put(`keys:${user}`, JSON.stringify(filteredKeys))
      
      return new Response(JSON.stringify({ message: '密钥删除成功' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    } catch (error) {
      console.error('Delete key error:', error)
      return new Response(JSON.stringify({ error: '删除密钥失败' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
  }
}

export async function generateCodeHandler(request: Request, env: any): Promise<Response> {
  try {
    const user = (request as any).user
    const url = new URL(request.url)
    const keyId = url.pathname.split('/')[3] // /api/keys/:id/generate
    
    if (!keyId) {
      return new Response(JSON.stringify({ error: '密钥ID不能为空' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    const keys = await env.KEYS.get(`keys:${user}`, { type: 'json' }) || []
    const key = keys.find((k: TwoFAKey) => k.id === keyId)
    
    if (!key) {
      return new Response(JSON.stringify({ error: '密钥不存在' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    let code: string
    
    if (key.type === 'time') {
      code = await generateTOTP(key.secret)
    } else {
      code = await generateHOTP(key.secret, key.counter || 0)
      // 更新计数器
      key.counter = (key.counter || 0) + 1
      await env.KEYS.put(`keys:${user}`, JSON.stringify(keys))
    }
    
    return new Response(JSON.stringify({ code }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('Generate code error:', error)
    return new Response(JSON.stringify({ error: '生成验证码失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
} 