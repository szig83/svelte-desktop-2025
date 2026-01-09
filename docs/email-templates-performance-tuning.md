# Email Template Teljesítmény Tuning Útmutató

## Áttekintés

Ez az útmutató részletes információkat nyújt az email template rendszer teljesítményének optimalizálásához. A megfelelő beállításokkal jelentősen javítható a válaszidő és csökkenthető a rendszerterhelés.

## Teljesítmény Metrikák

### Alapvető Mérőszámok

```typescript
// scripts/performance-baseline.ts
import { PerformanceMonitor } from '$lib/server/database/repositories';
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';

async function measureBaseline() {
  const monitor = new PerformanceMonitor();
  const repository = new DatabaseTemplateRepository(db);

  console.log('📊 Teljesítmény Baseline Mérés\n');

  // Template lekérdezési idő
  const iterations = 100;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await repository.getTemplateByType('email-verification');
    times.push(Date.now() - start);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  console.log('🔍 Lekérdezési Teljesítmény:');
  console.log(`   Átlagos idő: ${avgTime.toFixed(2)}ms`);
  console.log(`   Minimum idő: ${minTime}ms`);
  console.log(`   Maximum idő: ${maxTime}ms`);

  // Cache metrikák
  const metrics = await monitor.getMetrics();
  console.log('\n💾 Cache Metrikák:');
  console.log(`   Hit rate: ${metrics.cacheHitRate}%`);
  console.log(`   Miss rate: ${100 - metrics.cacheHitRate}%`);
  console.log(`   Átlagos cache idő: ${metrics.averageCacheTime}ms`);

  // Adatbázis metrikák
  console.log('\n🗄️  Adatbázis Metrikák:');
  console.log(`   Aktív kapcsolatok: ${metrics.activeConnections}`);
  console.log(`   Várakozó lekérdezések: ${metrics.pendingQueries}`);
  console.log(`   Átlagos lekérdezési idő: ${metrics.averageQueryTime}ms`);

  return {
    avgQueryTime: avgTime,
    cacheHitRate: metrics.cacheHitRate,
    dbQueryTime: metrics.averageQueryTime
  };
}

measureBaseline();
```

### Teljesítmény Célok

| Metrika             | Cél     | Kritikus |
| ------------------- | ------- | -------- |
| Template lekérdezés | < 50ms  | < 100ms  |
| Cache hit rate      | > 90%   | > 80%    |
| DB lekérdezés       | < 20ms  | < 50ms   |
| Memory használat    | < 100MB | < 200MB  |

## Adatbázis Optimalizálás

### 1. Index Optimalizálás

```sql
-- Alapvető indexek
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_type_active
ON email_templates (type, is_active)
WHERE is_active = true;

-- Partial index csak aktív template-ekre
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_active_only
ON email_templates (type)
WHERE is_active = true;

-- Composite index gyakori lekérdezésekhez
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_type_updated
ON email_templates (type, updated_at DESC)
WHERE is_active = true;

-- Index template kereséshez
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_name_search
ON email_templates USING gin(to_tsvector('english', name));
```

### 2. Lekérdezés Optimalizálás

```typescript
// Optimalizált lekérdezések
class OptimizedTemplateRepository extends DatabaseTemplateRepository {

  // Batch lekérdezés több template-hez
  async getTemplatesByTypes(types: EmailTemplateType[]): Promise<Map<EmailTemplateType, DatabaseEmailTemplate>> {
    const templates = await this.db
      .select()
      .from(emailTemplates)
      .where(
        and(
          inArray(emailTemplates.type, types),
          eq(emailTemplates.isActive, true)
        )
      );

    return new Map(templates.map(t => [t.type as EmailTemplateType, t]));
  }

  // Csak szükséges mezők lekérdezése
  async getTemplateMetadata(type: EmailTemplateType) {
    return await this.db
      .select({
        id: emailTemplates.id,
        type: emailTemplates.type,
        name: emailTemplates.name,
        updatedAt: emailTemplates.updatedAt
      })
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.type, type),
          eq(emailTemplates.isActive, true)
        )
      )
      .limit(1);
  }

  // Prepared statement használata
  private getTemplateByTypeStmt = this.db
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.type, placeholder('type')),
        eq(emailTemplates.isActive, true)
      )
    )
    .prepare();

  async getTemplateByTypeFast(type: EmailTemplateType) {
    const results = await this.getTemplateByTypeStmt.execute({ type });
    return results[0] || null;
  }
}
```

