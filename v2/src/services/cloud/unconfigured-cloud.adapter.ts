import type { CloudAdapter, CloudHealth, PullResult, PushResult } from '@/services/cloud/cloud.types'

export class UnconfiguredCloudAdapter implements CloudAdapter {
  readonly provider = 'unconfigured'

  async checkHealth(): Promise<CloudHealth> {
    return { reachable: false, authenticated: false, provider: this.provider }
  }

  async pushOperations(): Promise<PushResult> {
    throw new Error('خدمة المزامنة السحابية غير مهيأة بعد.')
  }

  async pullChanges(): Promise<PullResult> {
    throw new Error('خدمة المزامنة السحابية غير مهيأة بعد.')
  }
}
