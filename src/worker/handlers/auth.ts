import { generateToken, verifyCredentials } from '../utils/auth'

export async function loginHandler(request: Request, env: any): Promise<Response> {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    const isValid = await verifyCredentials(username, password, env.USERS)
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    const token = await generateToken(username, env.USERS)
    
    return new Response(JSON.stringify({ 
      token,
      user: username,
      message: '登录成功'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return new Response(JSON.stringify({ error: '登录失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
} 