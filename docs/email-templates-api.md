# Email Template Adatbázis API Dokumentáció

## Áttekintés

Az email template rendszer adatbázis-alapú megoldása lehetővé teszi a template-ek dinamikus kezelését, miközben megőrzi a teljesítményt és kompatibilitást.

## Főbb Komponensek

### DatabaseTemplateRepository

Az adatbázis műveletek központi kezelője.

```typescript
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';

const repository = new DatabaseTemplateRepository(db);
```

#### Metódusok

##### getTemplateByType(type: EmailTemplateType)

Template lekérdezése típus alapján.

```typescript
const template = await repository.getTemplateByType('email-verification');
if (template) {
  console.log('Template found:', template.name);
}
```

**Paraméterek:**

- `type`: EmailTemplateType - A keresett template típusa

**Visszatérési érték:**

- `Promise<DatabaseEmailTemplate | null>` - A template vagy null, ha nem található

**Hibák:**

- `DatabaseTemplateError.TEMPLATE_NOT_FOUND` - Template nem található
- `DatabaseTemplateError.DATABASE_CONNECTION_ERROR` - Adatbázis kapcsolat hiba

##### getAllActiveTemplates()

Összes aktív template lekérdezése.

```typescript
const templates = await repository.getAllActiveTemplates();
console.log(`Found ${templates.length} active templates`);
```

**Visszatérési érték:**

- `Promise<DatabaseEmailTemplate[]>` - Aktív template-ek listája

##### createTemplate(data: CreateTemplateData)

Új template létrehozása.

```typescript
const newTemplate = await repository.createTemplate({
  type: 'custom-notification',
  name: 'Egyedi Értesítés',
  subjectTemplate: 'Új üzenet: {{title}}',
  htmlTemplate: '<h1>{{title}}</h1><p>{{message}}</p>',
  textTemplate: '{{title}}\n\n{{message}}',
  requiredData: ['title', 'message'],
  optionalData: ['sender']
});
```

**Paraméterek:**

- `data`: CreateTemplateData - Template adatok

**Visszatérési érték:**

- `Promise<DatabaseEmailTemplate>` - A létrehozott template

##### updateTemplate(id: string, updates: UpdateTemplateData)

Meglévő template frissítése.

```typescript
const updated = await repository.updateTemplate(templateId, {
  name: 'Frissített Név',
  isActive: false
});
```

**Paraméterek:**

- `id`: string - Template azonosító
- `updates`: UpdateTemplateData - Frissítendő mezők

**Visszatérési érték:**

- `Promise<DatabaseEmailTemplate>` - A frissített template

##### deactivateTemplate(id: string)

Template deaktiválása.

```typescript
await repository.deactivateTemplate(templateId);
```

**Paraméterek:**

- `id`: string - Template azonosító

**Visszatérési érték:**

- `Promise<void>`

### TemplateCache

Teljesítmény optimalizálásért felelős cache réteg.

```typescript
import { TemplateCache } from '$lib/server/database/repositories';

const cache = new TemplateCache();
```

#### Metódusok

##### get(key: string)

Cache bejegyzés lekérdezése.

```typescript
const template = await cache.get('template:type:email-verification');
```

##### set(key: string, template: DatabaseEmailTemplate, ttl?: number)

Cache bejegyzés beállítása.

```typescript
await cache.set('template:type:custom', template, 3600); // 1 óra TTL
```

##### invalidateCache(type?: EmailTemplateType)

Cache érvénytelenítése.

```typescript
// Specifikus típus cache törlése
await repository.invalidateCache('email-verification');

// Teljes cache törlése
await repository.invalidateCache();
```

### TemplateMigrationService

Built-in template-ek adatbázisba migrálásáért felelős.

```typescript
import { TemplateMigrationService } from '$lib/server/database/repositories';

const migrationService = new TemplateMigrationService(db);
```

#### Metódusok

##### migrateBuiltInTemplates()

Built-in template-ek migrálása.

```typescript
const result = await migrationService.migrateBuiltInTemplates();
console.log(`Migrated ${result.migratedCount} templates`);
```

**Visszatérési érték:**

- `Promise<MigrationResult>` - Migráció eredménye

##### validateMigration()

Migráció validálása.

```typescript
const validation = await migrationService.validateMigration();
if (!validation.isValid) {
  console.error('Migration validation failed:', validation.errors);
}
```

##### rollbackMigration()

Migráció visszaállítása.

```typescript
await migrationService.rollbackMigration();
```

## Típusok

### DatabaseEmailTemplate

