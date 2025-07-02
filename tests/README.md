# 🧪 Tuntas Kilat Testing Suite

Folder ini berisi semua file testing untuk aplikasi Tuntas Kilat.

## 📁 Struktur Testing

### Unit Tests (`/unit/`)
- Unit tests untuk komponen individual
- Testing isolated functions dan modules

### Integration Tests (`/integration/`)
- Testing integrasi antar komponen
- Database migration scripts
- **migrate-to-firebase.ts** - Script migrasi PostgreSQL ke Firebase

### Test Scripts (Root)
- **create-test-accounts.js** - Membuat akun testing dengan berbagai role
- **test-accounts.js** - Testing akun dan autentikasi
- **test-email-auth.js** - Testing komprehensif email authentication
- **simple-test.js** - Quick testing endpoints

## 🚀 Cara Menjalankan Tests

### Test Account Creation
```bash
node tests/create-test-accounts.js
```

### Email Authentication Test
```bash
node tests/test-email-auth.js
```

### Quick API Test
```bash
node tests/simple-test.js
```

## 📊 Test Coverage

✅ **Authentication System**: 100% tested
✅ **WhatsApp OTP**: End-to-end testing
✅ **Email Registration**: Complete flow testing  
✅ **Login System**: Multi-role testing
✅ **Session Management**: Persistence testing

## 🔐 Test Accounts

Script `create-test-accounts.js` membuat 4 akun testing:
- **nabhanyuzqi1@gmail.com** (admin_perusahaan)
- **nabhanyuzqi2@gmail.com** (admin_umum)
- **nabhanyuzqi3@gmail.com** (worker)
- **customer@tuntaskilat.com** (customer)

Password untuk semua akun: `@Yuzqi07070`