import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  LogOut, 
  Plus, 
  Key, 
  Clock, 
  Copy, 
  Trash2, 
  Sun, 
  Moon,
  RefreshCw,
  QrCode,
  Settings
} from 'lucide-react'
import AddKeyModal from './AddKeyModal'
import QRCodeModal from './QRCodeModal'

interface TwoFAKey {
  id: string
  name: string
  secret: string
  type: 'time' | 'counter'
  counter?: number
  createdAt: string
}

export default function Dashboard() {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [keys, setKeys] = useState<TwoFAKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedKey, setSelectedKey] = useState<TwoFAKey | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchKeys()
    // 设置自动刷新（每30秒）
    const interval = setInterval(() => {
      fetchKeys()
    }, 30000)
    setRefreshInterval(interval)

    return () => {
      if (refreshInterval) clearInterval(refreshInterval)
    }
  }, [])

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys)
      }
    } catch (error) {
      console.error('获取密钥失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddKey = async (keyData: Omit<TwoFAKey, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(keyData)
      })
      
      if (response.ok) {
        await fetchKeys()
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('添加密钥失败:', error)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm('确定要删除这个密钥吗？')) return
    
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        await fetchKeys()
      }
    } catch (error) {
      console.error('删除密钥失败:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateCode = async (key: TwoFAKey) => {
    try {
      const response = await fetch(`/api/keys/${key.id}/generate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.code
      }
    } catch (error) {
      console.error('生成验证码失败:', error)
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Key className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                谷歌2FA解码器
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                欢迎，{user}
              </span>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和操作按钮 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              2FA 密钥管理
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理您的谷歌两步验证密钥
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加密钥
            </button>
            
            <button
              onClick={fetchKeys}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </button>
          </div>
        </div>

        {/* 密钥列表 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无密钥
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              点击"添加密钥"开始管理您的2FA密钥
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              添加第一个密钥
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {keys.map((key) => (
              <KeyCard
                key={key.id}
                keyData={key}
                onDelete={handleDeleteKey}
                onGenerateCode={generateCode}
                onShowQR={() => {
                  setSelectedKey(key)
                  setShowQRModal(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showAddModal && (
        <AddKeyModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddKey}
        />
      )}

      {showQRModal && selectedKey && (
        <QRCodeModal
          keyData={selectedKey}
          onClose={() => {
            setShowQRModal(false)
            setSelectedKey(null)
          }}
        />
      )}
    </div>
  )
}

// 密钥卡片组件
function KeyCard({ 
  keyData, 
  onDelete, 
  onGenerateCode, 
  onShowQR 
}: { 
  keyData: TwoFAKey
  onDelete: (id: string) => void
  onGenerateCode: (key: TwoFAKey) => Promise<string | null>
  onShowQR: () => void
}) {
  const [code, setCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateCode = async () => {
    setIsGenerating(true)
    const generatedCode = await onGenerateCode(keyData)
    if (generatedCode) {
      setCode(generatedCode)
    }
    setIsGenerating(false)
  }

  useEffect(() => {
    generateCode()
    const interval = setInterval(generateCode, 30000) // 每30秒刷新
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {keyData.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {keyData.type === 'time' ? '基于时间' : '基于计数器'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onShowQR}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <QrCode className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(keyData.id)}
            className="p-2 text-red-400 hover:text-red-600 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* 验证码显示 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              当前验证码
            </span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          
          {isGenerating ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                {code}
              </span>
              <button
                onClick={() => copyToClipboard(code)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 密钥信息 */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>密钥ID: {keyData.id}</p>
          <p>创建时间: {new Date(keyData.createdAt).toLocaleString('zh-CN')}</p>
        </div>
      </div>
    </div>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
} 