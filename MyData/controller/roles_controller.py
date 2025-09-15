from flask import jsonify, request
from models.roles_model import Role_Model as R

class Role_Controller:

    @staticmethod
    def create_role():
        data = request.get_json()
        if not data or not "role_name":
            return jsonify({"Error":"Data empty or your typing is wrong"}), 400
        if isinstance(data["role_name"], int):
            return jsonify({"Error":"role_name cant be integer"}), 400
        result = R.create_roles(data["role_name"])
        return jsonify(result) ,201
    
    @staticmethod
    def get_all_roles():
        result = R.get_all_roles()
        return jsonify(result), 201
    
    @staticmethod
    def show_role_by_id(role_id):
        result = R.show_role_by_id(role_id)
        return jsonify(result), 201
    
    @staticmethod
    def update_role_by_id(role_id):
        data = request.get_json()
        if not data or not "role_name":
            return jsonify({"Error":"Data empty or your typing is wrong"}), 400
        if isinstance( data["role_name"], int ):
            return jsonify({"Error":"role_name cant be integer"}), 400
        result = R.update_role_by_id(role_id , data["role_name"])
        return jsonify(result), 201 
    
    @staticmethod
    def delete_role_by_id(role_id):
        result = R.delete_role_by_id(role_id)
        return jsonify(result), 201