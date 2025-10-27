# Email Verification Rendszer

## Gyors Áttekintés

Az email verification rendszer biztosítja, hogy csak valós email címekkel rendelkező felhasználók regisztrálhassanak az alkalmazásba. A rendszer a Better Auth könyvtárat használja, integrálva a meglévő Email Manager komponenssel.

## 🚀 Gyors Kezdés

### 1. Environment Beállítás

```bash
# Másold és szerkeszd a .env fájlt
cp .env.example .env

# Alapvető beállítások
REQUIRE_EMAIL_VERIFICATION=true
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 2. Alkalmazás Indítás

```bash
# Függőségek telepítése
bun install

# Adatbázis migrációk
bun db:migrate

# Fejlesztői szerver
bun dev
```

### 3. Tesztelés

```bash
# Unit tesztek
bun test email-verification

# E2E tesztek
bun test:e2e tests/e2e/email-verification.spec.ts
```

## 📋 Funkciók

### ✅ Implementált Funkciók

- **Automatikus email küldés** regisztráció után
- **Biztonságos token alapú megerősítés** (24 órás lejárat)
- **Email újraküldési lehetőség** rate limiting védelemmel
- **Többnyelvű támogatás** (magyar)
- **Rugalmas email szolgáltató integráció**
- **Comprehensive tesztelés** (unit, integration, E2E)
- **Biztonsági védelmek** (rate limiting, CSRF, HTTPS)

### 🔧 Konfigurációs Lehetőségek

- **Email szolgáltatók**: Resend, SMTP, SendGrid, AWS SES
- **Lejárati idő**: Konfigurálható (alapértelmezett: 24 óra)
- **Rate limiting**: Testreszabható limitek
- **Feature flag-ek**: Fokozatos bevezetés támogatása
- **Test mód**: Fejlesztői környezethez

## 📁 Fájl Struktúra

```
src/lib/auth/
├── index.ts                           # Better Auth konfiguráció
└── __tests__/
    ├── email-verification-simple.test.ts
    └── email-verification-integration.test.ts

src/lib/server/email/
├── templates/
│   ├── built-in.ts               # Email sablonok (EMAIL_VERIFICATION)
│   └── __tests__/
│       └── email-verification.test.ts
└── types.ts                      # EmailTemplateType.EMAIL_VERIFICATION

src/routes/
├── verify-email/
│   └── +page.svelte             # Megerősítési oldal
└── resend-verification/
    └── +page.svelte             # Újraküldési oldal

tests/e2e/
└── email-verification.spec.ts   # E2E tesztek

docs/
├── features/
│   └── email-verification.md    # Részletes dokumentáció
├── security/
│   └── email-verification-security.md  # Biztonsági útmutató
└── development/
    └── email-verification-dev-setup.md # Fejlesztői beállítások
```

## 🔧 Konfiguráció

### Environment Változók

#### Alapvető Beállítások

```env
# Email Verification
REQUIRE_EMAIL_VERIFICATION=true
EMAIL_VERIFICATION_EXPIRES_IN=86400  # 24 óra
AUTO_SIGNIN_AFTER_VERIFICATION=false

# Better Auth
BETTER_AUTH_SECRET=your_32_character_secret
BETTER_AUTH_URL=https://yourdomain.com

# Email Provider
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Feature Flag-ek

```env
# Fokozatos bevezetés
VERIFICATION_FEATURE_ENABLED=true
VERIFICATION_NEW_USERS_ONLY=false
VERIFICATION_ROLLOUT_PERCENTAGE=100
VERIFICATION_ROLLOUT_START_DATE=2024-01-01T00:00:00Z
```

#### Fejlesztői Beállítások

```env
# Fejlesztés
NODE_ENV=development
EMAIL_TEST_MODE=true
EMAIL_LOG_LEVEL=debug
```

### Email Szolgáltatók

#### Resend (Ajánlott)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Előnyök:**

- Egyszerű beállítás
- Fejlesztőbarát API
- Ingyenes tier (3,000 email/hó)

#### SMTP (Gmail, Outlook)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your_app_password
```

**Előnyök:**

- Teljes kontroll
- Nincs külső függőség
- Ingyenes (szolgáltató limitekkel)

## 🧪 Tesztelés

### Unit Tesztek

```bash
# Email sablon tesztek
bun test src/lib/server/email/templates/__tests__/email-verification.test.ts

