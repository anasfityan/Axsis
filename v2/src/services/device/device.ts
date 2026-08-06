export interface DeviceIdentity {
  id: string
  name: string
  platform: string
  appVersion: string
  createdAt: string
}

const DEVICE_KEY = 'axsis-v2-device-identity'
const APP_VERSION = '0.1.0'

export function getDeviceIdentity(): DeviceIdentity {
  const stored = localStorage.getItem(DEVICE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as DeviceIdentity
    } catch {
      localStorage.removeItem(DEVICE_KEY)
    }
  }

  const identity: DeviceIdentity = {
    id: crypto.randomUUID(),
    name: detectDeviceName(),
    platform: navigator.userAgentData?.platform ?? navigator.platform ?? 'unknown',
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(DEVICE_KEY, JSON.stringify(identity))
  return identity
}

function detectDeviceName(): string {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('android')) return 'هاتف Android'
  if (ua.includes('iphone') || ua.includes('ipad')) return 'جهاز Apple'
  if (ua.includes('cros')) return 'جهاز ChromeOS'
  if (ua.includes('windows')) return 'جهاز Windows'
  if (ua.includes('mac os')) return 'جهاز Mac'
  if (ua.includes('linux')) return 'جهاز Linux'
  return 'جهاز غير معروف'
}