```typescript
interface DatabaseEmailTemplate {
  id: string;
  type: string;
  name: string;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string;
  requiredData: string[];
  optionalData: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### CreateTemplateData

```typescript
interface CreateTemplateData {
  type: EmailTemplateType;
  name: string;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string;
  requiredData: string[];
  optionalData: string[];
}
```

### UpdateTemplateData

```typescript
interface UpdateTemplateData {
  name?: string;
  subjectTemplate?: string;
  htmlTemplate?: string;
  textTemplate?: string;
  requiredData?: string[];
  optionalData?: string[];
  isActive?: boolean;
}
```

## Hibakezelés

### DatabaseTemplateError

```typescript
enum DatabaseTemplateError {
  TEMPLATE_NOT_FOUND = 'template_not_found',
  TEMPLATE_VALIDATION_FAILED = 'template_validation_failed',
  DATABASE_CONNECTION_ERROR = 'database_connection_error',
  CACHE_ERROR = 'cache_error',
  MIGRATION_ERROR = 'migration_error'
}
```

### Hibakezelési Példák

```typescript
try {
  const template = await repository.getTemplateByType('non-existent');
} catch (error) {
  if (error.code === DatabaseTemplateError.TEMPLATE_NOT_FOUND) {
    console.log('Template not found, using fallback');
  }
}
```

## Teljesítmény Optimalizálás

### Cache Kulcsok

```typescript
const CACHE_KEYS = {
  TEMPLATE_BY_TYPE: (type: EmailTemplateType) => `template:type:${type}`,
  ALL_ACTIVE_TEMPLATES: 'templates:active:all',
  TEMPLATE_BY_ID: (id: string) => `template:id:${id}`
};
```

### Batch Műveletek

```typescript
// Több template egyszerre lekérdezése
const templates = await repository.getTemplatesByTypes([
  'email-verification',
  'password-reset',
  'welcome-email'
]);
```

### Cache Warm-up

```typescript
// Cache előmelegítése
await repository.warmUpCache();
```

## Monitoring és Metrikák

### Teljesítmény Monitoring

```typescript
import { PerformanceMonitor } from '$lib/server/database/repositories';

const monitor = new PerformanceMonitor();

// Metrikák lekérdezése
const metrics = await monitor.getMetrics();
console.log('Cache hit rate:', metrics.cacheHitRate);
console.log('Average query time:', metrics.averageQueryTime);
```

### Audit Logging

```typescript
import { TemplateAuditLogger } from '$lib/server/database/repositories';

const auditLogger = new TemplateAuditLogger();

// Audit log bejegyzés
await auditLogger.logTemplateAccess(templateId, userId, 'read');
```

## Biztonsági Megfontolások

### Template Validáció

```typescript
import { TemplateSecurityValidator } from '$lib/server/database/repositories';

const validator = new TemplateSecurityValidator();

// Template biztonságos-e?
const isSecure = await validator.validateTemplate(templateData);
if (!isSecure.valid) {
  console.error('Security validation failed:', isSecure.errors);
}
```

### Rate Limiting

```typescript
import { TemplateRateLimiter } from '$lib/server/database/repositories';

const rateLimiter = new TemplateRateLimiter();

// Rate limit ellenőrzés
const allowed = await rateLimiter.checkLimit(userId, 'template_access');
if (!allowed) {
  throw new Error('Rate limit exceeded');
}
```

## Példa Használat

### Teljes Email Küldési Folyamat

```typescript
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';
import { TemplateEngine } from '$lib/server/email/templates';

async function sendEmail(type: EmailTemplateType, data: any, recipient: string) {
  const repository = new DatabaseTemplateRepository(db);
  const engine = new TemplateEngine();

  try {
    // Template lekérdezése
    const template = await repository.getTemplateByType(type);
    if (!template) {
      throw new Error(`Template not found: ${type}`);
    }

    // Template renderelése
    const rendered = await engine.render(template, data);

    // Email küldése
    await emailService.send({
      to: recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
```

### Template Kezelés

```typescript
async function manageTemplates() {
  const repository = new DatabaseTemplateRepository(db);

  // Új template létrehozása
  const newTemplate = await repository.createTemplate({
    type: 'newsletter',
    name: 'Hírlevél Template',
    subjectTemplate: 'Hírlevél - {{date}}',
    htmlTemplate: '<h1>{{title}}</h1><div>{{content}}</div>',
    textTemplate: '{{title}}\n\n{{content}}',
    requiredData: ['title', 'content', 'date'],
    optionalData: ['author']
  });

  // Template frissítése
  await repository.updateTemplate(newTemplate.id, {
    name: 'Frissített Hírlevél Template'
  });

  // Összes aktív template listázása
  const activeTemplates = await repository.getAllActiveTemplates();
  console.log('Active templates:', activeTemplates.length);
}
```
