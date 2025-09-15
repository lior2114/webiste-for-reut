import sqlite3
import os
from datetime import datetime

# Reuse the same DB path strategy as other models
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
sql_dir = os.path.join(project_dir, "SQL")
path_name = os.path.join(sql_dir, "Mydb.db")

if not os.path.exists(sql_dir):
    os.makedirs(sql_dir)


class Bans_Model:

    @staticmethod
    def get_db_connection():
        return sqlite3.connect(path_name)

    @staticmethod
    def create_table():
        with Bans_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = '''create table if not exists bans (
                ban_id integer primary key autoincrement,
                user_id integer not null,
                reason text,
                until_at text not null,
                created_at text not null,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )'''
            cursor.execute(sql)
            connection.commit()
            cursor.close()

    @staticmethod
    def create_ban(user_id: int, reason: str, until_at_iso: str):
        with Bans_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            now_iso = datetime.utcnow().isoformat()
            sql = 'insert into bans (user_id, reason, until_at, created_at) values (?, ?, ?, ?)'
            cursor.execute(sql, (user_id, reason, until_at_iso, now_iso))
            connection.commit()
            ban_id = cursor.lastrowid
            cursor.close()
            return {
                "ban_id": ban_id,
                "user_id": user_id,
                "reason": reason,
                "until_at": until_at_iso,
                "created_at": now_iso,
            }

    @staticmethod
    def get_active_bans_for_user(user_id: int):
        with Bans_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            now_iso = datetime.utcnow().isoformat()
            sql = 'select ban_id, user_id, reason, until_at, created_at from bans where user_id = ? and until_at > ? order by until_at desc'
            cursor.execute(sql, (user_id, now_iso))
            rows = cursor.fetchall()
            cursor.close()
            return [
                {"ban_id": r[0], "user_id": r[1], "reason": r[2], "until_at": r[3], "created_at": r[4]}
                for r in rows
            ]

    @staticmethod
    def is_user_banned(user_id: int):
        active = Bans_Model.get_active_bans_for_user(user_id)
        if not active:
            return False, None
        # Return the latest ban
        return True, active[0]

    @staticmethod
    def delete_active_bans_for_user(user_id: int):
        with Bans_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            now_iso = datetime.utcnow().isoformat()
            sql = 'delete from bans where user_id = ? and until_at > ?'
            cursor.execute(sql, (user_id, now_iso))
            affected = cursor.rowcount
            connection.commit()
            cursor.close()
            return {"deleted": affected}