### 3. Connection Pool Optimalizálás

```typescript
// drizzle.config.ts - Optimalizált pool beállítások
export default {
  dbCredentials: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Pool optimalizálás
    max: 20,                    // Maximum kapcsolatok
    min: 5,                     // Minimum kapcsolatok
    acquireTimeoutMillis: 30000, // Kapcsolat megszerzési timeout
    createTimeoutMillis: 30000,  // Új kapcsolat létrehozási timeout
    destroyTimeoutMillis: 5000,  // Kapcsolat bezárási timeout
    idleTimeoutMillis: 30000,    // Idle kapcsolat timeout
    reapIntervalMillis: 1000,    // Cleanup gyakoriság
    createRetryIntervalMillis: 200, // Újrapróbálkozási intervallum

    // PostgreSQL specifikus optimalizálások
    statement_timeout: 30000,    // SQL statement timeout
    query_timeout: 30000,        // Query timeout
    application_name: 'email-templates'
  }
};
```

## Cache Optimalizálás

### 1. Multi-Level Cache Stratégia

```typescript
// Optimalizált cache implementáció
class OptimizedTemplateCache implements TemplateCache {
  private l1Cache = new Map<string, { data: DatabaseEmailTemplate; expires: number }>();
  private l2Cache = new Map<string, DatabaseEmailTemplate>(); // Hosszabb TTL

  constructor(
    private l1TTL = 300,    // 5 perc
    private l2TTL = 3600,   // 1 óra
    private maxSize = 1000
  ) {}

  async get(key: string): Promise<DatabaseEmailTemplate | null> {
    // L1 cache ellenőrzése
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && l1Entry.expires > Date.now()) {
      return l1Entry.data;
    }

    // L2 cache ellenőrzése
    const l2Entry = this.l2Cache.get(key);
    if (l2Entry) {
      // L1 cache-be visszatöltés
      this.l1Cache.set(key, {
        data: l2Entry,
        expires: Date.now() + this.l1TTL * 1000
      });
      return l2Entry;
    }

    return null;
  }

  async set(key: string, template: DatabaseEmailTemplate): Promise<void> {
    // L1 cache
    this.l1Cache.set(key, {
      data: template,
      expires: Date.now() + this.l1TTL * 1000
    });

    // L2 cache
    this.l2Cache.set(key, template);

    // Méret limit ellenőrzése
    if (this.l1Cache.size > this.maxSize) {
      this.evictOldest(this.l1Cache);
    }

    if (this.l2Cache.size > this.maxSize * 2) {
      this.evictOldest(this.l2Cache);
    }
  }

  private evictOldest(cache: Map<string, any>) {
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
}
```

### 2. Cache Warm-up Stratégia

```typescript
// Cache előmelegítés
class CacheWarmupService {
  constructor(
    private repository: DatabaseTemplateRepository,
    private cache: TemplateCache
  ) {}

  async warmUpCache(): Promise<void> {
    console.log('🔥 Cache warm-up indítása...');

    // Gyakran használt template-ek betöltése
    const popularTypes: EmailTemplateType[] = [
      'email-verification',
      'password-reset',
      'welcome-email',
      'notification'
    ];

    const templates = await this.repository.getTemplatesByTypes(popularTypes);

    for (const [type, template] of templates) {
      const cacheKey = `template:type:${type}`;
      await this.cache.set(cacheKey, template);
    }

    // Összes aktív template betöltése (háttérben)
    setTimeout(async () => {
      const allTemplates = await this.repository.getAllActiveTemplates();
      for (const template of allTemplates) {
        const cacheKey = `template:type:${template.type}`;
        await this.cache.set(cacheKey, template);
      }
    }, 1000);

    console.log(`✅ Cache warm-up kész: ${templates.size} template betöltve`);
  }

  // Ütemezett cache frissítés
  startScheduledWarmup(): void {
    // Óránként cache frissítés
    setInterval(() => {
      this.warmUpCache().catch(console.error);
    }, 3600000);
  }
}
```

### 3. Intelligens Cache Invalidáció

