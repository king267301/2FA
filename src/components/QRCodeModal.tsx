import { useState, useEffect } from 'react'
import { X, Copy, Download } from 'lucide-react'

interface TwoFAKey {
  id: string
  name: string
  secret: string
  type: 'time' | 'counter'
  counter?: number
  createdAt: string
}

interface QRCodeModalProps {
  keyData: TwoFAKey
  onClose: () => void
}

export default function QRCodeModal({ keyData, onClose }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [keyData])

  const generateQRCode = async () => {
    setIsLoading(true)
    try {
      // 生成otpauth URL
      const otpauthUrl = generateOtpAuthUrl(keyData)
      
      // 调用后端生成QR码
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ url: otpauthUrl })
      })
      
      if (response.ok) {
        const data = await response.json()
        setQrCodeUrl(data.qrCodeUrl)
      }
    } catch (error) {
      console.error('生成QR码失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateOtpAuthUrl = (key: TwoFAKey): string => {
    const baseUrl = 'otpauth://totp/'
    const issuer = encodeURIComponent('2FA解码器')
    const account = encodeURIComponent(key.name)
    const secret = key.secret
    
    if (key.type === 'time') {
      return `${baseUrl}${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
    } else {
      return `${baseUrl}${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&counter=${key.counter || 0}`
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(keyData.secret)
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `${keyData.name}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            QR码 - {keyData.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="p-6 space-y-6">
          {/* QR码显示 */}
          <div className="flex justify-center">
            {isLoading ? (
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : qrCodeUrl ? (
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-64 h-64 mx-auto border border-gray-200 dark:border-gray-600 rounded-lg"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  使用您的2FA应用扫描此QR码
                </p>
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">QR码生成失败</p>
              </div>
            )}
          </div>

          {/* 密钥信息 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密钥信息
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">名称:</span>
                <span className="text-gray-900 dark:text-white">{keyData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">类型:</span>
                <span className="text-gray-900 dark:text-white">
                  {keyData.type === 'time' ? '基于时间' : '基于计数器'}
                </span>
              </div>
              {keyData.type === 'counter' && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">计数器:</span>
                  <span className="text-gray-900 dark:text-white">{keyData.counter}</span>
                </div>
              )}
            </div>
          </div>

          {/* 密钥字符串 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密钥字符串
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={keyData.secret}
                readOnly
                className="input-field flex-1 font-mono text-sm"
              />
              <button
                onClick={copySecret}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              关闭
            </button>
            {qrCodeUrl && (
              <button
                onClick={downloadQRCode}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                下载QR码
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 