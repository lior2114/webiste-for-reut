import sqlite3
import os
# יצירת נתיב מוחלט לתיקיית SQL בתוך תיקיית MyData
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
sql_dir = os.path.join(project_dir, "SQL")
path_name = os.path.join(sql_dir, "Mydb.db")

if not os.path.exists(sql_dir):
    os.makedirs(sql_dir)

class Users_Model:

    @staticmethod
    def get_db_connection():
        return sqlite3.connect(path_name)
    
    @staticmethod
    def create_table():
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = '''create table if not exists users (
                user_id integer primary key autoincrement,
                first_name text not null,
                last_name text not null,
                user_email text not null,
                user_password text not null,
                role_id integer default 2,
                FOREIGN KEY (role_id) REFERENCES roles(role_id)
                )'''
            cursor.execute(sql)
            connection.commit()
            cursor.close()

    @staticmethod
    def create_user(first_name, last_name, user_email, user_password):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "insert into users (first_name, last_name, user_email, user_password) values (?, ?, ?, ?)"
            cursor.execute(sql,(first_name, last_name, user_email, user_password))
            connection.commit()
            user_id = cursor.lastrowid
            cursor.close()
            return {
                "user_id":user_id,
                "first_name": first_name,
                "last_name": last_name,
                "user_email": user_email,
                "user_password": user_password,
                "role_id": 2
            }

    @staticmethod
    def get_all_users():
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = '''SELECT users.user_id, users.first_name, users.last_name, users.user_email, users.user_password, users.role_id, roles.role_name
            FROM users
            INNER JOIN roles ON roles.role_id = users.role_id
            '''
            cursor.execute(sql)
            users = cursor.fetchall()
            if not users:
                cursor.close()
                return {"Massages":"No users has been added yet"}
            cursor.close()
            return [
                {
                    "user_id":row[0],
                    "first_name":row[1],
                    "last_name":row[2],
                    "user_email":row[3],
                    "user_password":row[4],
                    "role_id":row[5],
                    "role_name":row[6]
                }
                for row in users
            ]
    

    @staticmethod
    def show_user_by_id(user_id):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from users where user_id =?"
            cursor.execute(sql,(user_id ,))
            user = cursor.fetchone()
            if not user:
                cursor.close()
                return None
            cursor.close()
            return {
                    "user_id":user[0],
                    "first_name":user[1],
                    "last_name":user[2],
                    "user_email":user[3],
                    "user_password":user[4],
                    "role_id":user[5]
                }
        
    @staticmethod
    def show_user_by_email_and_password(user_email, user_password):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from users where user_email =? and user_password =?"
            cursor.execute(sql,(user_email, user_password))
            user = cursor.fetchone()
            if not user:
                cursor.close()
                return None
            cursor.close()
            return {
                "user_id":user[0],
                "first_name":user[1],
                "last_name":user[2],
                "user_email":user[3],
                "user_password":user[4],
                "role_id":user[5]
            }

    @staticmethod
    def show_user_by_email(user_email):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from users where user_email =?"
            cursor.execute(sql,(user_email,))
            user = cursor.fetchone()
            if not user:
                cursor.close()
                return None
            cursor.close()
            return {
                "user_id":user[0],
                "first_name":user[1],
                "last_name":user[2],
                "user_email":user[3],
                "user_password":user[4],
                "role_id":user[5]
            }
        
    @staticmethod
    def update_user_by_id(user_id, data):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from users where user_id =?"
            cursor.execute(sql,(user_id  ,))
            user = cursor.fetchone()
            if not user:
                cursor.close()
                return None
            
            # Build the SET clause safely using parameterized queries
            set_clauses = []
            values = []
            for key, value in data.items():
                set_clauses.append(f"{key} = ?")
                values.append(value)
            
            if not set_clauses:
                cursor.close()
                return {"Message": "No fields to update"}
            
            sql = f'''update users 
                    set {', '.join(set_clauses)} where user_id = ?'''
            values.append(user_id)
            cursor.execute(sql, values)
            connection.commit()
            cursor.close()
            return {"Message":f"user_id {user_id} has been updated successfully"}
    
    @staticmethod
    def delete_user_by_id(user_id):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from users where user_id =?"
            cursor.execute(sql,(user_id ,))
            user = cursor.fetchone()
            if not user:
                cursor.close()
                return None
            sql = "delete from users where user_id = ?"
            cursor.execute(sql,(user_id,))
            connection.commit()
            cursor.close()
            return {"Message":"User deleted successfully"}

    @staticmethod
    def if_mail_exists(user_email):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select user_email from users where user_email =?"
            cursor.execute(sql,(user_email ,))
            exists = cursor.fetchone()
            cursor.close()
            if not exists:
                return False  # Email does not exist
            return True  # Email exists

    @staticmethod
    def set_role_for_email(user_email, role_id):
        with Users_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "update users set role_id = ? where user_email = ?"
            cursor.execute(sql, (role_id, user_email))
            connection.commit()
            cursor.close()
            return {"Message": f"Role updated for {user_email} to {role_id}"}