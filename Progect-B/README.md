# פרויקט חופשות - Frontend

פרויקט React עם Material-UI לניהול חופשות.

## התקנה

1. התקן את ה-dependencies:
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom
```

2. הפעל את השרת:
```bash
npm run dev
```

## ניהול משתמשים ובסיס נתונים

### יצירת משתמש אדמין חדש
כדי ליצור משתמש אדמין חדש, השתמש בקובץ `create_admin_tk.py`

### איפוס בסיס הנתונים
אם רוצים להחזיר את בסיס הנתונים לברירת המחדל:
1. מחק את קובץ בסיס הנתונים הקיים
2. הפעל את `seed_database.py` כדי ליצור את המבנה הבסיסי

### משתמשי ברירת מחדל
עם יצירת בסיס נתונים חדש נוצרים 2 משתמשים:

**משתמש אדמין:**
- אימייל: `admin@test.com`
- סיסמה: `admin123`

**משתמש רגיל:**
- אימייל: `user@test.com`
- סיסמה: `user1234`

## תכונות
- **דף הרשמה**: עם validation מלא לכל השדות
- **בדיקת אימייל**: בדיקה בזמן אמת אם האימייל קיים במערכת
- **Validation**: 
  - שם פרטי ומשפחה - רק אותיות
  - אימייל - פורמט תקין
  - סיסמה - מינימום 4 תווים
- **UI יפה**: עם Material-UI
- **ניווט**: לדף חופשות אחרי הרשמה מוצלחת

## מבנה הפרויקט

- `src/Pages/Register.jsx` - דף הרשמה
- `src/Contexts/UserContexts.jsx` - ניהול מצב המשתמש
- `src/api/api.js` - קריאות API
- `src/App.jsx` - Routing ראשי

## API Endpoints

- `POST /users` - הרשמת משתמש חדש
- `GET /users/login` - התחברות
- `GET /users/check_email` - בדיקת זמינות אימייל
