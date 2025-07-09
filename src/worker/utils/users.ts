interface User {
  username: string
  password: string
  tokens: string[]
}

export async function initDefaultUser(usersKV: any, env?: any): Promise<void> {
  try {
    // 检查默认用户是否已存在
    const existingUser = await usersKV.get('user:admin', { type: 'json' }) as User | null
    
    if (!existingUser) {
      // 兼容Cloudflare Workers环境变量
      const defaultPassword = (env && env.DEFAULT_PASSWORD) || 'your-new-password'
      // 创建默认用户
      const defaultUser: User = {
        username: 'admin',
        password: defaultPassword, // 从环境变量读取密码
        tokens: []
      }
      
      await usersKV.put('user:admin', JSON.stringify(defaultUser))
      console.log('默认用户已创建: admin/自定义密码')
    }
  } catch (error) {
    console.error('初始化默认用户失败:', error)
  }
} 