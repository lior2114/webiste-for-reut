import sqlite3
import os
from datetime import datetime

# יצירת נתיב מוחלט לתיקיית SQL בתוך תיקיית MyData
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
sql_dir = os.path.join(project_dir, "SQL")
path_name = os.path.join(sql_dir, "Mydb.db")

if not os.path.exists(sql_dir):
    os.makedirs(sql_dir)

class Vacations_Model:

    @staticmethod
    def get_db_connection():
        return sqlite3.connect(path_name)
    
    @staticmethod
    def create_table():
        with Vacations_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = '''create table if not exists vacations (
                vacation_id integer primary key autoincrement,
                country_id integer not null,
                vacation_description text not null,
                vacation_start date not null,
                vacation_ends date not null,
                vacation_price float not null,
                vacation_file_name text not null,
                currency text default 'ILS',
                FOREIGN KEY (country_id) REFERENCES countries(country_id)
                )'''
            cursor.execute(sql)
            # Ensure currency column exists for older DBs
            try:
                cursor.execute("PRAGMA table_info(vacations)")
                cols = [row[1] for row in cursor.fetchall()]
                if 'currency' not in cols:
                    cursor.execute("ALTER TABLE vacations ADD COLUMN currency text default 'ILS'")
            except Exception:
                pass
            connection.commit()
            cursor.close()

    @staticmethod
    def create_vacation(country_id, vacation_description, vacation_start, vacation_ends, vacation_price, vacation_file_name, currency='ILS' ):
        with Vacations_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "insert into vacations (country_id, vacation_description, vacation_start, vacation_ends, vacation_price, vacation_file_name, currency) values (?, ?, ?, ?, ?, ?, ?)"
            cursor.execute(sql,(country_id, vacation_description, vacation_start, vacation_ends, vacation_price, vacation_file_name, currency))
            connection.commit()
            vacation_id = cursor.lastrowid
            cursor.close()
            return {
                "vacation_id":vacation_id,
                "country_id": country_id,
                "vacation_description": vacation_description,
                "vacation_start": vacation_start,
                "vacation_ends": vacation_ends,
                "vacation_price": vacation_price,
                "vacation_file_name": vacation_file_name,
                "vacation_currency": currency
            }

    @staticmethod
    def get_all_vacations():
        with Vacations_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = '''select vacations.vacation_id, countries.country_name, vacations.vacation_description, vacations.vacation_start, vacations.vacation_ends, vacations.vacation_price, vacations.vacation_file_name, vacations.currency
            from vacations
            inner join countries on vacations.country_id = countries.country_id
            order by vacations.vacation_start asc'''
            cursor.execute(sql)
            vacations = cursor.fetchall()
            if not vacations:
                cursor.close()
                return {"Massages":"No vacations has been added yet"}
            cursor.close()
            return [
                {
                    "vacation_id":row[0],
                    "country_name":row[1],
                    "vacation_description":row[2],
                    "vacation_start":row[3],
                    "vacation_ends":row[4],
                    "vacation_price":row[5],
                    "vacation_file_name":row[6],
                    "vacation_currency": row[7]
                }
                for row in vacations
            ]
    
# כאן לא השתמשתי בכוונה ב inner join כדי לתת עוד דוגמא שזה יראה גם את הקודים של המדינות
    @staticmethod
    def show_vacation_by_id(vacation_id):
        with Vacations_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from vacations where vacation_id =?"
            cursor.execute(sql,(vacation_id ,))
            vacation = cursor.fetchone()
            if not vacation:
                cursor.close()
                return {"Massages":"No vacations with that ID"}
            cursor.close()
            return {
                    "vacation_id":vacation[0],
                    "country_id":vacation[1],
                    "vacation_description":vacation[2],
                    "vacation_start":vacation[3],
                    "vacation_ends":vacation[4],
                    "vacation_price":vacation[5],
                    "vacation_file_name":vacation[6],
                    "vacation_currency": vacation[7] if len(vacation) > 7 else 'ILS'
                }
        
    @staticmethod 
    def update_vacation_by_id(vacation_id, data):
        with Vacations_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from vacations where vacation_id =?"
            cursor.execute(sql,(vacation_id  ,))
            vacation = cursor.fetchone()
            if not vacation:
                cursor.close()
                return {"Error":"No vacations with that ID"}
            
            if "vacation_start" in data or "vacation_ends" in data:
                current_start = vacation[3] 
                current_end = vacation[4]  

                start_date = data.get("vacation_start", current_start) # אם המשתמש לא שולח אז מגדיר את זה למה שיש בטבלה
                end_date = data.get("vacation_ends", current_end)
            
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
                end_date = datetime.strptime(end_date, "%Y-%m-%d")

                if start_date > end_date:
                    cursor.close()
                    return {"Error": "Start date cannot be later than end date"}
            pair = "" 
            for key, value in data.items():
                if isinstance(value, (int, float)):
                    pair += f"{key}={value}," #הוספה למספרים כמו המחיר שלא מחייב גרשיים 
                else:
                    pair += f"{key}='{value}',"
            pair = pair[:-1]
            sql = f'''UPDATE vacations SET {pair} WHERE vacation_id = {vacation_id}'''
            
            cursor.execute(sql)
            connection.commit()
            cursor.close()
            return {"Message":f"vacation_id {vacation_id} has been updated successfully"}
    
    @staticmethod
    def delete_vacation_by_id(vacation_id):
        with Vacations_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from vacations where vacation_id =?"
            cursor.execute(sql,(vacation_id ,))
            vacation = cursor.fetchone()
            if not vacation:
                cursor.close()
                return {"Massages":"No vacations with that ID"}
            
            cursor.execute("DELETE FROM likes WHERE vacation_id = ?", (vacation_id,))
            cursor.execute("DELETE FROM vacations WHERE vacation_id = ?" ,(vacation_id,))
            connection.commit()
            cursor.close()
            return {"Message":f"vacation_id {vacation_id} has been deleted successfully"}

    @staticmethod
    def count_file_usage(filename: str) -> int:
        if not filename:
            return 0
        with Vacations_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM vacations WHERE vacation_file_name = ?", (filename,))
            row = cursor.fetchone()
            cursor.close()
            try:
                return int(row[0]) if row else 0
            except Exception:
                return 0

