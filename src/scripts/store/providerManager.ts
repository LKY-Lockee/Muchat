import providers, { type Provider } from '@/config/providers'

class ProviderManager {
  getProvider(providerId: string) {
    const provider = Object.assign(
      {},
      providers.find((provider) => provider.id === providerId),
    )

    provider.apiKey = providerManager.getConfigValue(providerId, 'apiKey') as string
    provider.url = providerManager.getConfigValue(providerId, 'url') as string
    provider.models = JSON.parse(
      (providerManager.getConfigValue(providerId, 'models') as string) || '[]',
    )

    return provider
  }

  getKey(providerId: string, field: keyof Provider) {
    return `provider.${providerId}.${field}`
  }

  getStoredValue(providerId: string, field: keyof Provider) {
    const key = this.getKey(providerId, field)
    return localStorage.getItem(key)
  }

  setStoredValue(providerId: string, field: keyof Provider, value: string | null | undefined) {
    const key = this.getKey(providerId, field)
    const defaultValue = this.getDefaultValue(providerId, field)

    if (value && (typeof value !== 'string' || value.trim()) && value !== defaultValue) {
      localStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
    }
  }

  getDefaultValue(providerId: string, field: keyof Provider) {
    const provider = providers.find((provider) => provider.id === providerId)

    if (!provider) {
      return ''
    }

    return provider[field] || ''
  }

  getConfigValue(providerId: string, field: keyof Provider) {
    return this.getStoredValue(providerId, field) || this.getDefaultValue(providerId, field)
  }

  getAllProviders() {
    return providers.map((provider) => this.getProvider(provider.id))
  }

  getAllModels() {
    return this.getAllProviders()
      .map((provider) => provider.models || [])
      .flat()
  }
}

const providerManager = new ProviderManager()
export default providerManager
