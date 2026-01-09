# Email Service Inicializálás - Fejlesztői Dokumentáció

## Tartalomjegyzék

1. [Áttekintés](#áttekintés)
2. [Architektúra](#architektúra)
3. [Inicializálási Folyamat](#inicializálási-folyamat)
4. [Komponensek Részletes Leírása](#komponensek-részletes-leírása)
5. [Konfiguráció](#konfiguráció)
6. [Hibakezelés és Degradált Mód](#hibakezelés-és-degradált-mód)
7. [Cache Kezelés](#cache-kezelés)
8. [Biztonsági Aspektusok](#biztonsági-aspektusok)
9. [Teljesítmény Optimalizálás](#teljesítmény-optimalizálás)
10. [Használati Példák](#használati-példák)

---

## Áttekintés

Az email service inicializálási rendszer felelős az alkalmazás email küldési képességeinek beállításáért és konfigurálásáért. A rendszer a szerver indításakor automatikusan inicializálódik, és biztosítja, hogy minden szükséges komponens megfelelően konfigurálva és működőképes legyen.

### Fő Jellemzők

- **Automatikus inicializálás**: A szerver első kérésénél automatikusan elindul
- **Konfiguráció validálás**: Környezeti változók átfogó ellenőrzése
- **Cache előmelegítés**: Template-ek előzetes betöltése a gyorsabb működésért
- **Degradált mód**: Részleges működés hibák esetén
- **Health check**: Rendszer állapot folyamatos monitorozása
- **Újrainicializálás**: Konfiguráció változások esetén

---

## Architektúra

### Komponens Hierarchia

```
hooks.server.ts (Belépési pont)
    ↓
initializeEmailService() [init.ts]
    ↓
EmailInitializationService [initialization-service.ts]
    ↓
    ├── EmailConfigValidator (Konfiguráció validálás)
    ├── EmailProviderFactory (Provider létrehozás)
    ├── EmailManager (Email kezelés)
    ├── DatabaseTemplateRepository (Template adatbázis)
    └── TemplateCacheManager (Cache kezelés)
```

### Fájl Struktúra

- **`src/hooks.server.ts`**: SvelteKit hook, inicializálás belépési pontja
- **`src/lib/server/email/init.ts`**: Globális inicializálási függvények
- **`src/lib/server/email/initialization-service.ts`**: Inicializálási logika
- **`src/lib/server/email/config-validator.ts`**: Konfiguráció validálás
- **`src/lib/server/email/manager.ts`**: Email küldés kezelés
- **`src/lib/server/email/providers/factory.ts`**: Email provider factory
- **`src/lib/server/database/repositories/email-template-repository.ts`**: Template adatbázis műveletek
- **`src/lib/server/database/repositories/email-template-cache-manager.ts`**: Cache kezelés

---

## Inicializálási Folyamat

### 1. Belépési Pont: hooks.server.ts

A SvelteKit `handle` hook-ban történik az inicializálás:

```typescript
// hooks.server.ts:10-38
export const handle: Handle = async ({ event, resolve }) => {
    // Inicializálás csak egyszer, első kérésnél
    if (!emailServiceInitialized && !building) {
        try {
            const emailState = await initializeEmailService({
                skipCacheWarmUp: false,        // Cache előmelegítés engedélyezve
                validateConfiguration: true,    // Konfiguráció validálás
                retryAttempts: 3,              // Újrapróbálkozások száma
                retryDelay: 1000               // Késleltetés ms-ban
            });

            if (emailState.initialized) {
                if (emailState.degraded) {
                    console.warn('[Server] Email service initialized in degraded mode');
                } else {
                    console.info('[Server] Email service initialized successfully');
                }
            } else {
                console.error('[Server] Email service failed to initialize');
            }
        } catch (error) {
            console.error('[Server] Email service initialization error:', error);
        }
        emailServiceInitialized = true;
    }
    // ... további hook logika
};
```

#### Működés:

1. **Egyszeri futás biztosítása**: `emailServiceInitialized` flag megakadályozza a többszöri inicializálást
2. **Build időben kihagyás**: `!building` feltétel biztosítja, hogy csak futásidőben történjen inicializálás
3. **Konfiguráció átadás**: Inicializálási paraméterek megadása
4. **Állapot ellenőrzés**: Sikeres/degradált/sikertelen állapot kezelése
5. **Hibakezelés**: Try-catch blokk biztosítja, hogy hiba esetén a szerver továbbra is működjön

### 2. Inicializálási Szolgáltatás Indítása: init.ts

```typescript
// init.ts:135-175
export async function initializeEmailService(
    config?: InitializationConfig
): Promise<EmailServiceState> {
    try {
        log('info', 'Starting enhanced email service initialization...');

        // Inicializálási szolgáltatás létrehozása
        if (!initializationService) {
            initializationService = new EmailInitializationService(config);
        }

        // Teljes inicializálás futtatása
        emailServiceState = await initializationService.initialize();

        if (emailServiceState.initialized) {
            if (emailServiceState.degraded) {
                log('warn', 'Email service initialized in degraded mode');
            } else {
                log('info', 'Email service initialized successfully');
            }
        } else {
            log('error', 'Email service initialization failed');
        }

        return emailServiceState;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        log('error', `Email service initialization failed: ${errorMessage}`);

        // Sikertelen állapot visszaadása
        emailServiceState = {
            initialized: false,
            error: errorMessage,
            degraded: true,
            cacheWarmedUp: false,
            healthStatus: 'unavailable'
        };

        return emailServiceState;
    }
}
```

#### Működés:

1. **Singleton pattern**: Csak egy `EmailInitializationService` példány létezik
2. **Globális állapot**: `emailServiceState` tárolja a szolgáltatás állapotát
3. **Hibatűrés**: Hiba esetén is visszaad egy állapot objektumot
4. **Logging**: Minden lépés naplózva van

### 3. Részletes Inicializálás: EmailInitializationService

```typescript
// initialization-service.ts:97-158
async initialize(): Promise<EmailServiceState> {
    const startTime = Date.now();
    this.log('info', 'Starting enhanced email service initialization');

    try {
        // 1. LÉPÉS: Konfiguráció létrehozása és validálása
        const emailConfig = await this.createAndValidateConfiguration();
        if (!emailConfig) {
            return this.setFailedState('Configuration validation failed');
        }

        // 2. LÉPÉS: Email komponensek inicializálása
        const manager = await this.initializeEmailComponents(emailConfig);
        if (!manager) {
            return this.setFailedState('Email components initialization failed');
        }

        // 3. LÉPÉS: Cache előmelegítés (ha engedélyezve)
        if (!this.config.skipCacheWarmUp) {
            const cacheWarmedUp = await this.warmUpCache();
            this.state.cacheWarmedUp = cacheWarmedUp;

            if (!cacheWarmedUp) {
                this.log('warn', 'Cache warm-up failed, continuing with cold cache');
                this.state.degraded = true;
            }
        } else {
            this.state.cacheWarmedUp = true;
        }

        // 4. LÉPÉS: API kapcsolat validálása (ha nem teszt mód)
        if (!emailConfig.testMode && this.config.validateConfiguration) {
            const connectivityValid = await this.validateApiConnectivity(manager);
            if (!connectivityValid) {
                this.log('warn', 'API connectivity validation failed, running in degraded mode');
                this.state.degraded = true;
            }
        }

        // Végső állapot beállítása
        this.state = {
            ...this.state,
            initialized: true,
            manager,
            config: emailConfig,
            healthStatus: this.state.degraded ? 'degraded' : 'healthy'
        };

        const duration = Date.now() - startTime;
        this.log('info', 'Email service initialization completed', {
            duration,
            status: this.state.healthStatus,
            cacheWarmedUp: this.state.cacheWarmedUp
        });

        return this.state;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        this.log('error', 'Email service initialization failed', { error: errorMessage });
        return this.setFailedState(errorMessage);
    }
}
```

#### Inicializálási Lépések Részletesen:

---

## Komponensek Részletes Leírása

### 1. Konfiguráció Validálás (EmailConfigValidator)

#### Felelősség:

- Environment változók validálása
- Provider-specifikus beállítások ellenőrzése
- Környezet-specifikus ajánlások

#### Működés:

```typescript
// config-validator.ts:22-57
static validate(): ConfigValidationResult {
    const result: ConfigValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        recommendations: [],
        environment: env.NODE_ENV || 'development'
    };

    try {
        // Konfiguráció létrehozása
        const config = this.createEmailConfig();

        // Provider-specifikus validálás
        this.validateProviderConfig(config, result);

        // Általános konfiguráció validálás
        this.validateCommonConfig(config, result);

        // Környezet-specifikus validálás
        this.validateEnvironmentConfig(config, result);

        // Biztonsági validálás
        this.validateSecurityConfig(config, result);

        // Összesített érvényesség
        result.valid = result.errors.length === 0;

        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Configuration creation failed';
        result.valid = false;
        result.errors.push(`Configuration validation failed: ${errorMessage}`);
        return result;
    }
}
```

#### Validálási Szintek:

**1. Provider-specifikus validálás:**

- **Resend**: API kulcs formátum (`re_` prefix), from email, webhook secret
- **SMTP**: Host, port, username, password, secure flag
- **SendGrid**: API kulcs formátum (`SG.` prefix), from email
- **AWS SES**: Region, access key, secret key

**2. Általános validálás:**

- Email formátum ellenőrzés
- Log level értékek (`debug`, `info`, `warn`, `error`)
- Retry konfiguráció (0-10 próbálkozás, 100ms-30s késleltetés)

**3. Környezet-specifikus validálás:**

- **Development**: Test mode ajánlás, debug logging
- **Production**: Test mode tiltás, webhook secret ajánlás
- **Test**: Mock provider ajánlás

**4. Biztonsági validálás:**

- API kulcs hossz és formátum
- Szóközök az API kulcsban
- Localhost/example domain figyelmeztetések
- Environment változó helyettesítés ellenőrzés

### 2. Email Provider Factory

#### Felelősség:

- Email provider kliens létrehozása
- Provider-specifikus konfiguráció kezelés

#### Támogatott Providerek:

```typescript
// providers/factory.ts:35-55
static createClient(provider: EmailProvider, config: EmailConfig): EmailProviderClient {
    switch (provider) {
        case 'resend':
            return new ResendClient(config);

        case 'sendgrid':
            throw new Error('SendGrid provider not implemented yet');

        case 'smtp':
            const smtpConfig = ProviderConfigBuilder.buildSMTPConfig();
            return new SMTPClient(smtpConfig);

        case 'ses':
            throw new Error('AWS SES provider not implemented yet');

        default:
            throw new Error(`Unknown email provider: ${provider}`);
    }
}
```

### 3. Email Manager

#### Felelősség:

- Email küldés koordinálása
- Template renderelés
- Logging és státusz követés
- Teszt mód kezelés

#### Főbb Funkciók:

**Email küldés:**

```typescript
// manager.ts:79-174
async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // 1. Paraméter validálás (Valibot schema)
    const validatedParams = v.parse(sendEmailParamsSchema, params);

    // 2. Tartalom ellenőrzés (HTML vagy text kötelező)
    if (!validatedParams.html && !validatedParams.text) {
        throw new Error('Either HTML or text content must be provided');
    }

    // 3. Címzettek normalizálása tömbbé
    const recipients = Array.isArray(validatedParams.to) ? validatedParams.to : [validatedParams.to];

    // 4. Email log bejegyzés létrehozása
    const logId = await this.logger.logEmailAttempt({
        recipient: recipients.join(', '),
        subject: validatedParams.subject,
        status: EmailDeliveryStatus.PENDING
    });

    try {
        // 5. Teszt mód vagy valódi küldés
        if (this.config.testMode) {
            return await this.handleTestMode(payload, logId);
        }

        // 6. Email küldés a provider-en keresztül
        const response = await this.client.send(payload);

        // 7. Sikeres státusz frissítés
        await this.logger.updateEmailStatus(logId, EmailDeliveryStatus.SENT, response.id);

        return { success: true, messageId: response.id };
    } catch (error) {
        // 8. Sikertelen státusz frissítés
        await this.logger.updateEmailStatus(logId, EmailDeliveryStatus.FAILED, undefined, errorMessage);
        return { success: false, error: errorMessage };
    }
}
```

**Template-alapú email küldés:**

```typescript
// manager.ts:179-223
async sendTemplatedEmail(params: TemplatedEmailParams): Promise<EmailResult> {
    // 1. Paraméter validálás
    const validatedParams = v.parse(templatedEmailParamsSchema, params);

    // 2. Template adat validálás
    await this.templateRegistry.validateTemplateData(
        validatedParams.template,
        validatedParams.data
    );

    // 3. Template renderelés
    const renderedContent = await this.templateRegistry.renderTemplate(
        validatedParams.template,
        validatedParams.data
    );

    // 4. Renderelt email küldése
    return await this.sendEmail({
        to: validatedParams.to,
        subject: renderedContent.subject,
        html: renderedContent.html,
        text: renderedContent.text,
        from: validatedParams.from,
        replyTo: validatedParams.replyTo
    });
}
```

### 4. Database Template Repository

#### Felelősség:

- Template-ek adatbázis műveletek
- Cache kezelés
- Rate limiting
- Audit logging
- Biztonsági validálás

#### Főbb Funkciók:

**Template lekérés típus alapján (cache-elt):**

```typescript
// email-template-repository.ts:57-161
async getTemplateByType(
    type: EmailTemplateType,
    context?: { userId?: string; ipAddress?: string; ... }
): Promise<DatabaseEmailTemplate | null> {
    const endTiming = performanceMonitor.startTiming('getTemplateByType', { type });

    try {
        // 1. Rate limit ellenőrzés
        const identifier = context?.userId || context?.ipAddress || 'anonymous';
        const rateLimitResults = this.rateLimiter.checkMultipleRateLimits(
            ['template_access', 'global_template'],
            identifier
        );

        // Rate limit túllépés kezelése
        for (const [operation, result] of rateLimitResults) {
            if (!result.allowed) {
                await this.auditLogger.logSecurityViolation('rate_limit_exceeded', ...);
                throw this.createError(DatabaseTemplateError.RATE_LIMIT_EXCEEDED, ...);
            }
        }

        // 2. Cache ellenőrzés (ha engedélyezve)
        if (this.config.enableCache) {
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                await this.auditLogger.logTemplateAccessed(type, cached.id, { ...context, cacheHit: true });
                return cached;
            }
        }

        // 3. Adatbázis lekérdezés
        const result = await db
            .select()
            .from(emailTemplates)
            .where(and(eq(emailTemplates.type, type), eq(emailTemplates.isActive, true)))
            .limit(1);

        const template = result[0] || null;

        // 4. Cache-elés (ha találat és cache engedélyezve)
        if (template && this.config.enableCache) {
            await this.cache.set(cacheKey, template, this.config.cacheConfig.templateByTypeTtl);
        }

        // 5. Audit log
        if (template) {
            await this.auditLogger.logTemplateAccessed(type, template.id, { ...context, cacheHit: false });
        }

        endTiming();
        return template;
    } catch (error) {
        endTiming();
        throw this.createError(DatabaseTemplateError.DATABASE_CONNECTION_ERROR, ...);
    }
}
```

**Batch template lekérés (optimalizált):**

```typescript
// email-template-repository.ts:579-665
async getTemplatesByTypes(
    types: EmailTemplateType[]
): Promise<Map<EmailTemplateType, DatabaseEmailTemplate>> {
    // 1. Cache ellenőrzés minden típusra
    if (this.config.enableCache) {
        const cacheKeys = types.map((type) => CACHE_KEYS.templateByType(type));
        const cached = await this.cache.getMultiple(cacheKeys);

        // Találatok és hiányok szétválasztása
        for (const type of types) {
            const cachedTemplate = cached.get(cacheKey);
            if (cachedTemplate) {
                result.set(type, cachedTemplate);
            } else {
                uncachedTypes.push(type);
            }
        }
    }

    // 2. Batch adatbázis lekérdezés (IN query)
    if (uncachedTypes.length > 0) {
        const templates = await db
            .select()
            .from(emailTemplates)
            .where(and(
                eq(emailTemplates.isActive, true),
                inArray(emailTemplates.type, uncachedTypes)
            ))
            .orderBy(emailTemplates.type);

        // 3. Batch cache-elés
        const cacheEntries = new Map<string, DatabaseEmailTemplate>();
        for (const template of templates) {
            const type = template.type as EmailTemplateType;
            result.set(type, template);
            cacheEntries.set(CACHE_KEYS.templateByType(type), template);
        }

        if (this.config.enableCache && cacheEntries.size > 0) {
            await this.cache.setMultiple(cacheEntries, this.config.cacheConfig.templateByTypeTtl);
        }
    }

    return result;
}
```

### 5. Template Cache Manager

#### Felelősség:

- Cache előmelegítés
- Cache optimalizálás
- Lejáró bejegyzések frissítése
- Health metrikák

#### Cache Előmelegítés:

```typescript
// email-template-cache-manager.ts:37-57
async warmUp(templates: DatabaseEmailTemplate[]): Promise<void> {
    console.log(`[TemplateCacheManager] Starting cache warm-up with ${templates.length} templates`);

    // 1. Batch-ekre bontás
    const batches = this.createBatches(templates, this.warmUpConfig.batchSize);
    let successCount = 0;
    let errorCount = 0;

    // 2. Batch-enként feldolgozás
    for (const batch of batches) {
        try {
            await this.warmUpBatch(batch);
            successCount += batch.length;
        } catch (error) {
            errorCount += batch.length;
            console.error('[TemplateCacheManager] Batch warm-up failed:', error);
        }
    }

    console.log(
        `[TemplateCacheManager] Cache warm-up completed. Success: ${successCount}, Errors: ${errorCount}`
    );
}
```

**Batch feldolgozás:**

```typescript
// email-template-cache-manager.ts:198-212
private async warmUpBatch(templates: DatabaseEmailTemplate[]): Promise<void> {
    const entries = new Map<string, DatabaseEmailTemplate>();

    for (const template of templates) {
        // Cache típus szerint
        const typeKey = CACHE_KEYS.templateByType(template.type as EmailTemplateType);
        entries.set(typeKey, template);

        // Cache ID szerint
        const idKey = CACHE_KEYS.templateById(template.id);
        entries.set(idKey, template);
    }

    // Batch cache művelet
    await this.cache.setMultiple(entries);
}
```

---

## Konfiguráció

### Environment Változók

#### Általános Beállítások:

```bash
# Email provider választás
EMAIL_PROVIDER=resend  # resend | smtp | sendgrid | ses

# Teszt mód (emailek nem kerülnek kiküldésre)
EMAIL_TEST_MODE=false

# Log szint
EMAIL_LOG_LEVEL=info  # debug | info | warn | error
```

#### Resend Provider:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@example.com
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Opcionális
```

#### SMTP Provider:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USERNAME=user@example.com
SMTP_PASSWORD=app_password
```

#### SendGrid Provider:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@example.com
```

#### AWS SES Provider:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxx
```

### Inicializálási Konfiguráció

```typescript
interface InitializationConfig {
    skipCacheWarmUp?: boolean;        // Cache előmelegítés kihagyása
    validateConfiguration?: boolean;   // Konfiguráció validálás
    repositoryConfig?: Partial<RepositoryConfig>;  // Repository beállítások
    retryAttempts?: number;           // Újrapróbálkozások száma
    retryDelay?: number;              // Késleltetés ms-ban
}
```

### Repository Konfiguráció

```typescript
interface RepositoryConfig {
    enableCache: boolean;
    cacheConfig: {
        defaultTtl: number;              // 3600 (1 óra)
        templateByTypeTtl: number;       // 3600 (1 óra)
        allActiveTemplatesTtl: number;   // 1800 (30 perc)
        templateByIdTtl: number;         // 7200 (2 óra)
    };
    retryAttempts: number;               // 3
    retryDelay: number;                  // 1000ms
}
```

---

## Hibakezelés és Degradált Mód

### Hibakezelési Stratégia

Az email service három állapotban működhet:

1. **Healthy (Egészséges)**: Minden komponens működik
2. **Degraded (Degradált)**: Részleges működés, bizonyos funkciók korlátozottak
3. **Unavailable (Nem elérhető)**: Szolgáltatás nem működik

### Degradált Mód Okai

```typescript
// initialization-service.ts:115-134
// Cache warm-up sikertelen
if (!cacheWarmedUp) {
    this.log('warn', 'Cache warm-up failed, continuing with cold cache');
    this.state.degraded = true;
}

// API kapcsolat validálás sikertelen
if (!connectivityValid) {
    this.log('warn', 'API connectivity validation failed, running in degraded mode');
    this.state.degraded = true;
}
```

### Hibakezelési Példák

**Konfiguráció hiba:**

```typescript
if (!validation.valid) {
    this.log('error', 'Configuration validation failed', {
        errors: validation.errors,
        warnings: validation.warnings
    });
    return null;  // Inicializálás leáll
}
```

**Komponens inicializálás hiba:**

```typescript
const manager = await this.initializeEmailComponents(emailConfig);
if (!manager) {
    return this.setFailedState('Email components initialization failed');
}
```

**Cache hiba (nem kritikus):**

```typescript
const cacheWarmedUp = await this.warmUpCache();
if (!cacheWarmedUp) {
    // Folytatás degradált módban
    this.state.degraded = true;
}
```

### Health Check

```typescript
// initialization-service.ts:170-253
async performHealthCheck(): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
        status: 'unavailable',
        checks: {
            configuration: false,
            database: false,
            cache: false,
            apiConnectivity: false
        },
        errors: [],
        warnings: [],
        metrics: {
            initializationTime: 0,
            cacheSize: 0,
            templatesCount: 0
        }
    };

    // 1. Konfiguráció ellenőrzés
    result.checks.configuration = await this.checkConfiguration();

    // 2. Adatbázis kapcsolat ellenőrzés
    result.checks.database = await this.checkDatabaseConnectivity();

    // 3. Cache állapot ellenőrzés
    result.checks.cache = await this.checkCacheStatus();

    // 4. API kapcsolat ellenőrzés
    if (this.state.manager && !this.state.config?.testMode) {
        result.checks.apiConnectivity = await this.validateApiConnectivity(this.state.manager);
    }

    // 5. Metrikák gyűjtése
    result.metrics.cacheSize = await this.getCacheSize();
    result.metrics.templatesCount = await this.getTemplatesCount();

    // 6. Összesített állapot meghatározása
    const criticalChecks = [result.checks.configuration, result.checks.database];
    if (criticalChecks.every(check => check)) {
        result.status = Object.values(result.checks).every(check => check)
            ? 'healthy'
            : 'degraded';
    } else {
        result.status = 'unavailable';
    }

    return result;
}
```

---

## Cache Kezelés

### Cache Architektúra

A cache rendszer többszintű:

1. **Template by Type**: Típus alapú gyors keresés
2. **Template by ID**: ID alapú közvetlen hozzáférés
3. **All Active Templates**: Összes aktív template lista

### Cache Kulcsok

```typescript
// email-template-cache.ts
export const CACHE_KEYS = {
    templateByType: (type: EmailTemplateType) => `template:type:${type}`,
    templateById: (id: string) => `template:id:${id}`,
    allActiveTemplates: 'templates:active:all'
};
```

### Cache TTL (Time To Live)

```typescript
const defaultConfig: RepositoryConfig = {
    enableCache: true,
    cacheConfig: {
        defaultTtl: 3600,              // 1 óra
        templateByTypeTtl: 3600,       // 1 óra
        allActiveTemplatesTtl: 1800,   // 30 perc
        templateByIdTtl: 7200          // 2 óra
    }
};
```

### Cache Műveletek

**Előmelegítés (Warm-up):**

```typescript
// initialization-service.ts:336-361
private async warmUpCache(): Promise<boolean> {
    try {
        this.log('info', 'Starting cache warm-up');

        // 1. Összes aktív template lekérése
        const repository = new DatabaseTemplateRepository(this.repositoryConfig);
        const templates = await repository.getAllActiveTemplates();

        if (templates.length === 0) {
            this.log('warn', 'No templates found for cache warm-up');
            return true;
        }

        // 2. Cache manager használata
        const cacheManager = new TemplateCacheManager(repository['cache']);
        await cacheManager.warmUp(templates);

        this.log('info', 'Cache warm-up completed successfully', {
            templatesWarmedUp: templates.length
        });
        return true;
    } catch (error) {
        this.log('error', 'Cache warm-up failed', { error: errorMessage });
        return false;
    }
}
```

**Invalidálás:**

```typescript
// email-template-repository.ts:671-690
async invalidateCache(type?: EmailTemplateType): Promise<void> {
    if (!this.config.enableCache) {
        return;
    }

    try {
        if (type) {
            // Specifikus típus cache törlése
            await this.cache.delete(CACHE_KEYS.templateByType(type));
        }

        // Mindig töröljük az összes aktív template cache-t
        await this.cache.delete(CACHE_KEYS.allActiveTemplates);
    } catch (error) {
        throw this.createError(DatabaseTemplateError.CACHE_ERROR, ...);
    }
}
```

**Batch műveletek:**

```typescript
// Cache-ből többszörös olvasás
const cacheKeys = types.map((type) => CACHE_KEYS.templateByType(type));
const cached = await this.cache.getMultiple(cacheKeys);

// Cache-be többszörös írás
const cacheEntries = new Map<string, DatabaseEmailTemplate>();
for (const template of templates) {
    cacheEntries.set(CACHE_KEYS.templateByType(type), template);
}
await this.cache.setMultiple(cacheEntries, ttl);
```

---

## Biztonsági Aspektusok

### 1. Rate Limiting

```typescript
// email-template-repository.ts:72-94
const rateLimitResults = this.rateLimiter.checkMultipleRateLimits(
    ['template_access', 'global_template'],
    identifier
);

for (const [operation, result] of rateLimitResults) {
    if (!result.allowed) {
        await this.auditLogger.logSecurityViolation('rate_limit_exceeded', {
            operation,
            identifier,
            remaining: result.remaining,
            resetTime: result.resetTime
        });
        throw this.createError(
            DatabaseTemplateError.RATE_LIMIT_EXCEEDED,
            `Rate limit exceeded for ${operation}`
        );
    }
}
```

### 2. Template Biztonsági Validálás

```typescript
// email-template-repository.ts:275-292
const securityResult = this.securityValidator.validateCreateTemplate(templateData);
if (!securityResult.isValid) {
    await this.auditLogger.logSecurityViolation('template_validation_failed', {
        errors: securityResult.errors,
        warnings: securityResult.warnings
    });
    throw this.createError(
        DatabaseTemplateError.TEMPLATE_VALIDATION_FAILED,
        `Security validation failed: ${securityResult.errors.join(', ')}`
    );
}

// Sanitizált tartalom használata
const sanitizedData = {
    ...templateData,
    subjectTemplate: securityResult.sanitizedContent?.subjectTemplate || templateData.subjectTemplate,
    htmlTemplate: securityResult.sanitizedContent?.htmlTemplate || templateData.htmlTemplate,
    textTemplate: securityResult.sanitizedContent?.textTemplate || templateData.textTemplate
};
```

### 3. Audit Logging

```typescript
// Template hozzáférés naplózása
await this.auditLogger.logTemplateAccessed(type, template.id, {
    userId: context?.userId,
    ipAddress: context?.ipAddress,
    cacheHit: true/false
});

// Template létrehozás naplózása
await this.auditLogger.logTemplateCreated(templateData, context);

// Template módosítás naplózása
await this.auditLogger.logTemplateUpdated(id, updates, oldTemplate, context);

// Cache invalidálás naplózása
await this.auditLogger.logCacheInvalidated(type, {
    ...context,
    reason: 'template_created'
});
```

### 4. API Kulcs Biztonság

```typescript
// config-validator.ts:256-293
private static validateSecurityConfig(config: EmailConfig, result: ConfigValidationResult): void {
    // API kulcs formátum ellenőrzés
    if (config.apiKey) {
        if (config.apiKey.includes(' ')) {
            result.errors.push('API key contains spaces - check for configuration errors');
        }
        if (config.apiKey.length < 10) {
            result.warnings.push('API key appears to be too short - verify it is correct');
        }
    }

    // From email domain validálás
    if (config.fromEmail) {
        const domain = config.fromEmail.split('@')[1];
        if (domain?.includes('localhost') || domain?.includes('127.0.0.1')) {
            result.warnings.push('From email uses localhost domain - this may cause delivery issues');
        }
    }

    // Environment változó helyettesítés ellenőrzés
    const sensitiveVars = ['RESEND_API_KEY', 'SMTP_PASSWORD', 'RESEND_WEBHOOK_SECRET'];
    for (const varName of sensitiveVars) {
        const value = env[varName];
        if (value && typeof value === 'string') {
            if (value.startsWith('${') || value.includes('$')) {
                result.warnings.push(
                    `${varName} appears to contain variable substitution - ensure it resolves correctly`
                );
            }
        }
    }
}
```

---

## Teljesítmény Optimalizálás

### 1. Batch Műveletek

**Template lekérés optimalizálása:**

```typescript
// Rossz: N+1 query probléma
for (const type of types) {
    const template = await repository.getTemplateByType(type);
}

// Jó: Egyetlen batch query
const templates = await repository.getTemplatesByTypes(types);
```

### 2. Cache Stratégiák

**Cache-first stratégia:**

```typescript
// 1. Cache ellenőrzés
const cached = await this.cache.get(cacheKey);
if (cached) {
    return cached;  // Gyors visszatérés
}

// 2. Adatbázis lekérdezés csak cache miss esetén
const template = await db.select()...;

// 3. Eredmény cache-elése
if (template) {
    await this.cache.set(cacheKey, template, ttl);
}
```

**Batch cache műveletek:**

```typescript
// Több cache kulcs egyidejű lekérése
const cached = await this.cache.getMultiple(cacheKeys);

// Több cache bejegyzés egyidejű írása
await this.cache.setMultiple(cacheEntries, ttl);
```

### 3. Performance Monitoring

```typescript
// email-template-repository.ts:67
const endTiming = performanceMonitor.startTiming('getTemplateByType', { type });

try {
    // ... műveletek
    endTiming();  // Sikeres befejezés
    return template;
} catch (error) {
    endTiming();  // Hiba esetén is mérés
    throw error;
}
```

**Lassú query figyelmeztetés:**

```typescript
// email-template-repository.ts:647-653
const duration = Date.now() - startTime;
if (duration > 100) {
    console.warn(
        `[DatabaseTemplateRepository] Slow batch query: ${duration}ms for ${types.length} types`
    );
}
```

### 4. Méret Limitek

```typescript
// email-template-repository.ts:847-855
const totalSize =
    data.subjectTemplate.length +
    data.htmlTemplate.length +
    data.textTemplate.length;

if (totalSize > 1024 * 1024) {  // 1MB limit
    throw this.createError(
        DatabaseTemplateError.TEMPLATE_VALIDATION_FAILED,
        'Template content exceeds 1MB limit'
    );
}
```

---

## Használati Példák

### 1. Email Service Állapot Lekérdezése

```typescript
import { getEmailServiceState, getEmailServiceHealth } from '$lib/server/email';

// Egyszerű állapot
const state = getEmailServiceState();
console.log('Initialized:', state.initialized);
console.log('Degraded:', state.degraded);
console.log('Cache warmed up:', state.cacheWarmedUp);

// Részletes health információ
const health = getEmailServiceHealth();
console.log('Status:', health.status);  // 'healthy' | 'degraded' | 'unavailable'
console.log('Test mode:', health.testMode);
console.log('Config:', health.config);
```

### 2. Email Küldés

```typescript
import { getEmailManager } from '$lib/server/email';

const emailManager = getEmailManager();
if (!emailManager) {
    throw new Error('Email service not available');
}

// Egyszerű email
const result = await emailManager.sendEmail({
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Welcome to our service</h1>',
    text: 'Welcome to our service'
});

if (result.success) {
    console.log('Email sent:', result.messageId);
} else {
    console.error('Email failed:', result.error);
}
```

### 3. Template-alapú Email

```typescript
import { getEmailManager } from '$lib/server/email';
import { EmailTemplateType } from '$lib/server/email/types';

const emailManager = getEmailManager();

const result = await emailManager.sendTemplatedEmail({
    to: 'user@example.com',
    template: EmailTemplateType.EMAIL_VERIFICATION,
    data: {
        userName: 'John Doe',
        verificationUrl: 'https://example.com/verify?token=...',
        expiresIn: '24 hours'
    }
});
```

### 4. Health Check Futtatása

```typescript
import { performEmailHealthCheck } from '$lib/server/email';

const healthResult = await performEmailHealthCheck();

console.log('Overall status:', healthResult.status);
console.log('Checks:', healthResult.checks);
console.log('Errors:', healthResult.errors);
console.log('Warnings:', healthResult.warnings);
console.log('Metrics:', healthResult.metrics);

// Példa kimenet:
// {
//   status: 'healthy',
//   checks: {
//     configuration: true,
//     database: true,
//     cache: true,
//     apiConnectivity: true
//   },
//   errors: [],
//   warnings: [],
//   metrics: {
//     initializationTime: 245,
//     cacheSize: 12,
//     templatesCount: 5
//   }
// }
```

### 5. Újrainicializálás

```typescript
import { reinitializeEmailService } from '$lib/server/email';

// Újrainicializálás új konfigurációval
const newState = await reinitializeEmailService({
    skipCacheWarmUp: false,
    validateConfiguration: true,
    retryAttempts: 5
});

console.log('Reinitialized:', newState.initialized);
console.log('New status:', newState.healthStatus);
```

### 6. Template Műveletek

```typescript
const emailManager = getEmailManager();

// Template lista lekérése
const templates = await emailManager.listTemplates();
console.log('Database templates:', templates.database);
console.log('Built-in templates:', templates.builtIn);
console.log('Custom templates:', templates.custom);

// Template előnézet
const preview = await emailManager.getTemplatePreview(
    'email-verification',
    {
        userName: 'Test User',
        verificationUrl: 'https://example.com/verify?token=test'
    }
);
console.log('Subject:', preview.subject);
console.log('HTML:', preview.html);
console.log('Text:', preview.text);
```

### 7. Konfiguráció Validálás

```typescript
import { validateEmailConfiguration } from '$lib/server/email/config-validator';

const validation = validateEmailConfiguration();

if (!validation.valid) {
    console.error('Configuration errors:', validation.errors);
    process.exit(1);
}

if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:', validation.warnings);
}

if (validation.recommendations.length > 0) {
    console.info('Recommendations:', validation.recommendations);
}
```

---

## Összefoglalás

Az email service inicializálási rendszer egy komplex, többrétegű architektúra, amely biztosítja:

✅ **Megbízhatóság**: Hibatűrő inicializálás degradált móddal
✅ **Teljesítmény**: Cache előmelegítés és batch műveletek
✅ **Biztonság**: Rate limiting, validálás, audit logging
✅ **Karbantarthatóság**: Tiszta komponens szeparáció
✅ **Monitorozhatóság**: Health check és performance metrikák
✅ **Rugalmasság**: Többféle email provider támogatás

A rendszer automatikusan inicializálódik a szerver indításakor, és folyamatosan monitorozza saját állapotát, hogy biztosítsa az email szolgáltatás megbízható működését.
