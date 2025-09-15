import sqlite3
import os
# יצירת נתיב מוחלט לתיקיית SQL בתוך תיקיית MyData
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
sql_dir = os.path.join(project_dir, "SQL")
path_name = os.path.join(sql_dir, "Mydb.db")

if not os.path.exists(sql_dir):
    os.makedirs(sql_dir)

class Role_Model: 

    @staticmethod
    def get_db_connection():
        return sqlite3.connect(path_name)
    
    @staticmethod
    def create_table():
        with Role_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = '''create table if not exists roles (
                role_id integer primary key,
                role_name text not null
                )'''  #user or admin in role_name
            cursor.execute(sql)
            connection.commit()
            cursor.close()      

    @staticmethod
    def create_roles(role_name):
        with Role_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "insert into roles (role_name) values (?)"
            cursor.execute(sql,(role_name ,))
            connection.commit()
            role_id = cursor.lastrowid
            cursor.close()
            return [
                {
                    "role_id":role_id,
                    "role_name": role_name
                }
            ]

    @staticmethod
    def get_all_roles():
        with Role_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from roles"
            cursor.execute(sql)
            roles = cursor.fetchall()
            if not roles:
                cursor.close()
                return {"Massages":"No roles has been added yet"}
            cursor.close()
            return [
                {
                    "role_id":row[0],
                    "role_name":row[1]
                }
                for row in roles
            ]
    

    @staticmethod
    def show_role_by_id(role_id):
        with Role_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from roles where role_id =?"
            cursor.execute(sql,(role_id ,))
            role = cursor.fetchone()
            if not role:
                cursor.close()
                return {"Massages":"No roles with that ID"}
            cursor.close()
            return [
                {
                    "role_id":role[0],
                    "role_name":role[1]
                }
            ]
        
    @staticmethod
    def update_role_by_id(role_id, role_name):
        with Role_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from roles where role_id =?"
            cursor.execute(sql,(role_id  ,))
            role = cursor.fetchone()
            if not role:
                cursor.close()
                return {"Massages":"No roles with that ID"}
            sql = '''update roles 
                    set role_name = ? where role_id = ?'''
            cursor.execute(sql,(role_name, role_id  ,))
            connection.commit()
            cursor.close()
            return {"Message":f"role_id {role_id} has been updated successfully to {role_name}"}
    
    @staticmethod
    def delete_role_by_id(role_id):
        with Role_Model.get_db_connection() as connection:
            cursor = connection.cursor()
            sql = "select * from roles where role_id =?"
            cursor.execute(sql,(role_id ,))
            role = cursor.fetchone()
            if not role:
                cursor.close()
                return {"Massages":"No roles with that ID"}
            sql = "delete from roles where role_id = ?"
            cursor.execute(sql,(role_id,))
            connection.commit()
            cursor.close()
            return ({"Message":"Role has been succefully deleted"})