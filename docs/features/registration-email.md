# Regisztrációs Email Funkció

## Áttekintés

A regisztrációs email funkció automatikusan üdvözlő emailt küld az újonnan regisztrált felhasználóknak a Resend email szolgáltatás segítségével.

## Implementáció

### Remote Function

A funkció SvelteKit Remote Functions technológiát használ a típusbiztos kliens-szerver kommunikációhoz:

```typescript
// src/lib/auth/email.remote.ts
export const sendWelcomeEmail = command(welcomeEmailSchema, async ({ name, email, userId }) => {
  // Email küldési logika
});
```

### Integráció a Regisztrációs Folyamatba

A regisztrációs oldalon (`src/routes/admin/(auth)/sign-up/+page.svelte`) a sikeres regisztráció után automatikusan meghívódik az email küldő funkció:

```typescript
onSuccess() {
  // Regisztráció sikeres - üdvözlő email küldése
  try {
    await sendWelcomeEmail({
      name: $name,
      email: $email
    });
  } catch (emailError) {
    // Email hiba nem akadályozza meg a regisztrációt
    console.error('Failed to send welcome email:', emailError);
  }
}
```

## Email Sablon

Az üdvözlő email a beépített `WELCOME` sablont használja, amely tartalmazza:

- Személyre szabott üdvözlést
- Alkalmazás információkat
- Dashboard linkjét
- Következő lépések útmutatóját

### Sablon Adatok

```typescript
const templateData = {
  name,           // Felhasználó neve
  email,          // Felhasználó email címe
  appName: 'Desktop Environment',
  dashboardUrl: '/admin',
  userId: userId || undefined
};
```

## Konfiguráció

### Environment Változók

```env
# Resend Email Service Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
EMAIL_TEST_MODE=true
EMAIL_LOG_LEVEL=debug
```

### SvelteKit Konfiguráció

```javascript
// svelte.config.js
const config = {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

## Hibakezelés

### Email Szolgáltatás Nem Elérhető

Ha az email szolgáltatás nem elérhető, a funkció hibát dob, de ez nem akadályozza meg a regisztrációt:

```typescript
if (!emailManager) {
  throw new Error('Email service is currently unavailable');
}
```

### Email Küldési Hiba

Ha az email küldése sikertelen, a hiba naplózásra kerül, de a regisztráció folytatódik:

```typescript
if (!result.success) {
  console.error(`Failed to send welcome email to ${email}:`, result.error);
  throw new Error(result.error || 'Failed to send welcome email');
}
```

## Tesztelés

### Unit Tesztek

A `src/lib/auth/__tests__/email.remote.test.ts` fájl tartalmazza a unit teszteket:

- Sikeres email küldés tesztelése
- Email szolgáltatás nem elérhető eset
- Email küldési hiba kezelése

### Test Mode

Fejlesztés során az `EMAIL_TEST_MODE=true` beállítással az emailek nem kerülnek ténylegesen elküldésre, csak naplózásra.

## Előnyök

1. **Típusbiztonság**: Remote Functions biztosítja a típusbiztos kommunikációt
2. **Hibatűrés**: Email hiba nem akadályozza meg a regisztrációt
3. **Tesztelhetőség**: Könnyen mockolt és tesztelt
4. **Konfigurálhatóság**: Environment változókkal konfigurálható
5. **Naplózás**: Részletes naplózás hibakereséshez

## Tesztelés Éles Környezetben

### Resend Dashboard-ban való megjelenés

Az emailek csak akkor jelennek meg a Resend dashboard-ban, ha:

1. `EMAIL_TEST_MODE=false` van beállítva
2. Érvényes Resend API kulcs van használatban
3. Érvényes from email domain van beállítva

### Test Email Oldal

A `/admin/test-email` oldalon tesztelheted az email küldést:

```typescript
// Teszt email küldése
await sendTestEmail({
  email: 'test@example.com',
  name: 'Test User'
});
```

### Konfiguráció Ellenőrzése

```env
# Éles email küldéshez
EMAIL_TEST_MODE=false
RESEND_FROM_EMAIL=onboarding@resend.dev  # vagy saját domain
```

### Resend Korlátozások

**Ingyenes fiók korlátozások:**

- Csak a regisztrált email címedre küldhetsz emaileket
- Napi 100 email limit
- Csak `onboarding@resend.dev` from címet használhatsz

**Domain verifikálással:**

- Bármilyen email címre küldhetsz
- Magasabb limitek
- Saját from email cím használata

### Hibakeresés

1. Ellenőrizd a konzol logokat
2. Nézd meg a `EMAIL_TEST_MODE` értékét
3. Ellenőrizd a Resend API kulcs érvényességét
4. Győződj meg róla, hogy a from email domain engedélyezett

## Jövőbeli Fejlesztések

- Email template testreszabás
- Többnyelvű email sablonok
- Email delivery status tracking
- Retry mechanizmus email hibák esetén
