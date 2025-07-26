import { EventEmitter } from 'events'
import { 
  DomainPlugin, 
  PluginRegistryEntry, 
  PluginContext,
  PluginManagerEvents,
  Domain 
} from './types'

// 插件管理器类
export class PluginManager extends EventEmitter {
  private registry: Map<string, PluginRegistryEntry> = new Map()
  private context: PluginContext

  constructor(context: PluginContext) {
    super()
    this.context = context
  }

  // 安装插件
  async installPlugin(plugin: DomainPlugin): Promise<void> {
    this.emit('plugin:installing', plugin.id)
    
    try {
      // 检查插件是否已存在
      if (this.registry.has(plugin.id)) {
        throw new Error(`Plugin ${plugin.id} is already installed`)
      }

      // 检查依赖
      await this.checkDependencies(plugin)

      // 执行安装前钩子
      if (plugin.lifecycle?.beforeInstall) {
        await plugin.lifecycle.beforeInstall()
      }

      // 初始化插件
      await plugin.initialize()

      // 注册插件
      const entry: PluginRegistryEntry = {
        plugin,
        status: 'installed',
        installedAt: new Date()
      }
      
      this.registry.set(plugin.id, entry)

      // 执行安装后钩子
      if (plugin.lifecycle?.afterInstall) {
        await plugin.lifecycle.afterInstall()
      }

      this.emit('plugin:installed', plugin.id)
    } catch (error) {
      this.emit('plugin:error', plugin.id, error as Error)
      throw error
    }
  }

  // 启用插件
  async enablePlugin(pluginId: string): Promise<void> {
    this.emit('plugin:enabling', pluginId)
    
    try {
      const entry = this.registry.get(pluginId)
      if (!entry) {
        throw new Error(`Plugin ${pluginId} is not installed`)
      }

      if (entry.status === 'enabled') {
        throw new Error(`Plugin ${pluginId} is already enabled`)
      }

      // 执行启用前钩子
      if (entry.plugin.lifecycle?.beforeEnable) {
        await entry.plugin.lifecycle.beforeEnable()
      }

      // 更新状态
      entry.status = 'enabled'
      entry.enabledAt = new Date()

      // 注册组件、路由等
      await this.registerPluginAssets(entry.plugin)

      // 执行启用后钩子
      if (entry.plugin.lifecycle?.afterEnable) {
        await entry.plugin.lifecycle.afterEnable()
      }

      this.emit('plugin:enabled', pluginId)
    } catch (error) {
      const entry = this.registry.get(pluginId)
      if (entry) {
        entry.status = 'error'
        entry.errorMessage = (error as Error).message
      }
      this.emit('plugin:error', pluginId, error as Error)
      throw error
    }
  }

  // 禁用插件
  async disablePlugin(pluginId: string): Promise<void> {
    this.emit('plugin:disabling', pluginId)
    
    try {
      const entry = this.registry.get(pluginId)
      if (!entry) {
        throw new Error(`Plugin ${pluginId} is not installed`)
      }

      if (entry.status !== 'enabled') {
        throw new Error(`Plugin ${pluginId} is not enabled`)
      }

      // 执行禁用前钩子
      if (entry.plugin.lifecycle?.beforeDisable) {
        await entry.plugin.lifecycle.beforeDisable()
      }

      // 注销组件、路由等
      await this.unregisterPluginAssets(entry.plugin)

      // 更新状态
      entry.status = 'disabled'
      entry.disabledAt = new Date()

      // 执行禁用后钩子
      if (entry.plugin.lifecycle?.afterDisable) {
        await entry.plugin.lifecycle.afterDisable()
      }

      this.emit('plugin:disabled', pluginId)
    } catch (error) {
      this.emit('plugin:error', pluginId, error as Error)
      throw error
    }
  }

  // 卸载插件
  async uninstallPlugin(pluginId: string): Promise<void> {
    this.emit('plugin:uninstalling', pluginId)
    
    try {
      const entry = this.registry.get(pluginId)
      if (!entry) {
        throw new Error(`Plugin ${pluginId} is not installed`)
      }

      // 如果插件已启用，先禁用
      if (entry.status === 'enabled') {
        await this.disablePlugin(pluginId)
      }

      // 执行卸载前钩子
      if (entry.plugin.lifecycle?.beforeUninstall) {
        await entry.plugin.lifecycle.beforeUninstall()
      }

      // 清理插件
      await entry.plugin.cleanup()

      // 从注册表中移除
      this.registry.delete(pluginId)

      // 执行卸载后钩子
      if (entry.plugin.lifecycle?.afterUninstall) {
        await entry.plugin.lifecycle.afterUninstall()
      }

      this.emit('plugin:uninstalled', pluginId)
    } catch (error) {
      this.emit('plugin:error', pluginId, error as Error)
      throw error
    }
  }

  // 获取插件信息
  getPlugin(pluginId: string): DomainPlugin | null {
    const entry = this.registry.get(pluginId)
    return entry ? entry.plugin : null
  }

  // 获取所有插件
  getAllPlugins(): PluginRegistryEntry[] {
    return Array.from(this.registry.values())
  }

