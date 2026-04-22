# XL API Express Server

Express.js API server untuk XL Axiata - converted dari Python CLI tool.

## Features

- ✅ Login dengan OTP
- ✅ Cek saldo & info akun
- ✅ List paket berdasarkan family code
- ✅ List paket aktif user
- ✅ Session management
- ✅ Token refresh otomatis

## Installation

```bash
npm install
```

## Configuration

File `.env` sudah include semua config yang diperlukan. Ubah `SESSION_SECRET` untuk production.

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server akan jalan di `http://localhost:3001`

## API Endpoints

### Authentication

#### 1. Request OTP
```bash
POST /api/auth/request-otp
Content-Type: application/json

{
  "msisdn": "087815991323"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expires_in": 300,
    "max_validation_attempt": 5,
    "subscriber_id": "..."
  }
}
```

#### 2. Verify OTP
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "...",
    "expires_in": 3600,
    "profile": {
      "msisdn": "6287815991323",
      "type": "PREPAID"
    }
  }
}
```

#### 3. Get Profile
```bash
GET /api/auth/profile
```

#### 4. Refresh Token
```bash
POST /api/auth/refresh
```

#### 5. Logout
```bash
POST /api/auth/logout
```

### Packages

#### 1. Get Packages by Family Code
```bash
GET /api/packages/family/:familyCode

# Example:
GET /api/packages/family/5d63dddd-4f90-4f4c-8438-2f005c20151f
```

Response:
```json
{
  "success": true,
  "data": {
    "family_name": "Work & School",
    "family_code": "5d63dddd-4f90-4f4c-8438-2f005c20151f",
    "variants": [
      {
        "name": "Work & School",
        "package_options": [
          {
            "title": "Video Conference 10GB",
            "price": 20000
          },
          {
            "title": "Education 10GB",
            "price": 20000
          }
        ]
      }
    ]
  }
}
```

#### 2. Get My Active Packages
```bash
GET /api/packages/my-packages
```

### Balance

#### Get Balance & Account Info
```bash
GET /api/balance
```

Response:
```json
{
  "success": true,
  "data": {
    "balance": 4950,
    "active_until": "2026-07-04",
    "points": 0,
    "tier": 0
  }
}
```

## Testing dengan cURL

### 1. Request OTP
```bash
curl -X POST http://localhost:3001/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"msisdn":"087815991323"}' \
  -c cookies.txt
```

### 2. Verify OTP
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456"}' \
  -b cookies.txt -c cookies.txt
```

### 3. Get Balance
```bash
curl http://localhost:3001/api/balance \
  -b cookies.txt
```

### 4. Get Packages
```bash
curl http://localhost:3001/api/packages/family/5d63dddd-4f90-4f4c-8438-2f005c20151f \
  -b cookies.txt
```

## Family Codes (dari README Python)

- **Work & School**: `5d63dddd-4f90-4f4c-8438-2f005c20151f`
- **Voucher (banyak paket Rp 0)**: `96d99f87-8963-40e4-a522-8bea86504fee`
- **Xtra Combo Plus**: `e0f9605b-5dad-486e-a378-cf40d5b7f2ba`
- **Akrab**: `6e469cb2-443d-402f-ba77-681b032ead6a`

Lihat file Python README untuk list lengkap family codes.

## Migration ke Next.js

Untuk migrate ke Next.js API routes:

1. Copy folder `src/lib/` ke `lib/xl/` di Next.js project
2. Convert `src/routes/*.js` jadi Next.js route handlers di `app/api/`
3. Ganti `express-session` dengan `next-auth` atau cookies-based session
4. Adjust import paths

Example Next.js route handler:
```javascript
// app/api/auth/request-otp/route.js
import { NextResponse } from 'next/server';
import xlClient from '@/lib/xl/xl-client';

export async function POST(request) {
  const { msisdn } = await request.json();
  const result = await xlClient.requestOtp(msisdn);
  return NextResponse.json(result);
}
```

## Notes

- Session disimpan di memory (development). Untuk production, gunakan Redis atau database.
- Token auto-refresh belum diimplementasi. Panggil `/api/auth/refresh` manual kalau token expired.
- Purchase endpoint belum diimplementasi (butuh payment flow yang lebih kompleks).

## License

MIT
