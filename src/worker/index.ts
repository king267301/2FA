import { Router } from 'itty-router'
import { handleCORS } from './middleware/cors'
import { authMiddleware } from './middleware/auth'
import { loginHandler } from './handlers/auth'
import { keysHandler, keyHandler, generateCodeHandler } from './handlers/keys'
import { qrCodeHandler } from './handlers/qr'
import { initDefaultUser } from './utils/users'

const router = Router()

// 中间件
router.all('*', handleCORS)

// 认证路由
router.post('/api/auth/login', loginHandler)

// 需要认证的路由
router.get('/api/keys', authMiddleware, keysHandler.getKeys)
router.post('/api/keys', authMiddleware, keysHandler.addKey)
router.delete('/api/keys/:id', authMiddleware, keysHandler.deleteKey)
router.get('/api/keys/:id/generate', authMiddleware, generateCodeHandler)

// QR码生成
router.post('/api/qr', authMiddleware, qrCodeHandler)

// 静态文件服务
router.get('*', async (request: Request, env: any) => {
  const url = new URL(request.url)
  
  // 如果是API请求但路由不存在，返回404
  if (url.pathname.startsWith('/api/')) {
    return new Response('Not Found', { status: 404 })
  }
  
  // 否则返回index.html（SPA路由）
  try {
    const asset = await env.ASSETS.fetch(request)
    if (asset.status === 200) {
      return asset
    }
  } catch (e) {
    // 如果静态资源不存在，返回index.html
  }
  
  // 返回index.html用于客户端路由
  const indexResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url)))
  return new Response(indexResponse.body, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  })
})

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // 初始化默认用户
    await initDefaultUser(env.USERS)
    
    try {
      return await router.handle(request, env, ctx)
    } catch (error) {
      console.error('Worker error:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
} 