```typescript
// Intelligens cache érvénytelenítés
class SmartCacheInvalidation {
  constructor(private cache: TemplateCache) {}

  async invalidateTemplate(templateId: string, type: EmailTemplateType): Promise<void> {
    // Specifikus template cache törlése
    await this.cache.delete(`template:id:${templateId}`);
    await this.cache.delete(`template:type:${type}`);

    // Kapcsolódó cache-ek törlése
    await this.cache.delete('templates:active:all');

    // Batch cache törlés (ha van)
    const batchKeys = await this.findBatchCacheKeys(type);
    for (const key of batchKeys) {
      await this.cache.delete(key);
    }
  }

  private async findBatchCacheKeys(type: EmailTemplateType): Promise<string[]> {
    // Batch cache kulcsok keresése
    const keys: string[] = [];

    // Példa: templates:batch:email-verification,password-reset
    const allKeys = await this.cache.getAllKeys();
    for (const key of allKeys) {
      if (key.startsWith('templates:batch:') && key.includes(type)) {
        keys.push(key);
      }
    }

    return keys;
  }
}
```

## Memory Optimalizálás

### 1. Template Méret Optimalizálás

```typescript
// Template tömörítés
class TemplateCompression {

  // HTML tömörítés
  compressHtml(html: string): string {
    return html
      .replace(/\s+/g, ' ')           // Többszörös szóközök
      .replace(/>\s+</g, '><')        // Tag-ek közötti szóközök
      .replace(/\s+>/g, '>')          // Tag záró előtti szóközök
      .replace(/<\s+/g, '<')          // Tag nyitó utáni szóközök
      .trim();
  }

  // Template optimalizálás
  optimizeTemplate(template: DatabaseEmailTemplate): DatabaseEmailTemplate {
    return {
      ...template,
      htmlTemplate: this.compressHtml(template.htmlTemplate),
      textTemplate: template.textTemplate?.trim() || '',
      subjectTemplate: template.subjectTemplate.trim()
    };
  }
}

// Lazy loading template tartalom
class LazyTemplateLoader {
  private contentCache = new Map<string, string>();

  async getTemplateContent(templateId: string, field: 'html' | 'text' | 'subject'): Promise<string> {
    const cacheKey = `${templateId}:${field}`;

    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey)!;
    }

    // Csak a szükséges mező betöltése
    const content = await this.loadTemplateField(templateId, field);
    this.contentCache.set(cacheKey, content);

    return content;
  }

  private async loadTemplateField(templateId: string, field: string): Promise<string> {
    const result = await db
      .select({ [field]: emailTemplates[`${field}Template`] })
      .from(emailTemplates)
      .where(eq(emailTemplates.id, templateId))
      .limit(1);

    return result[0]?.[field] || '';
  }
}
```

### 2. Memory Leak Megelőzés

```typescript
// Memory monitoring és cleanup
class MemoryManager {
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.startMemoryMonitoring();
  }

  startMemoryMonitoring(): void {
    this.cleanupInterval = setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);

      console.log(`Memory használat: ${heapUsedMB}MB`);

      // Memory limit ellenőrzése
      if (heapUsedMB > 200) {
        console.warn('⚠️  Magas memory használat, cleanup indítása...');
        this.performCleanup();
      }

      // Garbage collection kényszerítése (ha szükséges)
      if (heapUsedMB > 150 && global.gc) {
        global.gc();
      }

    }, 30000); // 30 másodpercenként
  }

  performCleanup(): void {
    // Cache méret csökkentése
    if (this.cache instanceof OptimizedTemplateCache) {
      this.cache.cleanup();
    }

    // Régi objektumok törlése
    this.clearOldReferences();
  }

  private clearOldReferences(): void {
    // Implementáció specifikus cleanup logika
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
```

## Batch Műveletek Optimalizálása

### 1. Batch Template Lekérdezés

```typescript
// Optimalizált batch műveletek
class BatchTemplateOperations {

  async getMultipleTemplates(types: EmailTemplateType[]): Promise<Map<EmailTemplateType, DatabaseEmailTemplate>> {
    // Cache ellenőrzés először
    const cached = new Map<EmailTemplateType, DatabaseEmailTemplate>();
    const uncached: EmailTemplateType[] = [];

    for (const type of types) {
      const cacheKey = `template:type:${type}`;
      const cachedTemplate = await this.cache.get(cacheKey);

      if (cachedTemplate) {
        cached.set(type, cachedTemplate);
      } else {
        uncached.push(type);
      }
    }

    // Csak a cache-ben nem található template-ek lekérdezése
    if (uncached.length > 0) {
      const dbTemplates = await this.repository.getTemplatesByTypes(uncached);

      // Cache-be mentés
      for (const [type, template] of dbTemplates) {
        const cacheKey = `template:type:${type}`;
        await this.cache.set(cacheKey, template);
        cached.set(type, template);
      }
    }

    return cached;
  }

  // Batch cache műveletek
  async batchCacheSet(templates: Map<string, DatabaseEmailTemplate>): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [key, template] of templates) {
      promises.push(this.cache.set(key, template));
    }

    await Promise.all(promises);
  }
}
```

