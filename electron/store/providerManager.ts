import db from '#/store/database'
import { providers } from '&/config/providers'
import { type Provider, Model } from '&/provider'
import { type IpcContext, IpcMethod, IpcService } from 'electron-ipc-decorator'

db.exec(`
  CREATE TABLE IF NOT EXISTS provider_settings (
    providerId TEXT PRIMARY KEY,
    apiKey TEXT,
    url TEXT
  );

  CREATE TABLE IF NOT EXISTS provider_models (
    id TEXT,
    provider TEXT,
    object TEXT,
    owned_by TEXT,
    type TEXT,
    PRIMARY KEY (id, provider)
  );
`)

const statements = {
  getAllSettings: db.prepare<never[], { providerId: string; apiKey?: string; url?: string }>(
    'SELECT * FROM provider_settings',
  ),
  getSettingByProviderId: db.prepare<string, { apiKey: string | null; url: string | null }>(
    'SELECT apiKey, url FROM provider_settings WHERE providerId = ?',
  ),
  getAllModels: db.prepare<never[], Model>('SELECT * FROM provider_models'),
  getModelsByProviderId: db.prepare<string, Model>(
    'SELECT * FROM provider_models WHERE provider = ?',
  ),
  getModel: db.prepare<[string, string], Model>(
    'SELECT * FROM provider_models WHERE provider = ? AND id = ?',
  ),
  deleteModelsByProviderId: db.prepare<string>('DELETE FROM provider_models WHERE provider = ?'),
  upsertModel: db.prepare<[string, string, string, string, string], never>(
    'INSERT OR REPLACE INTO provider_models (id, provider, object, owned_by, type) VALUES (?, ?, ?, ?, ?)',
  ),
  getApiKey: db.prepare<string, string>(
    'SELECT apiKey FROM provider_settings WHERE providerId = ?',
  ),
  getUrl: db.prepare<string, string>('SELECT url FROM provider_settings WHERE providerId = ?'),
  setApiKey: db.prepare<[string, string | null], never>(
    'INSERT INTO provider_settings (providerId, apiKey) VALUES (?, ?) ON CONFLICT(providerId) DO UPDATE SET apiKey=excluded.apiKey',
  ),
  setUrl: db.prepare<[string, string | null], never>(
    'INSERT INTO provider_settings (providerId, url) VALUES (?, ?) ON CONFLICT(providerId) DO UPDATE SET url=excluded.url',
  ),
}

export class ProviderManagerService extends IpcService {
  static readonly groupName = 'providerManager'

  @IpcMethod()
  ipcGetAllProviders(): Provider[] {
    return this.getAllProviders()
  }
  getAllProviders(): Provider[] {
    const settings = statements.getAllSettings.all()
    const settingsMap = new Map(settings.map((s) => [s.providerId, s]))

    return providers.map((defaultProvider) => {
      const setting = settingsMap.get(defaultProvider.id)
      return {
        ...defaultProvider,
        apiKey: setting?.apiKey || defaultProvider.apiKey,
        url: setting?.url || defaultProvider.url,
      }
    })
  }

  @IpcMethod()
  ipcGetProvider(context: IpcContext, providerId: string): Provider | undefined {
    return this.getProvider(providerId)
  }
  getProvider(providerId: string): Provider | undefined {
    const defaultProvider = providers.find((provider) => provider.id === providerId)

    if (defaultProvider) {
      const setting = statements.getSettingByProviderId.get(providerId)

      return {
        ...defaultProvider,
        apiKey: setting?.apiKey || defaultProvider.apiKey,
        url: setting?.url || defaultProvider.url,
      }
    }

    return undefined
  }

  @IpcMethod()
  ipcGetModelsByProviderId(context: IpcContext, providerId: string): Model[] {
    return this.getModelsByProviderId(providerId)
  }
  getModelsByProviderId(providerId: string): Model[] {
    return statements.getModelsByProviderId.all(providerId)
  }

  @IpcMethod()
  ipcGetModel(
    context: IpcContext,
    providerId: string,
    modelId: string,
  ): Model | undefined {
    return this.getModel(providerId, modelId)
  }
  getModel(providerId: string, modelId: string): Model | undefined {
    return statements.getModel.get(providerId, modelId)
  }

  @IpcMethod()
  ipcSetModelsByProviderId(context: IpcContext, providerId: string, models: Model[]) {
    return this.setModelsByProviderId(providerId, models)
  }
  setModelsByProviderId(providerId: string, models: Model[]) {
    const transaction = db.transaction(() => {
      statements.deleteModelsByProviderId.run(providerId)

      for (const model of models) {
        statements.upsertModel.run(model.id, model.provider, model.object, model.owned_by, model.type)
      }
    })

    transaction()
  }

  @IpcMethod()
  ipcUpdateModel(
    context: IpcContext,
    providerId: string,
    modelId: string,
    model: Partial<Model>,
  ) {
    return this.updateModel(providerId, modelId, model)
  }
  updateModel(providerId: string, modelId: string, model: Partial<Model>) {
    const existingModel = this.getModel(providerId, modelId)
    if (!existingModel) {
      return
    }

    const updatedModel: Model = {
      ...existingModel,
      ...model,
    }

    statements.upsertModel.run(
      updatedModel.id,
      updatedModel.provider,
      updatedModel.object,
      updatedModel.owned_by,
      updatedModel.type,
    )
  }

  @IpcMethod()
  ipcGetAllModels(): Model[] {
    return this.getAllModels()
  }
  getAllModels(): Model[] {
    return statements.getAllModels.all()
  }

  @IpcMethod()
  ipcSetApiKey(context: IpcContext, providerId: string, apiKey: string) {
    return this.setApiKey(providerId, apiKey)
  }
  setApiKey(providerId: string, apiKey: string) {
    const defaultValue = this.getDefaultValue(providerId, 'apiKey') as string
    const finalValue = !apiKey || !apiKey.trim() || apiKey === defaultValue ? null : apiKey
    statements.setApiKey.run(providerId, finalValue)
  }

  @IpcMethod()
  ipcSetUrl(context: IpcContext, providerId: string, url: string) {
    return this.setUrl(providerId, url)
  }
  setUrl(providerId: string, url: string) {
    const defaultValue = this.getDefaultValue(providerId, 'url') as string
    const finalValue = !url || !url.trim() || url === defaultValue ? null : url
    statements.setUrl.run(providerId, finalValue)
  }

  private getDefaultValue(providerId: string, field: keyof Provider) {
    const provider = providers.find((provider) => provider.id === providerId)

    if (!provider) {
      return ''
    }

    return provider[field] || ''
  }
}
