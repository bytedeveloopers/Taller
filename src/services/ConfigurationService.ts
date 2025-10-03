import {
  AgendaConfig,
  BackupConfig,
  ConfigurationResponse,
  DEFAULT_ROLES,
  DocumentTemplate,
  EvidenceConfig,
  IntegrationConfig,
  NotificationConfig,
  Permission,
  Role,
  RoleWithPermissions,
  Setting,
  SettingInput,
  STANDARD_PERMISSIONS,
  TermsVersion,
  UIPreferences,
  UserRole,
  UserWithRoles,
  WaitCause,
  WorkflowConfig,
  WorkshopConfig,
} from "@/types/configuration";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ConfigurationService {
  // ====== SETTINGS MANAGEMENT ======

  async getSetting(namespace: string, key: string): Promise<Setting | null> {
    return await prisma.setting.findUnique({
      where: { namespace_key: { namespace, key } },
    });
  }

  async getSettings(namespace?: string): Promise<Setting[]> {
    return await prisma.setting.findMany({
      where: namespace ? { namespace } : undefined,
      orderBy: [{ namespace: "asc" }, { key: "asc" }],
    });
  }

  async setSetting(input: SettingInput): Promise<Setting> {
    return await prisma.setting.upsert({
      where: { namespace_key: { namespace: input.namespace, key: input.key } },
      update: {
        value: input.value,
        description: input.description,
        type: input.type || "string",
        updatedAt: new Date(),
      },
      create: {
        namespace: input.namespace,
        key: input.key,
        value: input.value,
        description: input.description,
        type: input.type || "string",
        isSystem: false,
      },
    });
  }

  async deleteSetting(namespace: string, key: string): Promise<void> {
    await prisma.setting.delete({
      where: { namespace_key: { namespace, key } },
    });
  }

  async getConfigurationByNamespace(namespace: string): Promise<any> {
    const settings = await this.getSettings(namespace);
    const config: any = {};

    settings.forEach((setting) => {
      let value = setting.value;

      // Parse value based on type
      if (setting.type === "json" && typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.warn(`Failed to parse JSON for ${namespace}.${setting.key}:`, e);
        }
      } else if (setting.type === "boolean") {
        value = value === "true" || value === true;
      } else if (setting.type === "number") {
        value = Number(value);
      }

      config[setting.key] = value;
    });

    return Object.keys(config).length > 0 ? config : null;
  }

  // ====== RBAC MANAGEMENT ======

  async getRoles(includeInactive = false): Promise<Role[]> {
    return await prisma.role.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async getRole(id: string): Promise<RoleWithPermissions | null> {
    return (await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    })) as RoleWithPermissions | null;
  }

  async createRole(data: {
    name: string;
    displayName: string;
    description?: string;
    permissionIds?: string[];
  }): Promise<Role> {
    const role = await prisma.role.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        isSystem: false,
      },
    });

    if (data.permissionIds && data.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: data.permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
          granted: true,
        })),
      });
    }

    return role;
  }

  async updateRole(
    id: string,
    data: {
      displayName?: string;
      description?: string;
      isActive?: boolean;
      permissionIds?: string[];
    }
  ): Promise<Role> {
    const role = await prisma.role.update({
      where: { id },
      data: {
        displayName: data.displayName,
        description: data.description,
        isActive: data.isActive,
      },
    });

    if (data.permissionIds !== undefined) {
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (data.permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
            granted: true,
          })),
        });
      }
    }

    return role;
  }

  async getPermissions(): Promise<Permission[]> {
    return await prisma.permission.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return await prisma.userRole.findMany({
      where: { userId, isActive: true },
      include: { role: true },
    });
  }

  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<UserRole> {
    return await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {
        isActive: true,
        assignedBy,
        updatedAt: new Date(),
      },
      create: {
        userId,
        roleId,
        assignedBy,
        isActive: true,
      },
    });
  }

  async revokeRole(userId: string, roleId: string): Promise<void> {
    await prisma.userRole.updateMany({
      where: { userId, roleId },
      data: { isActive: false },
    });
  }

  async getUsersWithRoles(): Promise<UserWithRoles[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        userRoles: {
          where: { isActive: true },
          include: { role: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return users as UserWithRoles[];
  }

  // ====== TERMS AND TEMPLATES ======

  async getTermsVersions(type?: string): Promise<TermsVersion[]> {
    return await prisma.termsVersion.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: "asc" }, { createdAt: "desc" }],
    });
  }

  async getActiveTerms(type: string): Promise<TermsVersion | null> {
    return await prisma.termsVersion.findFirst({
      where: { type, isActive: true },
    });
  }

  async createTermsVersion(data: {
    type: string;
    version: string;
    title: string;
    content: string;
    publishedBy: string;
    makeActive?: boolean;
  }): Promise<TermsVersion> {
    if (data.makeActive) {
      // Deactivate current active version
      await prisma.termsVersion.updateMany({
        where: { type: data.type, isActive: true },
        data: { isActive: false },
      });
    }

    return await prisma.termsVersion.create({
      data: {
        type: data.type,
        version: data.version,
        title: data.title,
        content: data.content,
        publishedBy: data.publishedBy,
        isActive: data.makeActive || false,
        publishedAt: data.makeActive ? new Date() : null,
      },
    });
  }

  async getDocumentTemplates(type?: string): Promise<DocumentTemplate[]> {
    return await prisma.documentTemplate.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  async createDocumentTemplate(data: {
    type: string;
    name: string;
    content: string;
    variables?: any;
    createdBy: string;
  }): Promise<DocumentTemplate> {
    return await prisma.documentTemplate.create({
      data: {
        type: data.type,
        name: data.name,
        content: data.content,
        variables: data.variables,
        createdBy: data.createdBy,
        isSystem: false,
      },
    });
  }

  async updateDocumentTemplate(
    id: string,
    data: {
      name?: string;
      content?: string;
      variables?: any;
      isActive?: boolean;
    }
  ): Promise<DocumentTemplate> {
    return await prisma.documentTemplate.update({
      where: { id },
      data,
    });
  }

  // ====== WAIT CAUSES ======

  async getWaitCauses(): Promise<WaitCause[]> {
    return await prisma.waitCause.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  async createWaitCause(data: {
    name: string;
    description?: string;
    color?: string;
    sortOrder?: number;
  }): Promise<WaitCause> {
    return await prisma.waitCause.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "#6b7280",
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async updateWaitCause(
    id: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ): Promise<WaitCause> {
    return await prisma.waitCause.update({
      where: { id },
      data,
    });
  }

  // ====== CONFIGURATION AGGREGATION ======

  async getFullConfiguration(): Promise<ConfigurationResponse> {
    const settings = await this.getSettings();

    return {
      workshop: this.extractWorkshopConfig(settings),
      workflow: this.extractWorkflowConfig(settings),
      notifications: this.extractNotificationConfig(settings),
      agenda: this.extractAgendaConfig(settings),
      evidence: this.extractEvidenceConfig(settings),
      ui: this.extractUIConfig(settings),
      integrations: this.extractIntegrationConfig(settings),
      backup: this.extractBackupConfig(settings),
    };
  }

  private extractWorkshopConfig(settings: Setting[]): WorkshopConfig {
    const workshop = settings.filter((s) => s.namespace === "workshop");
    const branding = settings.filter((s) => s.namespace === "branding");

    return {
      name: this.findSettingValue(workshop, "name", "Mi Taller"),
      logo: this.findSettingValue(branding, "logo_url"),
      primaryColor: this.findSettingValue(branding, "primary_color", "#3b82f6"),
      secondaryColor: this.findSettingValue(branding, "secondary_color", "#64748b"),
      phone: this.findSettingValue(workshop, "phone", ""),
      altPhone: this.findSettingValue(workshop, "alt_phone"),
      email: this.findSettingValue(workshop, "email", ""),
      address: this.findSettingValue(workshop, "address", ""),
      hours: this.findSettingValue(workshop, "hours", "L-V 8:00-18:00"),
      website: this.findSettingValue(workshop, "website"),
      socialMedia: this.findSettingValue(workshop, "social_media", {}),
      landingLogo: this.findSettingValue(branding, "landing_logo_url"),
      landingMessage: this.findSettingValue(
        branding,
        "landing_message",
        "Bienvenido a nuestro taller"
      ),
      landingColors: {
        primary: this.findSettingValue(branding, "landing_primary_color", "#3b82f6"),
        secondary: this.findSettingValue(branding, "landing_secondary_color", "#64748b"),
      },
    };
  }

  private extractWorkflowConfig(settings: Setting[]): WorkflowConfig {
    const workflow = settings.filter((s) => s.namespace === "workflow");
    const sla = settings.filter((s) => s.namespace === "sla");

    return {
      stages: this.findSettingValue(workflow, "stages", this.getDefaultWorkflowStages()),
      rules: {
        blockDisassemblyWithoutApprovedQuote: this.findSettingValue(
          workflow,
          "block_disassembly_without_quote",
          false
        ),
        autoTransitions: this.findSettingValue(workflow, "auto_transitions", false),
        requirePhotosForInspection: this.findSettingValue(
          workflow,
          "require_photos_inspection",
          true
        ),
      },
    };
  }

  private extractNotificationConfig(settings: Setting[]): NotificationConfig {
    const notifications = settings.filter((s) => s.namespace === "notifications");

    return {
      globalEnabled: this.findSettingValue(notifications, "global_enabled", true),
      types: this.findSettingValue(notifications, "types", {}),
      deduplication: {
        enabled: this.findSettingValue(notifications, "deduplication_enabled", true),
        windowMinutes: this.findSettingValue(notifications, "deduplication_window", 15),
      },
      defaultIntensity: this.findSettingValue(notifications, "default_intensity", "NORMAL"),
    };
  }

  private extractAgendaConfig(settings: Setting[]): AgendaConfig {
    const agenda = settings.filter((s) => s.namespace === "agenda");

    return {
      eventTypes: this.findSettingValue(agenda, "event_types", this.getDefaultEventTypes()),
      defaults: {
        duration: this.findSettingValue(agenda, "default_duration", 60),
        reminders: {
          reminder24h: this.findSettingValue(agenda, "default_reminder_24h", true),
          reminder1h: this.findSettingValue(agenda, "default_reminder_1h", true),
          reminder15m: this.findSettingValue(agenda, "default_reminder_15m", false),
        },
      },
      workingHours: {
        start: this.findSettingValue(agenda, "working_hours_start", "08:00"),
        end: this.findSettingValue(agenda, "working_hours_end", "18:00"),
        workingDays: this.findSettingValue(agenda, "working_days", [1, 2, 3, 4, 5]),
      },
    };
  }

  private extractEvidenceConfig(settings: Setting[]): EvidenceConfig {
    const evidence = settings.filter((s) => s.namespace === "evidence");

    return {
      minPhotosPerStage: this.findSettingValue(evidence, "min_photos_per_stage", {
        recepcion: 3,
        diagnostico: 2,
      }),
      fileSize: {
        maxSizeMB: this.findSettingValue(evidence, "max_file_size_mb", 10),
        allowedTypes: this.findSettingValue(evidence, "allowed_types", [
          "jpg",
          "jpeg",
          "png",
          "mp4",
        ]),
      },
      retention: {
        deletePermanentlyAfterDays: this.findSettingValue(evidence, "delete_after_days", 90),
        moveToTrashAfterDays: this.findSettingValue(evidence, "trash_after_days", 30),
      },
      storage: {
        provider: this.findSettingValue(evidence, "storage_provider", "local"),
        path: this.findSettingValue(evidence, "storage_path", "/uploads"),
      },
    };
  }

  private extractUIConfig(settings: Setting[]): UIPreferences {
    const ui = settings.filter((s) => s.namespace === "ui");

    return {
      defaultPage: this.findSettingValue(ui, "default_page", "dashboard"),
      density: this.findSettingValue(ui, "density", "normal"),
      language: this.findSettingValue(ui, "language", "es"),
      currency: this.findSettingValue(ui, "currency", "GTQ"),
      timezone: this.findSettingValue(ui, "timezone", "America/Guatemala"),
      visibleColumns: {
        clients: this.findSettingValue(ui, "visible_columns_clients", [
          "name",
          "phone",
          "email",
          "lastVisit",
        ]),
        vehicles: this.findSettingValue(ui, "visible_columns_vehicles", [
          "trackingCode",
          "brand",
          "model",
          "licensePlate",
          "status",
        ]),
        workOrders: this.findSettingValue(ui, "visible_columns_work_orders", [
          "trackingCode",
          "customer",
          "status",
          "priority",
          "technician",
        ]),
        quotes: this.findSettingValue(ui, "visible_columns_quotes", [
          "quoteNumber",
          "customer",
          "total",
          "status",
          "validUntil",
        ]),
      },
    };
  }

  private extractIntegrationConfig(settings: Setting[]): IntegrationConfig {
    const integrations = settings.filter((s) => s.namespace === "integrations");
    const features = settings.filter((s) => s.namespace === "features");

    return {
      features: {
        whatsapp: this.findSettingValue(features, "whatsapp", false),
        push: this.findSettingValue(features, "push", false),
        email: this.findSettingValue(features, "email", false),
      },
      whatsapp: {
        apiKey: this.findSettingValue(integrations, "whatsapp_api_key"),
        phoneNumber: this.findSettingValue(integrations, "whatsapp_phone"),
        templates: this.findSettingValue(integrations, "whatsapp_templates", {}),
      },
      push: {
        vapidKey: this.findSettingValue(integrations, "push_vapid_key"),
        serviceAccount: this.findSettingValue(integrations, "push_service_account"),
      },
    };
  }

  private extractBackupConfig(settings: Setting[]): BackupConfig {
    const backup = settings.filter((s) => s.namespace === "backup");

    return {
      automated: {
        enabled: this.findSettingValue(backup, "auto_enabled", false),
        frequency: this.findSettingValue(backup, "auto_frequency", "daily"),
        time: this.findSettingValue(backup, "auto_time", "02:00"),
        retention: this.findSettingValue(backup, "auto_retention_days", 30),
      },
      manual: {
        lastBackup: this.findSettingValue(backup, "last_backup"),
        nextScheduled: this.findSettingValue(backup, "next_scheduled"),
      },
      storage: {
        location: this.findSettingValue(backup, "storage_location", "/backups"),
        maxSizeGB: this.findSettingValue(backup, "max_size_gb", 5),
      },
      auditLogRetention: this.findSettingValue(backup, "audit_retention_days", 365),
    };
  }

  private findSettingValue(settings: Setting[], key: string, defaultValue?: any): any {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : defaultValue;
  }

  private getDefaultWorkflowStages() {
    return [
      {
        id: "recepcion",
        name: "RECEPCION",
        displayName: "Recepción",
        order: 1,
        slaHours: 2,
        warningThresholdHours: 1,
        criticalThresholdHours: 2,
        color: "#3b82f6",
        isActive: true,
        allowedTransitions: ["ingreso"],
      },
      {
        id: "ingreso",
        name: "INGRESO",
        displayName: "Ingreso",
        order: 2,
        slaHours: 4,
        warningThresholdHours: 3,
        criticalThresholdHours: 4,
        color: "#8b5cf6",
        isActive: true,
        allowedTransitions: ["diagnostico"],
      },
      {
        id: "diagnostico",
        name: "DIAGNOSTICO",
        displayName: "Diagnóstico",
        order: 3,
        slaHours: 8,
        warningThresholdHours: 6,
        criticalThresholdHours: 8,
        color: "#06b6d4",
        isActive: true,
        allowedTransitions: ["desarme", "espera"],
      },
      {
        id: "desarme",
        name: "PROCESO_DESARME",
        displayName: "Desarme",
        order: 4,
        slaHours: 12,
        warningThresholdHours: 10,
        criticalThresholdHours: 12,
        color: "#f59e0b",
        isActive: true,
        allowedTransitions: ["armado", "espera"],
      },
      {
        id: "espera",
        name: "ESPERA",
        displayName: "Espera",
        order: 5,
        slaHours: 0,
        warningThresholdHours: 0,
        criticalThresholdHours: 0,
        color: "#6b7280",
        isActive: true,
        allowedTransitions: ["desarme", "armado"],
      },
      {
        id: "armado",
        name: "PROCESO_ARMADO",
        displayName: "Armado",
        order: 6,
        slaHours: 16,
        warningThresholdHours: 14,
        criticalThresholdHours: 16,
        color: "#10b981",
        isActive: true,
        allowedTransitions: ["prueba"],
      },
      {
        id: "prueba",
        name: "PRUEBA_CALIDAD",
        displayName: "Prueba",
        order: 7,
        slaHours: 2,
        warningThresholdHours: 1,
        criticalThresholdHours: 2,
        color: "#22c55e",
        isActive: true,
        allowedTransitions: ["finalizado"],
      },
      {
        id: "finalizado",
        name: "COMPLETED",
        displayName: "Finalizado",
        order: 8,
        slaHours: 4,
        warningThresholdHours: 3,
        criticalThresholdHours: 4,
        color: "#16a34a",
        isActive: true,
        allowedTransitions: ["entrega"],
      },
      {
        id: "entrega",
        name: "DELIVERED",
        displayName: "Entregado",
        order: 9,
        slaHours: 0,
        warningThresholdHours: 0,
        criticalThresholdHours: 0,
        color: "#15803d",
        isActive: true,
        allowedTransitions: [],
      },
    ];
  }

  private getDefaultEventTypes() {
    return [
      {
        type: "CITA",
        displayName: "Cita",
        defaultDuration: 60,
        color: "#3b82f6",
        requiresVehicle: true,
        requiresCustomer: true,
        isActive: true,
      },
      {
        type: "RECOGIDA",
        displayName: "Recogida",
        defaultDuration: 30,
        color: "#f59e0b",
        requiresVehicle: true,
        requiresCustomer: true,
        isActive: true,
      },
      {
        type: "ENTREGA",
        displayName: "Entrega",
        defaultDuration: 30,
        color: "#10b981",
        requiresVehicle: true,
        requiresCustomer: true,
        isActive: true,
      },
      {
        type: "LLAMADA",
        displayName: "Llamada",
        defaultDuration: 15,
        color: "#8b5cf6",
        requiresVehicle: false,
        requiresCustomer: true,
        isActive: true,
      },
      {
        type: "MANTENIMIENTO",
        displayName: "Mantenimiento",
        defaultDuration: 120,
        color: "#06b6d4",
        requiresVehicle: true,
        requiresCustomer: true,
        isActive: true,
      },
      {
        type: "PRUEBA_RUTA",
        displayName: "Prueba de Ruta",
        defaultDuration: 45,
        color: "#ef4444",
        requiresVehicle: true,
        requiresCustomer: false,
        isActive: true,
      },
      {
        type: "OTRO",
        displayName: "Otro",
        defaultDuration: 60,
        color: "#6b7280",
        requiresVehicle: false,
        requiresCustomer: false,
        isActive: true,
      },
    ];
  }

  // ====== INITIALIZATION ======

  async initializeDefaultSettings(): Promise<void> {
    // Initialize default permissions
    await this.initializePermissions();

    // Initialize default roles
    await this.initializeRoles();

    // Initialize default wait causes
    await this.initializeWaitCauses();

    // Initialize default settings
    await this.initializeDefaultConfigValues();
  }

  private async initializePermissions(): Promise<void> {
    for (const permissionKey of STANDARD_PERMISSIONS) {
      const [category, action] = permissionKey.split(".");
      await prisma.permission.upsert({
        where: { key: permissionKey },
        update: {},
        create: {
          key: permissionKey,
          displayName: `${action.charAt(0).toUpperCase() + action.slice(1)} ${category}`,
          description: `Permite ${action} en la sección de ${category}`,
          category,
          isSystem: true,
        },
      });
    }
  }

  private async initializeRoles(): Promise<void> {
    for (const roleData of DEFAULT_ROLES) {
      await prisma.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: roleData,
      });
    }
  }

  private async initializeWaitCauses(): Promise<void> {
    const defaultCauses = [
      {
        name: "Pieza",
        description: "Esperando repuestos o piezas",
        color: "#f59e0b",
        sortOrder: 1,
      },
      {
        name: "Cliente",
        description: "Esperando autorización del cliente",
        color: "#8b5cf6",
        sortOrder: 2,
      },
      {
        name: "Externo",
        description: "Dependencia externa (proveedor, especialista)",
        color: "#06b6d4",
        sortOrder: 3,
      },
      { name: "Otro", description: "Otra causa de espera", color: "#6b7280", sortOrder: 4 },
    ];

    for (const cause of defaultCauses) {
      await prisma.waitCause.upsert({
        where: { name: cause.name },
        update: {},
        create: cause,
      });
    }
  }

  private async initializeDefaultConfigValues(): Promise<void> {
    const defaults = [
      { namespace: "workshop", key: "name", value: "Mi Taller Automotriz" },
      { namespace: "workshop", key: "currency", value: "GTQ" },
      { namespace: "branding", key: "primary_color", value: "#3b82f6" },
      { namespace: "branding", key: "secondary_color", value: "#64748b" },
      { namespace: "features", key: "whatsapp", value: false },
      { namespace: "features", key: "push", value: false },
      { namespace: "features", key: "email", value: false },
    ];

    for (const setting of defaults) {
      await prisma.setting.upsert({
        where: { namespace_key: { namespace: setting.namespace, key: setting.key } },
        update: {},
        create: {
          namespace: setting.namespace,
          key: setting.key,
          value: setting.value,
          type: typeof setting.value === "boolean" ? "boolean" : "string",
          isSystem: true,
        },
      });
    }
  }
}

export const configurationService = new ConfigurationService();