### 2. Párhuzamos Feldolgozás

```typescript
// Worker pool template feldolgozáshoz
class TemplateWorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Array<{ template: DatabaseEmailTemplate; data: any; resolve: Function; reject: Function }> = [];
  private activeWorkers = 0;

  constructor(private maxWorkers = 4) {
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      // Worker implementáció (ha szükséges)
    }
  }

  async renderTemplateParallel(template: DatabaseEmailTemplate, data: any): Promise<RenderedTemplate> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ template, data, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.taskQueue.length === 0 || this.activeWorkers >= this.maxWorkers) {
      return;
    }

    const task = this.taskQueue.shift();
    if (!task) return;

    this.activeWorkers++;

    try {
      // Template renderelés (szinkron vagy aszinkron)
      const result = await this.renderTemplate(task.template, task.data);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.activeWorkers--;
      this.processQueue(); // Következő task feldolgozása
    }
  }

  private async renderTemplate(template: DatabaseEmailTemplate, data: any): Promise<RenderedTemplate> {
    // Template renderelési logika
    const engine = new TemplateEngine();
    return await engine.render(template, data);
  }
}
```

## Monitoring és Profiling

### 1. Teljesítmény Monitoring

```typescript
// Részletes teljesítmény monitoring
class PerformanceProfiler {
  private metrics = new Map<string, number[]>();

  async measureOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = process.hrtime.bigint();

    try {
      const result = await operation();

      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // ms-ben

      this.recordMetric(name, duration);

      return result;
    } catch (error) {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000;

      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  private recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(duration);

    // Csak az utolsó 100 mérést tartjuk meg
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};

    for (const [name, values] of this.metrics) {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    }

    return result;
  }
}
```

### 2. Automatikus Optimalizálás

```typescript
// Automatikus teljesítmény optimalizálás
class AutoOptimizer {
  private profiler = new PerformanceProfiler();
  private optimizationRules = new Map<string, () => Promise<void>>();

  constructor() {
    this.setupOptimizationRules();
    this.startOptimizationLoop();
  }

  private setupOptimizationRules(): void {
    // Cache TTL optimalizálás
    this.optimizationRules.set('cache_hit_rate_low', async () => {
      const metrics = await this.getMetrics();
      if (metrics.cacheHitRate < 80) {
        // Cache TTL növelése
        await this.increaseCacheTTL();
      }
    });

    // Lekérdezés optimalizálás
    this.optimizationRules.set('query_time_high', async () => {
      const metrics = this.profiler.getMetrics();
      if (metrics.getTemplateByType?.avg > 50) {
        // Batch lekérdezések használata
        await this.enableBatchQueries();
      }
    });
  }

  private startOptimizationLoop(): void {
    setInterval(async () => {
      for (const [rule, action] of this.optimizationRules) {
        try {
          await action();
        } catch (error) {
          console.error(`Optimalizálási hiba (${rule}):`, error);
        }
      }
    }, 300000); // 5 percenként
  }

  private async increaseCacheTTL(): void {
    // Cache TTL növelése implementáció
    console.log('🔧 Cache TTL optimalizálás...');
  }

  private async enableBatchQueries(): void {
    // Batch lekérdezések engedélyezése
    console.log('🔧 Batch lekérdezések optimalizálás...');
  }
}
```

## Teljesítmény Tesztelés

### 1. Load Testing