# Better Auth integráció
bun test src/lib/auth/__tests__/email-verification-simple.test.ts
bun test src/lib/auth/__tests__/email-verification-integration.test.ts
```

### E2E Tesztek

```bash
# Teljes regisztrációs folyamat
bun test:e2e tests/e2e/email-verification.spec.ts
```

### Manuális Tesztelés

1. **Regisztráció**: `/auth/signup`
2. **Email ellenőrzés**: Konzol vagy email inbox
3. **Megerősítés**: Kattints a linkre
4. **Bejelentkezés**: `/auth/signin`

## 🔒 Biztonság

### Beépített Védelmek

- **Token biztonság**: Kriptográfiailag biztonságos, 32 byte
- **Lejárati idő**: Alapértelmezett 24 óra
- **Rate limiting**: 5 kísérlet / 5 perc
- **HTTPS kényszerítés**: Éles környezetben
- **CSRF védelem**: Beépített Better Auth védelem

### Biztonsági Ellenőrzőlista

- [ ] HTTPS bekapcsolva éles környezetben
- [ ] Biztonságos BETTER_AUTH_SECRET beállítva
- [ ] Rate limiting konfigurálva
- [ ] Email szolgáltató API kulcsok biztonságosan tárolva
- [ ] Monitoring és riasztások beállítva

## 📊 Monitoring

### Metrikák

- **Küldött emailek száma**: Napi/heti/havi
- **Megerősítési ráta**: Sikeres megerősítések %
- **Email küldési hibák**: Hiba típusok és gyakoriság
- **Rate limiting események**: Túllépések száma

### Naplózás

```typescript
// Email küldés
logger.info('Email verification sent', { userId, email, provider });

// Megerősítés
logger.info('Email verified', { userId, verificationTime });

// Hibák
logger.error('Email send failed', { error, userId });
```

## 🚨 Hibaelhárítás

### Gyakori Problémák

#### "Email nem érkezik meg"

1. **Ellenőrizd**: `EMAIL_TEST_MODE=false`
2. **Spam mappa**: Nézd meg a spam mappát
3. **API kulcs**: Ellenőrizd az email szolgáltató beállításait
4. **Konzol logok**: Keress hibaüzeneteket

#### "Token érvénytelen"

1. **Lejárat**: Ellenőrizd a token lejárati idejét
2. **URL encoding**: Győződj meg róla, hogy a link nem sérült
3. **Adatbázis**: Ellenőrizd a verifications táblát

#### "Rate limiting"

1. **Beállítások**: Módosítsd a rate limit értékeket
2. **IP whitelist**: Add hozzá a fejlesztői IP-t
3. **Cache**: Töröld a rate limit cache-t

### Debug Módok

```env
# Részletes naplózás
EMAIL_LOG_LEVEL=debug
BETTER_AUTH_DEBUG=true

# Teszt mód
EMAIL_TEST_MODE=true
```

## 📚 Dokumentáció

### Részletes Útmutatók

- **[Teljes Dokumentáció](./features/email-verification.md)** - Minden funkció részletesen
- **[Biztonsági Útmutató](./security/email-verification-security.md)** - Biztonsági best practice-ek
- **[Fejlesztői Beállítások](./development/email-verification-dev-setup.md)** - Fejlesztői környezet optimalizálás
- **[Email Szolgáltatók](./email-providers.md)** - Szolgáltató specifikus beállítások

### API Dokumentáció

#### Email Megerősítés

```
GET /api/auth/verify-email?token=TOKEN&callbackURL=URL
```

#### Email Újraküldés

```
POST /api/auth/send-verification-email
Content-Type: application/json

{
    "email": "user@example.com",
    "callbackURL": "/dashboard"
}
```

## 🔄 Frissítések és Karbantartás

### Rendszeres Feladatok

- **Dependency frissítések**: Havonta
- **Biztonsági auditok**: Negyedévente
- **Performance review**: Félévente
- **Dokumentáció frissítés**: Szükség szerint

### Verziókövetés

A funkció követi a semantic versioning-ot:

- **Major**: Breaking changes (pl. API változások)
- **Minor**: Új funkciók (pl. új email szolgáltató)
- **Patch**: Bugfixek és kisebb javítások

## 🤝 Közreműködés

### Fejlesztési Workflow

1. **Fork** a repository-t
2. **Branch** létrehozása: `feature/email-verification-improvement`
3. **Tesztek** írása új funkciókhoz
4. **Pull Request** létrehozása
5. **Code Review** és merge

### Kódolási Standardok

- **TypeScript**: Strict mode
- **ESLint**: Airbnb config
- **Prettier**: Automatikus formázás
- **Tesztek**: Minimum 80% coverage

## 📞 Támogatás

### Kapcsolat

- **Issues**: GitHub Issues
- **Dokumentáció**: `/docs` mappa
- **Email**: support@yourdomain.com

### Hasznos Linkek

- [Better Auth Dokumentáció](https://better-auth.com/docs)
- [Resend API Docs](https://resend.com/docs)
- [SvelteKit Docs](https://kit.svelte.dev/docs)

---

**Utolsó frissítés**: 2024. október
**Verzió**: 1.0.0
**Státusz**: ✅ Éles használatra kész
