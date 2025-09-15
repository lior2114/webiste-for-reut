# -*- coding: utf-8 -*-
"""
Seed script to populate the SQLite database with initial data:
- Roles: Admin, User
- Two users: one Admin and one User (with hashed passwords)
- At least 10 real countries
- At least 12 vacations with different currencies (ILS, USD, EUR)
- Likes table emptied
- Bans table (created if missing) emptied

Run:
    python seed_database.py

The script locates the DB at ../MyData/SQL/Mydb.db relative to this file.
It is idempotent as much as possible: it won't duplicate roles/countries/users if they already exist.

NEW FEATURES:
- Passwords are hashed with bcrypt for security
- Vacations have different currencies (ILS, USD, EUR) with appropriate prices
"""

import os
import sqlite3
from datetime import date, timedelta
import bcrypt

# Resolve DB path: <repo_root>/MyData/SQL/Mydb.db
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DB_PATH = os.path.join(PROJECT_DIR, 'MyData', 'SQL', 'Mydb.db')

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


def connect():
    return sqlite3.connect(DB_PATH)


def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def ensure_schema(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()

    # Roles
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS roles (
               role_id INTEGER PRIMARY KEY,
               role_name TEXT NOT NULL
           )'''
    )

    # Users
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS users (
               user_id INTEGER PRIMARY KEY AUTOINCREMENT,
               first_name TEXT NOT NULL,
               last_name TEXT NOT NULL,
               user_email TEXT NOT NULL,
               user_password TEXT NOT NULL,
               role_id INTEGER DEFAULT 2,
               FOREIGN KEY (role_id) REFERENCES roles(role_id)
           )'''
    )

    # Countries
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS countries (
               country_id INTEGER PRIMARY KEY AUTOINCREMENT,
               country_name TEXT NOT NULL
           )'''
    )

    # Vacations
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS vacations (
               vacation_id INTEGER PRIMARY KEY AUTOINCREMENT,
               country_id INTEGER NOT NULL,
               vacation_description TEXT NOT NULL,
               vacation_start DATE NOT NULL,
               vacation_ends DATE NOT NULL,
               vacation_price FLOAT NOT NULL,
               vacation_file_name TEXT NOT NULL,
               currency TEXT DEFAULT 'ILS',
               FOREIGN KEY (country_id) REFERENCES countries(country_id)
           )'''
    )
    
    # Add currency column if it doesn't exist (for existing databases)
    try:
        cur.execute("PRAGMA table_info(vacations)")
        cols = [row[1] for row in cur.fetchall()]
        if 'currency' not in cols:
            cur.execute("ALTER TABLE vacations ADD COLUMN currency TEXT DEFAULT 'ILS'")
    except Exception:
        pass

    # Likes
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS likes (
               user_id INTEGER NOT NULL,
               vacation_id INTEGER NOT NULL,
               FOREIGN KEY (user_id) REFERENCES users(user_id),
               FOREIGN KEY (vacation_id) REFERENCES vacations(vacation_id)
           )'''
    )

    # Optional bans table (kept empty)
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS bans (
               ban_id INTEGER PRIMARY KEY AUTOINCREMENT,
               user_id INTEGER,
               reason TEXT,
               created_at TEXT,
               FOREIGN KEY (user_id) REFERENCES users(user_id)
           )'''
    )

    conn.commit()


