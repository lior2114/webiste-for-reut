import os
import re
import sqlite3
import tkinter as tk
from tkinter import messagebox
import bcrypt


# Resolve path to MyData/SQL/Mydb.db relative to project root (one level up)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__ if '__file__' in globals() else '.'))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DB_PATH = os.path.join(PROJECT_ROOT, "MyData", "SQL", "Mydb.db")


def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)


def hash_password(password):
    """Hash a password using bcrypt (same as in the main system)"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def init_db():
    """Create required tables and default roles if missing."""
    with get_db_connection() as connection:
        cursor = connection.cursor()

        # Match schema used by the Flask app
        cursor.execute(
            '''CREATE TABLE IF NOT EXISTS roles (
                   role_id   INTEGER PRIMARY KEY,
                   role_name TEXT NOT NULL
               )'''
        )

        cursor.execute(
            '''CREATE TABLE IF NOT EXISTS users (
                   user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
                   first_name    TEXT NOT NULL,
                   last_name     TEXT NOT NULL,
                   user_email    TEXT NOT NULL,
                   user_password TEXT NOT NULL,
                   role_id       INTEGER DEFAULT 2,
                   FOREIGN KEY (role_id) REFERENCES roles(role_id)
               )'''
        )

        # Ensure default roles exist (admin, user)
        cursor.execute('SELECT COUNT(*) FROM roles WHERE role_name = ?', ("admin",))
        if cursor.fetchone()[0] == 0:
            cursor.execute('INSERT INTO roles (role_name) VALUES (?)', ("admin",))

        cursor.execute('SELECT COUNT(*) FROM roles WHERE role_name = ?', ("user",))
        if cursor.fetchone()[0] == 0:
            cursor.execute('INSERT INTO roles (role_name) VALUES (?)', ("user",))

        connection.commit()


def get_admin_role_id():
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute('SELECT role_id FROM roles WHERE role_name = ?', ("admin",))
        row = cursor.fetchone()
        if not row:
            # Should not happen if init_db ran, but guard just in case
            cursor.execute('INSERT INTO roles (role_name) VALUES (?)', ("admin",))
            connection.commit()
            return cursor.lastrowid
        return int(row[0])


def email_exists(user_email: str) -> bool:
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute('SELECT 1 FROM users WHERE user_email = ? LIMIT 1', (user_email.strip(),))
        return cursor.fetchone() is not None


def create_admin_user(first_name: str, last_name: str, user_email: str, user_password: str) -> int:
    admin_role_id = get_admin_role_id()
    # Hash the password before saving (same as in the main system)
    hashed_password = hash_password(user_password)
    
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            'INSERT INTO users (first_name, last_name, user_email, user_password, role_id) VALUES (?, ?, ?, ?, ?)',
            (first_name.strip(), last_name.strip(), user_email.strip(), hashed_password, admin_role_id)
        )
        connection.commit()
        return int(cursor.lastrowid)


class AdminFormApp:
    def __init__(self, master: tk.Tk):
        self.master = master
        master.title("יצירת משתמש אדמין")
        master.geometry("420x260")
        master.resizable(False, False)

        # Fields
        self.first_name_var = tk.StringVar()
        self.last_name_var = tk.StringVar()
        self.email_var = tk.StringVar()
        self.password_var = tk.StringVar()

        # Layout
        pad_y = 6
        tk.Label(master, text="שם פרטי:").grid(row=0, column=0, sticky="e", padx=10, pady=pad_y)
        tk.Entry(master, textvariable=self.first_name_var, width=30).grid(row=0, column=1, padx=10, pady=pad_y)

        tk.Label(master, text="שם משפחה:").grid(row=1, column=0, sticky="e", padx=10, pady=pad_y)
        tk.Entry(master, textvariable=self.last_name_var, width=30).grid(row=1, column=1, padx=10, pady=pad_y)

        tk.Label(master, text="אימייל:").grid(row=2, column=0, sticky="e", padx=10, pady=pad_y)
        tk.Entry(master, textvariable=self.email_var, width=30).grid(row=2, column=1, padx=10, pady=pad_y)

        tk.Label(master, text="סיסמה:").grid(row=3, column=0, sticky="e", padx=10, pady=pad_y)
        tk.Entry(master, textvariable=self.password_var, show="*", width=30).grid(row=3, column=1, padx=10, pady=pad_y)

        # Buttons
        tk.Button(master, text="צור אדמין", command=self.on_submit, width=15).grid(row=5, column=1, sticky="w", padx=10, pady=14)
        tk.Button(master, text="יציאה", command=master.quit, width=10).grid(row=5, column=1, sticky="e", padx=10, pady=14)

    def validate_inputs(self) -> bool:
        first_name = self.first_name_var.get().strip()
        last_name = self.last_name_var.get().strip()
        email = self.email_var.get().strip()
        password = self.password_var.get()

        if not first_name or not last_name or not email or not password:
            messagebox.showerror("שגיאה", "יש למלא את כל השדות")
            return False

        if not first_name.isalpha():
            messagebox.showerror("שגיאה", "שם פרטי חייב להכיל אותיות בלבד")
            return False

        if not last_name.isalpha():
            messagebox.showerror("שגיאה", "שם משפחה חייב להכיל אותיות בלבד")
            return False

        if len(password.strip()) < 4:
            messagebox.showerror("שגיאה", "הסיסמה חייבת להכיל לפחות 4 תווים")
            return False

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            messagebox.showerror("שגיאה", "כתובת אימייל אינה תקינה")
            return False

        if email_exists(email):
            messagebox.showerror("שגיאה", "האימייל כבר רשום במערכת")
            return False

        return True

    def on_submit(self):
        if not self.validate_inputs():
            return

        try:
            user_id = create_admin_user(
                self.first_name_var.get(),
                self.last_name_var.get(),
                self.email_var.get(),
                self.password_var.get(),
            )
        except Exception as e:
            messagebox.showerror("שגיאה", f"אירעה שגיאה בשמירת המשתמש:\n{e}")
            return

        messagebox.showinfo("הצלחה", f"נוצר משתמש אדמין (ID: {user_id}) בהצלחה")
        # Clear form
        self.first_name_var.set("")
        self.last_name_var.set("")
        self.email_var.set("")
        self.password_var.set("")


def main():
    init_db()
    root = tk.Tk()
    AdminFormApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()


