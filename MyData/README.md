# Backend API - פרויקט חופשות

Flask API עם SQLite database לניהול חופשות ומשתמשים.

## התקנה והפעלה

1. התקן את ה-dependencies:
```bash
pip install -r requirements.txt
```

2. הפעל את השרת:
```bash
python app.py
```

השרת יפעל על `http://localhost:5000`

## API Endpoints

### משתמשים (Users)
- `POST /users` - הרשמת משתמש חדש
- `GET /users` - קבלת כל המשתמשים
- `GET /users/login` - התחברות (תומך ב-query parameters)
- `GET /users/check_email` - בדיקת זמינות אימייל (תומך ב-query parameters)
- `GET /users/<id>` - קבלת משתמש לפי ID
- `PUT /users/<id>` - עדכון משתמש
- `DELETE /users/<id>` - מחיקת משתמש

### חופשות (Vacations)
- `POST /vacations` - יצירת חופשה חדשה
- `GET /vacations` - קבלת כל החופשות
- `GET /vacations/<id>` - קבלת חופשה לפי ID
- `PUT /vacations/update/<id>` - עדכון חופשה
- `DELETE /vacations/delete/<id>` - מחיקת חופשה

### אוהבים (Likes)
- `POST /likes` - הוספת לייק לחופשה
- `DELETE /likes` - הסרת לייק מחופשה
- `GET /likes` - קבלת כל הלייקים

### מדינות (Countries)
- `POST /countries` - יצירת מדינה חדשה
- `GET /countries` - קבלת כל המדינות
- `GET /countries/<id>` - קבלת מדינה לפי ID
- `PUT /countries/<id>` - עדכון מדינה
- `DELETE /countries/<id>` - מחיקת מדינה

### תפקידים (Roles)
- `POST /roles` - יצירת תפקיד חדש
- `GET /roles` - קבלת כל התפקידים
- `GET /roles/<id>` - קבלת תפקיד לפי ID
- `PUT /roles/<id>` - עדכון תפקיד
- `DELETE /roles/<id>` - מחיקת תפקיד

## מבנה הפרויקט

- `app.py` - הקובץ הראשי
- `models/` - מודלים של בסיס הנתונים
- `controller/` - לוגיקה עסקית
- `routes/` - הגדרת endpoints
- `SQL/` - בסיס הנתונים SQLite
