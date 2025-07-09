import { useState } from 'react'
import { X, Key, Clock, Hash } from 'lucide-react'

interface AddKeyModalProps {
  onClose: () => void
  onAdd: (keyData: { name: string; secret: string; type: 'time' | 'counter'; counter?: number }) => void
}

export default function AddKeyModal({ onClose, onAdd }: AddKeyModalProps) {
  const [name, setName] = useState('')
  const [secret, setSecret] = useState('')
  const [type, setType] = useState<'time' | 'counter'>('time')
  const [counter, setCounter] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onAdd({
        name,
        secret,
        type,
        counter: type === 'counter' ? counter : undefined
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setSecret(result)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Key className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              添加2FA密钥
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 模态框内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 密钥名称 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密钥名称
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="例如：Google账户、GitHub等"
              required
            />
          </div>

          {/* 密钥类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              验证类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('time')}
                className={`p-3 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center ${
                  type === 'time'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                基于时间
              </button>
              <button
                type="button"
                onClick={() => setType('counter')}
                className={`p-3 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center ${
                  type === 'counter'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Hash className="w-4 h-4 mr-2" />
                基于计数器
              </button>
            </div>
          </div>

          {/* 计数器值（仅当类型为counter时显示） */}
          {type === 'counter' && (
            <div>
              <label htmlFor="counter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                初始计数器值
              </label>
              <input
                id="counter"
                type="number"
                value={counter}
                onChange={(e) => setCounter(parseInt(e.target.value) || 0)}
                className="input-field"
                min="0"
                required
              />
            </div>
          )}

          {/* 密钥 */}
          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密钥
            </label>
            <div className="flex space-x-2">
              <input
                id="secret"
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="input-field flex-1"
                placeholder="输入Base32编码的密钥"
                required
              />
              <button
                type="button"
                onClick={generateRandomSecret}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 text-sm"
              >
                生成
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              密钥应该是Base32编码的字符串，通常从您的2FA应用或服务提供商处获得
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !name || !secret}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  添加中...
                </div>
              ) : (
                '添加密钥'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 