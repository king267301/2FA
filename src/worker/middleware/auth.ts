import { verifyToken } from '../utils/auth'

export async function authMiddleware(request: Request, env: any): Promise<Response | void> {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const user = await verifyToken(token, env.USERS)
    if (!user) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    // 将用户信息添加到请求上下文
    ;(request as any).user = user
    return undefined
  } catch (error) {
    return new Response('Unauthorized', { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
} 