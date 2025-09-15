from flask import jsonify, request
from models.likes_model import Likes_Model as L
from models.users_model import Users_Model as U

class Likes_Controller:
    @staticmethod
    def add_like_to_vacation():
        data = request.get_json()
        if not data or "user_id" not in data or "vacation_id" not in data:
            return jsonify({"Error": "Missing user_id or vacation_id"}), 400
        # block admin from liking
        user = U.show_user_by_id(data["user_id"])
        if user and int(user.get("role_id", 2)) == 1:
            return jsonify({"Error": "Admins cannot like vacations"}), 403
        result = L.add_like_to_vacation(data["user_id"], data["vacation_id"])
        status = 200 if result.get("Message", "").startswith("Already liked") else 201
        return jsonify(result), status
    
    @staticmethod
    def unlike_vacation():
        data = request.get_json()
        if not data or "user_id" not in data or "vacation_id" not in data:
            return jsonify({"Error": "Missing user_id or vacation_id"}), 400
        # block admin from unliking
        user = U.show_user_by_id(data["user_id"])
        if user and int(user.get("role_id", 2)) == 1:
            return jsonify({"Error": "Admins cannot unlike vacations"}), 403
        result = L.unlike_vacation(data["user_id"], data["vacation_id"])
        return jsonify(result), 200
    
    @staticmethod
    def show_all_likes():
        result = L.show_likes()
        return jsonify(result)