def upsert_roles(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    # Force canonical role ids
    cur.execute('INSERT OR IGNORE INTO roles (role_id, role_name) VALUES (?, ?)', (1, 'Admin'))
    cur.execute('INSERT OR IGNORE INTO roles (role_id, role_name) VALUES (?, ?)', (2, 'User'))
    conn.commit()


def normalize_roles_and_users(conn: sqlite3.Connection) -> None:
    """Ensure Admin has role_id=1 and User has role_id=2, and fix users accordingly."""
    cur = conn.cursor()
    # Find existing role ids by name
    cur.execute("SELECT role_id FROM roles WHERE LOWER(role_name)='admin'")
    row_admin = cur.fetchone()
    admin_id = row_admin[0] if row_admin else None
    cur.execute("SELECT role_id FROM roles WHERE LOWER(role_name)='user'")
    row_user = cur.fetchone()
    user_id = row_user[0] if row_user else None

    # Normalize Admin -> 1
    if admin_id != 1:
        cur.execute('DELETE FROM roles WHERE role_id = 1')
        if admin_id is not None:
            # Move existing admin to id 1
            cur.execute('UPDATE roles SET role_id = 1 WHERE role_id = ?', (admin_id,))
        else:
            cur.execute('INSERT OR IGNORE INTO roles (role_id, role_name) VALUES (1, "Admin")')

    # Normalize User -> 2
    if user_id != 2:
        cur.execute('DELETE FROM roles WHERE role_id = 2')
        if user_id is not None:
            cur.execute('UPDATE roles SET role_id = 2 WHERE role_id = ?', (user_id,))
        else:
            cur.execute('INSERT OR IGNORE INTO roles (role_id, role_name) VALUES (2, "User")')

    # Ensure admin@test.com is role 1; user@test.com role 2
    cur.execute('UPDATE users SET role_id = 1 WHERE LOWER(user_email) = LOWER(?)', ('admin@test.com',))
    cur.execute('UPDATE users SET role_id = 2 WHERE LOWER(user_email) = LOWER(?)', ('user@test.com',))
    conn.commit()


def get_user_by_email(conn: sqlite3.Connection, email: str):
    cur = conn.cursor()
    cur.execute('SELECT user_id FROM users WHERE user_email = ?', (email,))
    return cur.fetchone()


def upsert_users(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    # Admin user
    if not get_user_by_email(conn, 'admin@test.com'):
        hashed_admin_password = hash_password('admin123')
        cur.execute(
            'INSERT INTO users (first_name, last_name, user_email, user_password, role_id) VALUES (?, ?, ?, ?, ?)',
            ('Admin', 'User', 'admin@test.com', hashed_admin_password, 1)
        )
    # Regular user
    if not get_user_by_email(conn, 'user@test.com'):
        hashed_user_password = hash_password('user1234')
        cur.execute(
            'INSERT INTO users (first_name, last_name, user_email, user_password, role_id) VALUES (?, ?, ?, ?, ?)',
            ('Demo', 'User', 'user@test.com', hashed_user_password, 2)
        )
    conn.commit()


def get_country_id(conn: sqlite3.Connection, name: str):
    cur = conn.cursor()
    cur.execute('SELECT country_id FROM countries WHERE LOWER(country_name) = LOWER(?)', (name,))
    row = cur.fetchone()
    return row[0] if row else None


def upsert_countries(conn: sqlite3.Connection) -> None:
    countries = [
        'Israel', 'Greece', 'Italy', 'France', 'Spain', 'Turkey', 'Cyprus',
        'Japan', 'Thailand', 'United States', 'Brazil', 'Morocco'
    ]
    cur = conn.cursor()
    for name in countries:
        if get_country_id(conn, name) is None:
            cur.execute('INSERT INTO countries (country_name) VALUES (?)', (name,))
    conn.commit()


def get_any_country_ids(conn: sqlite3.Connection) -> list:
    cur = conn.cursor()
    cur.execute('SELECT country_id, country_name FROM countries')
    return cur.fetchall()


def upsert_vacations(conn: sqlite3.Connection) -> None:
    """Insert at least 12 vacations with future dates and reasonable prices.
    Avoid duplicating same description and date range if already present.
    """
    cur = conn.cursor()

    # Build a pool of country_ids
    country_rows = get_any_country_ids(conn)
    name_to_id = {name.lower(): cid for cid, name in country_rows}

    def add_vac(country: str, desc: str, start: date, days: int, price: float, currency: str = 'ILS', file_name: str = 'https://example.com/placeholder.jpg'):
        cid = name_to_id.get(country.lower())
        if not cid:
            return
        end = start + timedelta(days=days)
        cur.execute(
            '''SELECT 1 FROM vacations WHERE country_id=? AND vacation_description=? AND vacation_start=? AND vacation_ends=?''',
            (cid, desc, start.isoformat(), end.isoformat())
        )
        if cur.fetchone():
            return
        cur.execute(
            '''INSERT INTO vacations (country_id, vacation_description, vacation_start, vacation_ends, vacation_price, vacation_file_name, currency)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (cid, desc, start.isoformat(), end.isoformat(), float(price), file_name, currency)
        )

    base = date.today() + timedelta(days=15)
    # חופשות בשקל (ILS)
    add_vac('Israel',   'Vacation in Tel Aviv. Includes beaches and markets.', base, 7, 10000, 'ILS')
    add_vac('Greece',   'Romantic vacation in Santorini. Sunsets and beaches.', base + timedelta(days=14), 7, 5500, 'ILS')
    add_vac('Cyprus',   'Relax in Paphos seaside resorts and ancient sites.', base + timedelta(days=84), 6, 3400, 'ILS')
    add_vac('Turkey',   'Istanbul and Bosphorus tour with bazaars and cuisine.', base + timedelta(days=70), 6, 3900, 'ILS')
    
    # חופשות בדולר (USD)
    add_vac('United States', 'New York & Miami city experience and beaches.', base + timedelta(days=126), 10, 2500, 'USD')
    add_vac('Japan',    'Tokyo and Kyoto culture, gardens and temples.', base + timedelta(days=98), 9, 2200, 'USD')
    add_vac('Thailand', 'Phuket beaches and island hopping adventure.', base + timedelta(days=112), 8, 1500, 'USD')
    add_vac('Brazil',   'Rio de Janeiro: Copacabana, Sugarloaf, Christ the Redeemer.', base + timedelta(days=140), 8, 1650, 'USD')
    
    # חופשות ביורו (EUR)
    add_vac('Italy',    'Explore Rome: Colosseum, Vatican, Trevi Fountain.', base + timedelta(days=28), 8, 1200, 'EUR')
    add_vac('France',   'Paris highlights: Eiffel Tower, Louvre, Montmartre.', base + timedelta(days=42), 7, 1750, 'EUR')
    add_vac('Spain',    'Barcelona: Sagrada Família, Park Güell, Gothic Quarter.', base + timedelta(days=56), 7, 1400, 'EUR')
    add_vac('Morocco',  'Marrakesh souks and desert trip to Atlas foothills.', base + timedelta(days=154), 7, 1150, 'EUR')

    conn.commit()


def clear_likes_and_bans(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    cur.execute('DELETE FROM likes')
    cur.execute('DELETE FROM bans')
    conn.commit()


def main():
    print('Using DB at:', DB_PATH)
    with connect() as conn:
        ensure_schema(conn)
        upsert_roles(conn)
        normalize_roles_and_users(conn)
        upsert_users(conn)
        normalize_roles_and_users(conn)
        upsert_countries(conn)
        upsert_vacations(conn)
        clear_likes_and_bans(conn)
    print('Seeding completed successfully.')


if __name__ == '__main__':
    main()


