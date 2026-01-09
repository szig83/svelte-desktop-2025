# Gmail SMTP Beállítási Útmutató

## 1. Gmail App Password Létrehozása

### Előfeltételek:

- Gmail fiók
- 2-lépcsős hitelesítés bekapcsolva

### Lépések:

1. **Google Account beállítások megnyitása**
   - Menj a [myaccount.google.com](https://myaccount.google.com) oldalra
   - Jelentkezz be a Gmail fiókodba

2. **Biztonság menü**
   - Bal oldali menüben kattints a "Security" (Biztonság) opcióra

3. **2-lépcsős hitelesítés ellenőrzése**
   - Győződj meg róla, hogy a "2-Step Verification" be van kapcsolva
   - Ha nincs, kapcsold be először

4. **App Password generálása**
   - Keresd meg az "App passwords" (Alkalmazásjelszavak) opciót
   - Kattints rá
   - Válaszd ki: "Mail" és az eszközöd típusát
   - Kattints a "Generate" gombra

5. **16 karakteres jelszó másolása**
   - Google generál egy 16 karakteres jelszót
   - **Másold ki és tárold biztonságosan!**
   - Ez lesz az `SMTP_PASSWORD` értéke

## 2. Environment Változók Beállítása

Másold át a `.env.smtp.example` fájlt `.env` néven és frissítsd:

```env
# Email Service Configuration - SMTP (Gmail)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
```

### Fontos megjegyzések:

- `SMTP_USERNAME`: A teljes Gmail címed
- `SMTP_PASSWORD`: A 16 karakteres app password (NEM a Gmail jelszavad!)
- `SMTP_PORT=587`: TLS port (ajánlott)
- `SMTP_SECURE=false`: 587-es port esetén false

## 3. Alternatív Beállítások

### SSL használata (465-ös port):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

### Egyéb email szolgáltatók:

#### Outlook/Hotmail:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo:

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 4. Tesztelés

1. **Indítsd újra a dev szervert**
2. **Menj a `/admin/test-email` oldalra**
3. **Kattints a "Gmail SMTP Teszt" gombra**
4. **Ellenőrizd a konzol logokat**

### Sikeres teszt esetén:

```
SMTP connection validated successfully
SMTP email sent successfully: { messageId: '...', response: '250 OK' }
```

### Gyakori hibák:

#### "Invalid login" hiba:

- Ellenőrizd az app password-öt
- Győződj meg róla, hogy 2-lépcsős hitelesítés be van kapcsolva

#### "Connection timeout" hiba:

- Ellenőrizd a tűzfal beállításokat
- Próbáld meg a 465-ös portot SSL-lel

#### "Authentication failed" hiba:

- Generálj új app password-öt
- Ellenőrizd a username formátumot (teljes email cím)

## 5. Éles Üzem Megfontolások

### Gmail Limitek:

- **Napi limit**: 500 email/nap (ingyenes fiók)
- **Percenkénti limit**: ~100 email/perc
- **Címzettek**: Max 500 címzett/email

### Biztonság:

- App password-öt soha ne oszd meg
- Rendszeresen ellenőrizd a Google Account aktivitást
- Használj environment változókat (ne hard-code-old)

### Monitoring:

- Gmail automatikusan blokkolhatja a gyanús aktivitást
- Ellenőrizd a Gmail "Sent" mappát
- Figyelj a bounce-back emailekre

## 6. Váltás Resend-ről SMTP-re

```env
# Régi (Resend)
EMAIL_PROVIDER=resend

# Új (SMTP)
EMAIL_PROVIDER=smtp
```

A váltás után minden email a Gmail SMTP-n keresztül fog menni!