  // 获取已启用的插件
  getEnabledPlugins(): PluginRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      entry => entry.status === 'enabled'
    )
  }

  // 根据领域获取插件
  getPluginsByDomain(domain: Domain): PluginRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      entry => entry.plugin.domain === domain
    )
  }

  // 获取插件状态
  getPluginStatus(pluginId: string): string | null {
    const entry = this.registry.get(pluginId)
    return entry ? entry.status : null
  }

  // 检查插件是否存在
  hasPlugin(pluginId: string): boolean {
    return this.registry.has(pluginId)
  }

  // 检查插件是否已启用
  isPluginEnabled(pluginId: string): boolean {
    const entry = this.registry.get(pluginId)
    return entry ? entry.status === 'enabled' : false
  }

  // 获取插件组件
  getPluginComponent(pluginId: string, componentName: string): any | null {
    const entry = this.registry.get(pluginId)
    if (!entry || entry.status !== 'enabled') {
      return null
    }

    return entry.plugin.components?.[componentName]?.component || null
  }

  // 获取所有插件组件
  getAllPluginComponents(): Record<string, any> {
    const components: Record<string, any> = {}
    
    this.getEnabledPlugins().forEach(entry => {
      if (entry.plugin.components) {
        Object.entries(entry.plugin.components).forEach(([name, registration]) => {
          components[`${entry.plugin.id}.${name}`] = registration.component
        })
      }
    })

    return components
  }

  // 获取插件菜单
  getPluginMenus(): any[] {
    const menus: any[] = []
    
    this.getEnabledPlugins().forEach(entry => {
      if (entry.plugin.menus) {
        menus.push(...entry.plugin.menus)
      }
    })

    return menus.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  // 获取插件小部件
  getPluginWidgets(): any[] {
    const widgets: any[] = []
    
    this.getEnabledPlugins().forEach(entry => {
      if (entry.plugin.widgets) {
        widgets.push(...entry.plugin.widgets)
      }
    })

    return widgets
  }

  // 执行插件健康检查
  async healthCheck(pluginId?: string): Promise<Record<string, any>> {
    const results: Record<string, any> = {}

    const pluginsToCheck = pluginId 
      ? [this.registry.get(pluginId)].filter(Boolean) as PluginRegistryEntry[]
      : this.getEnabledPlugins()

    for (const entry of pluginsToCheck) {
      try {
        if (entry.plugin.healthCheck) {
          results[entry.plugin.id] = await entry.plugin.healthCheck()
        } else {
          results[entry.plugin.id] = {
            status: 'healthy',
            message: 'No health check implemented'
          }
        }
      } catch (error) {
        results[entry.plugin.id] = {
          status: 'unhealthy',
          message: (error as Error).message
        }
      }
    }

    return results
  }

  // 私有方法：检查依赖
  private async checkDependencies(plugin: DomainPlugin): Promise<void> {
    if (!plugin.dependencies) return

    for (const dep of plugin.dependencies) {
      const depEntry = this.registry.get(dep.id)
      
      if (!depEntry && !dep.optional) {
        throw new Error(`Required dependency ${dep.id} is not installed`)
      }

      if (depEntry && !this.isVersionCompatible(depEntry.plugin.version, dep.version)) {
        throw new Error(
          `Dependency ${dep.id} version ${depEntry.plugin.version} is not compatible with required ${dep.version}`
        )
      }
    }
  }

  // 私有方法：版本兼容性检查
  private isVersionCompatible(installed: string, required: string): boolean {
    // 简单的版本检查，可以使用 semver 库进行更复杂的检查
    return installed >= required
  }

  // 私有方法：注册插件资源
  private async registerPluginAssets(plugin: DomainPlugin): Promise<void> {
    // 这里可以注册路由、组件、服务等
    // 具体实现取决于应用框架
    console.log(`Registering assets for plugin ${plugin.id}`)
  }

  // 私有方法：注销插件资源
  private async unregisterPluginAssets(plugin: DomainPlugin): Promise<void> {
    // 这里可以注销路由、组件、服务等
    console.log(`Unregistering assets for plugin ${plugin.id}`)
  }

  // 设置插件配置
  async setPluginConfig(pluginId: string, config: any): Promise<void> {
    const entry = this.registry.get(pluginId)
    if (!entry) {
      throw new Error(`Plugin ${pluginId} is not installed`)
    }

    entry.config = { ...entry.config, ...config }
    
    if (entry.plugin.setConfig) {
      entry.plugin.setConfig(config)
    }
  }

  // 获取插件配置
  getPluginConfig(pluginId: string): any | null {
    const entry = this.registry.get(pluginId)
    return entry ? entry.config : null
  }

  // 重新加载插件
  async reloadPlugin(pluginId: string): Promise<void> {
    await this.disablePlugin(pluginId)
    await this.enablePlugin(pluginId)
  }

  // 获取插件统计信息
  getStatistics(): {
    total: number
    enabled: number
    disabled: number
    error: number
    byDomain: Record<Domain, number>
  } {
    const entries = Array.from(this.registry.values())
    
    return {
      total: entries.length,
      enabled: entries.filter(e => e.status === 'enabled').length,
      disabled: entries.filter(e => e.status === 'disabled').length,
      error: entries.filter(e => e.status === 'error').length,
      byDomain: entries.reduce((acc, entry) => {
        acc[entry.plugin.domain] = (acc[entry.plugin.domain] || 0) + 1
        return acc
      }, {} as Record<Domain, number>)
    }
  }
} 