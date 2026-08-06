export interface DeviceIdentity {
  id: string
  name: string
  platform: string
  appVersion: string
  createdAt: string
}

interface NavigatorUserAgentData {
  platform?: string
}

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: NavigatorUserAgentData
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

  const navigatorWithUserAgentData = navigator as NavigatorWithUserAgentData
  const identity: DeviceIdentity = {
    id: crypto.randomUUID(),
    name: detectDeviceName(),
    platform:
      navigatorWithUserAgentData.userAgentData?.platform ||
      navigator.platform ||
      detectPlatformFromUserAgent(),
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

function detectPlatformFromUserAgent(): string {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('android')) return 'Android'
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
  if (ua.includes('cros')) return 'ChromeOS'
  if (ua.includes('windows')) return 'Windows'
  if (ua.includes('mac os')) return 'macOS'
  if (ua.includes('linux')) return 'Linux'
  return 'unknown'
}
