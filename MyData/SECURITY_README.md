# אבטחה - הצפנת סיסמא ו-JWT Tokens

## מה נוסף:

### 1. הצפנת סיסמא (Password Hashing)
- כל הסיסמאות מוצפנות עם bcrypt לפני שמירה בבסיס הנתונים
- סיסמאות חדשות מוצפנות אוטומטית ביצירת משתמש
- סיסמאות מעודכנות מוצפנות אוטומטית בעדכון משתמש

### 2. JWT Tokens
- פונקציית login מחזירה JWT token
- Token תקף ל-24 שעות
- Token מכיל: user_id, role_id, exp, iat

## API Endpoints חדשים:

### POST /users (יצירת משתמש)
```json
{
  "first_name": "John",
  "last_name": "Doe", 
  "user_email": "john@example.com",
  "user_password": "password123"
}
```
**הסיסמא תוצפן אוטומטית**

### GET /users/login (התחברות)
```json
{
  "user_email": "john@example.com",
  "user_password": "password123"
}
```

**תשובה:**
```json
{
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "user_email": "john@example.com", 
  "role_id": 2,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### GET /users/verify_token (אימות token)
**Headers:**
```
Authorization: Bearer <token>
```

**תשובה:**
```json
{
  "user_id": 1,
  "first_name": "John", 
  "last_name": "Doe",
  "user_email": "john@example.com",
  "role_id": 2
}
```

## שימוש ב-Frontend:

### התחברות:
```javascript
const response = await fetch('http://localhost:5000/users/login', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_email: 'john@example.com',
    user_password: 'password123'
  })
});

const data = await response.json();
// שמור את ה-token: data.token
localStorage.setItem('token', data.token);
```

### אימות token:
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/users/verify_token', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## אבטחה:
- כל הסיסמאות מוצפנות עם bcrypt (salt + hash)
- JWT tokens מוצפנים עם secret key
- סיסמאות לא מוחזרות בתגובות API
- Token validation בכל בקשה מוגנת

## הגדרות סביבה:

### קובץ config.env:
```env
# JWT Secret Key - Change this in production!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# JWT Expiration (in hours)
JWT_EXPIRATION_HOURS=24

# Database Path (optional)
DATABASE_PATH=SQL/Mydb.db

# Flask Environment
FLASK_ENV=development
FLASK_DEBUG=True
```

### משתני סביבה:
- **JWT_SECRET**: מפתח סודי ל-JWT (חובה לשנות בייצור!)
- **JWT_EXPIRATION_HOURS**: זמן תפוגת token (ברירת מחדל: 24 שעות)
- **DATABASE_PATH**: נתיב לבסיס הנתונים
- **FLASK_ENV**: סביבת Flask (development/production)
- **FLASK_DEBUG**: מצב debug

### אבטחה:
- קובץ `config.env` לא יועלה ל-Git (כלול ב-.gitignore)
- בייצור, השתמש במשתני סביבה של השרת
- **חובה לשנות JWT_SECRET** לפני העלאה לייצור!
