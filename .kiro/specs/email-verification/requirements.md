# Követelmények Dokumentum

## Bevezetés

Ez a funkció email megerősítés képességet integrál az asztali környezet webalkalmazásba a Better Auth hitelesítési rendszer használatával. A rendszer automatikusan küld megerősítő emaileket új regisztrációk után, és kezeli a megerősítési folyamatot a meglévő Email_Manager komponensen keresztül, amely környezeti beállítások alapján választja ki a megfelelő email szolgáltatót.

## Szószedet

- **Email_Verification_System**: Az email cím megerősítési funkcionalitás a Better Auth rendszeren belül
- **Better_Auth**: A felhasználókezeléshez és hitelesítéshez használt könyvtár
- **Email_Provider**: A környezeti beállítások alapján kiválasztott email szolgáltató (Resend, SMTP, SendGrid, vagy AWS SES)
- **Verification_Token**: Egyedi token az email cím megerősítéséhez
- **Registration_System**: A meglévő felhasználói regisztrációs rendszer
- **Email_Manager**: A meglévő email kezelő rendszer komponens

## Követelmények

### Követelmény 1

**Felhasználói történet:** Mint új felhasználó, szeretnék megerősítő emailt kapni a regisztráció után, hogy biztonságosan aktiválhassam a fiókomat.

#### Elfogadási kritériumok

1. AMIKOR egy felhasználó regisztrál, AZ Email_Verification_System KELL küldjön megerősítő emailt a megadott email címre
2. A megerősítő email KELL tartalmazzon egyedi Verification_Token-t a biztonságos azonosításhoz
3. AMIKOR a felhasználó nem erősíti meg az email címét, A Registration_System KELL megakadályozza a bejelentkezést
4. A megerősítő email KELL használja a meglévő Email_Manager komponenst, amely automatikusan kiválasztja a konfigurált Email_Provider-t
5. AZ Email_Verification_System KELL integrálja a Better Auth beépített email megerősítési funkcióit

### Követelmény 2

**Felhasználói történet:** Mint felhasználó, szeretnék egy egyszerű linket kapni az emailben, amire kattintva megerősíthetem a fiókomat.

#### Elfogadási kritériumok

1. A megerősítő email KELL tartalmazzon egyetlen kattintható linket a megerősítéshez
2. AMIKOR a felhasználó a megerősítő linkre kattint, AZ Email_Verification_System KELL érvényesítse a Verification_Token-t
3. AMIKOR a token érvényes, AZ Email_Verification_System KELL aktiválja a felhasználói fiókot
4. AMIKOR a megerősítés sikeres, AZ Email_Verification_System KELL átirányítsa a felhasználót a bejelentkezési oldalra
5. A megerősítő link KELL tartalmazzon megfelelő biztonsági intézkedéseket a visszaélések ellen

### Követelmény 3

**Felhasználói történet:** Mint felhasználó, szeretnék újra kérni megerősítő emailt, ha nem kaptam meg vagy lejárt a token.

#### Elfogadási kritériumok

1. AZ Email_Verification_System KELL biztosítson lehetőséget új megerősítő email küldésére
2. AMIKOR a felhasználó új megerősítő emailt kér, AZ Email_Verification_System KELL generáljon új Verification_Token-t
3. A korábbi Verification_Token-ek KELL érvénytelenné váljanak új token generálásakor
4. AZ Email_Verification_System KELL korlátozza az újraküldési kérések gyakoriságát spam megelőzésére
5. AHOL a felhasználó már megerősített, AZ Email_Verification_System KELL megfelelő üzenetet jelenítsen meg

### Követelmény 4

**Felhasználói történet:** Mint rendszergazda, szeretném, hogy a megerősítési tokenek biztonságosak legyenek és megfelelő lejárati idővel rendelkezzenek.

#### Elfogadási kritériumok

1. A Verification_Token KELL legyen kriptográfiailag biztonságos és egyedi
2. A Verification_Token KELL rendelkezzen 24 órás lejárati idővel
3. AMIKOR a token lejár, AZ Email_Verification_System KELL érvénytelennek tekintse azt
4. AZ Email_Verification_System KELL naplózza a megerősítési kísérleteket biztonsági célokból
5. A megerősítési folyamat KELL védjen a brute force támadások ellen

### Követelmény 5

**Felhasználói történet:** Mint fejlesztő, szeretném, hogy a megerősítési rendszer integrálja a meglévő Better Auth konfigurációt és email sablonokat.

#### Elfogadási kritériumok

1. AZ Email_Verification_System KELL használja a Better Auth beépített `emailVerification` plugin funkcióit
2. AZ Email_Verification_System KELL integrálja a meglévő Email_Manager komponenst
3. A megerősítő emailek KELL használják a meglévő email sablon rendszert
4. AZ Email_Verification_System KELL támogassa a fejlesztői és produkciós környezetek közötti különbségeket
5. A konfiguráció KELL legyen egyszerűen módosítható a `requireEmailVerification` beállítás változtatásával