```typescript
// Load testing script
async function loadTest() {
  const repository = new DatabaseTemplateRepository(db);
  const concurrency = 50;
  const iterations = 1000;

  console.log(`🚀 Load test indítása: ${concurrency} párhuzamos, ${iterations} iteráció`);

  const startTime = Date.now();
  const promises: Promise<any>[] = [];

  for (let i = 0; i < concurrency; i++) {
    promises.push(runConcurrentTest(repository, iterations / concurrency));
  }

  const results = await Promise.all(promises);
  const endTime = Date.now();

  const totalRequests = results.reduce((sum, r) => sum + r.successful, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const duration = endTime - startTime;

  console.log('\n📊 Load Test Eredmények:');
  console.log(`   Összes kérés: ${totalRequests + totalErrors}`);
  console.log(`   Sikeres: ${totalRequests}`);
  console.log(`   Hibás: ${totalErrors}`);
  console.log(`   Időtartam: ${duration}ms`);
  console.log(`   RPS: ${Math.round((totalRequests / duration) * 1000)}`);
  console.log(`   Átlagos válaszidő: ${Math.round(duration / totalRequests)}ms`);
}

async function runConcurrentTest(repository: DatabaseTemplateRepository, count: number) {
  let successful = 0;
  let errors = 0;

  for (let i = 0; i < count; i++) {
    try {
      await repository.getTemplateByType('email-verification');
      successful++;
    } catch (error) {
      errors++;
    }
  }

  return { successful, errors };
}
```

### 2. Benchmark Tesztek

```typescript
// Benchmark különböző implementációkhoz
async function benchmarkImplementations() {
  const iterations = 1000;

  console.log('🏁 Benchmark tesztek...\n');

  // Alap implementáció
  const basicRepo = new DatabaseTemplateRepository(db);
  const basicTime = await measureTime(async () => {
    for (let i = 0; i < iterations; i++) {
      await basicRepo.getTemplateByType('email-verification');
    }
  });

  // Optimalizált implementáció
  const optimizedRepo = new OptimizedTemplateRepository(db);
  const optimizedTime = await measureTime(async () => {
    for (let i = 0; i < iterations; i++) {
      await optimizedRepo.getTemplateByTypeFast('email-verification');
    }
  });

  // Cache-elt implementáció
  const cachedRepo = new CachedTemplateRepository(db);
  const cachedTime = await measureTime(async () => {
    for (let i = 0; i < iterations; i++) {
      await cachedRepo.getTemplateByType('email-verification');
    }
  });

  console.log('📊 Benchmark Eredmények:');
  console.log(`   Alap implementáció: ${basicTime}ms (${Math.round(basicTime/iterations)}ms/op)`);
  console.log(`   Optimalizált: ${optimizedTime}ms (${Math.round(optimizedTime/iterations)}ms/op)`);
  console.log(`   Cache-elt: ${cachedTime}ms (${Math.round(cachedTime/iterations)}ms/op)`);

  const improvement = Math.round(((basicTime - cachedTime) / basicTime) * 100);
  console.log(`   Javulás: ${improvement}%`);
}

async function measureTime(operation: () => Promise<void>): Promise<number> {
  const start = Date.now();
  await operation();
  return Date.now() - start;
}
```

## Optimalizálási Checklist

### Adatbázis Szint

- [ ] Megfelelő indexek létrehozása
- [ ] Connection pool optimalizálása
- [ ] Prepared statement-ek használata
- [ ] Batch lekérdezések implementálása
- [ ] Lekérdezés optimalizálás (EXPLAIN ANALYZE)

### Cache Szint

- [ ] Multi-level cache implementálása
- [ ] Megfelelő TTL beállítások
- [ ] Cache warm-up stratégia
- [ ] Intelligens invalidáció
- [ ] Cache méret monitoring

### Alkalmazás Szint

- [ ] Memory leak megelőzés
- [ ] Lazy loading implementálása
- [ ] Template tömörítés
- [ ] Párhuzamos feldolgozás
- [ ] Worker pool használata

### Monitoring Szint

- [ ] Teljesítmény metrikák gyűjtése
- [ ] Automatikus riasztások
- [ ] Load testing
- [ ] Benchmark tesztek
- [ ] Automatikus optimalizálás

## Eredmények Validálása

A megfelelő optimalizálás után az alábbi eredményeket kell elérni:

- **Template lekérdezés**: < 50ms (cache hit esetén < 5ms)
- **Cache hit rate**: > 90%
- **Memory használat**: < 100MB steady state
- **Concurrent requests**: > 1000 RPS
- **Error rate**: < 0.1%

Ezekkel az optimalizálásokkal az email template rendszer képes lesz nagy terhelés mellett is hatékonyan működni.
