# Email Template Adatbázis Integráció - Tervezés

## Áttekintés

Az email template rendszer átdolgozása adatbázis-alapú megoldásra, amely lehetővé teszi a template-ek dinamikus kezelését, miközben megőrzi a jelenlegi API kompatibilitást és teljesítményt.

## Architektúra

### Jelenlegi Architektúra

```
TemplateRegistry -> TemplateEngine -> Built-in Templates (kódban)
```

### Új Architektúra

```
TemplateRegistry -> DatabaseTemplateRepository -> PostgreSQL (email_templates tábla)
                 -> TemplateCache (Redis-szerű cache)
                 -> TemplateEngine (renderelés)
```

### Főbb Komponensek

1. **DatabaseTemplateRepository**: Adatbázis műveletek kezelése
2. **TemplateCache**: Teljesítmény optimalizálás
3. **TemplateMigrationService**: Built-in template-ek migrálása
4. **TemplateValidator**: Template validáció és integritás ellenőrzés

## Komponensek és Interfészek

### DatabaseTemplateRepository

```typescript
interface DatabaseTemplateRepository {
  // Template lekérdezés
  getTemplateByType(type: EmailTemplateType): Promise<DatabaseEmailTemplate | null>;
  getAllActiveTemplates(): Promise<DatabaseEmailTemplate[]>;

  // Template kezelés
  createTemplate(template: CreateTemplateData): Promise<DatabaseEmailTemplate>;
  updateTemplate(id: string, updates: UpdateTemplateData): Promise<DatabaseEmailTemplate>;
  deactivateTemplate(id: string): Promise<void>;

  // Cache kezelés
  invalidateCache(type?: EmailTemplateType): Promise<void>;
  refreshCache(): Promise<void>;
}
```

### TemplateCache

```typescript
interface TemplateCache {
  get(key: string): Promise<DatabaseEmailTemplate | null>;
  set(key: string, template: DatabaseEmailTemplate, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;

  // Batch műveletek
  getMultiple(keys: string[]): Promise<Map<string, DatabaseEmailTemplate>>;
  setMultiple(entries: Map<string, DatabaseEmailTemplate>): Promise<void>;
}
```

### TemplateMigrationService

```typescript
interface TemplateMigrationService {
  migrateBuiltInTemplates(): Promise<MigrationResult>;
  validateMigration(): Promise<ValidationResult>;
  rollbackMigration(): Promise<void>;

  // Segéd metódusok
  checkTemplateExists(type: EmailTemplateType): Promise<boolean>;
  backupExistingTemplates(): Promise<void>;
}
```

## Adatmodellek

### DatabaseEmailTemplate

```typescript
interface DatabaseEmailTemplate {
  id: string;
  type: string; // EmailTemplateType értékek
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

### Template Konverziós Típusok

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

## Implementációs Stratégia

### 1. Fázis: Adatbázis Réteg

- DatabaseTemplateRepository implementálása
- Drizzle ORM lekérdezések optimalizálása
- Indexek és teljesítmény finomhangolása

### 2. Fázis: Cache Réteg

- In-memory cache implementálása (Map-alapú)
- TTL (Time To Live) kezelés
- Cache invalidáció stratégia

### 3. Fázis: Migráció

- Built-in template-ek adatbázisba migrálása
- Validáció és rollback mechanizmus
- Migráció logging és monitoring

### 4. Fázis: Integráció

- TemplateRegistry átdolgozása
- API kompatibilitás biztosítása
- Hibakezelés és fallback mechanizmusok

## Cache Stratégia

### Cache Kulcsok

```typescript
const CACHE_KEYS = {
  TEMPLATE_BY_TYPE: (type: EmailTemplateType) => `template:type:${type}`,
  ALL_ACTIVE_TEMPLATES: 'templates:active:all',
  TEMPLATE_BY_ID: (id: string) => `template:id:${id}`
};
```

### Cache TTL Beállítások

- Template by type: 1 óra (3600s)
- All active templates: 30 perc (1800s)
- Template by ID: 2 óra (7200s)

### Cache Invalidáció

- Template frissítéskor: specifikus type és ID cache törlése
- Új template létrehozásakor: all active templates cache törlése
- Template deaktiválásakor: összes kapcsolódó cache törlése

## Hibakezelés

### Hibatípusok

```typescript
enum DatabaseTemplateError {
  TEMPLATE_NOT_FOUND = 'template_not_found',
  TEMPLATE_VALIDATION_FAILED = 'template_validation_failed',
  DATABASE_CONNECTION_ERROR = 'database_connection_error',
  CACHE_ERROR = 'cache_error',
  MIGRATION_ERROR = 'migration_error'
}
```

### Fallback Mechanizmus

1. **Elsődleges**: Adatbázisból cache-en keresztül
2. **Másodlagos**: Közvetlen adatbázis lekérdezés (cache bypass)
3. **Végső**: Built-in template-ek használata (csak kritikus esetekben)

### Retry Logika

- Adatbázis hibák: 3 próbálkozás, exponenciális backoff
- Cache hibák: 2 próbálkozás, azonnali fallback adatbázisra
- Migráció hibák: Automatikus rollback

## Teljesítmény Optimalizálás

### Adatbázis Optimalizálás

- Composite index: (type, isActive)
- Partial index: csak aktív template-ekre
- Connection pooling optimalizálás

### Batch Műveletek

```typescript
// Több template egyszerre lekérdezése
async getTemplatesByTypes(types: EmailTemplateType[]): Promise<Map<EmailTemplateType, DatabaseEmailTemplate>>

// Cache warm-up stratégia
async warmUpCache(): Promise<void>
```

### Monitoring Metrikák

- Template lekérdezési idők
- Cache hit/miss arányok
- Adatbázis kapcsolat állapot
- Migráció sikerességi ráta

## Tesztelési Stratégia

### Unit Tesztek

- DatabaseTemplateRepository metódusok
- TemplateCache műveletek
- Template validáció logika
- Hibakezelési esetek

### Integrációs Tesztek

- Adatbázis és cache együttműködés
- Migráció folyamat tesztelése
- API kompatibilitás ellenőrzés
- Teljesítmény benchmark tesztek

### E2E Tesztek

- Teljes email küldési folyamat
- Template frissítés és cache invalidáció
- Hibás esetek és fallback működés

## Migráció Terv

### Előkészítés

1. Adatbázis séma ellenőrzés
2. Built-in template-ek inventarizálása
3. Backup stratégia kialakítása

### Migráció Lépések

1. **Validáció**: Meglévő template-ek ellenőrzése
2. **Backup**: Jelenlegi konfiguráció mentése
3. **Migráció**: Template-ek adatbázisba írása
4. **Validáció**: Migrált adatok ellenőrzése
5. **Aktiválás**: Új rendszer bekapcsolása

### Rollback Terv

1. Adatbázis template-ek deaktiválása
2. Built-in template-ek visszaállítása
3. Cache törlése
4. Rendszer újraindítása

## Biztonsági Megfontolások

### Template Validáció

- HTML injection védelem
- Template syntax ellenőrzés
- Required/optional data validáció
- Méret limitek (max 1MB template)

### Hozzáférés Kontroll

- Template módosítási jogosultságok
- Audit log minden template változáshoz
- Rate limiting template lekérdezésekhez

### Adatvédelem

- Sensitive data maszkolása log-okban
- Template tartalom titkosítás (opcionális)
- GDPR compliance template adatokhoz
