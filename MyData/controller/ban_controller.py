from flask import request, jsonify
from models.bans_model import Bans_Model as B
from datetime import datetime, timedelta


class Bans_Controller:

    @staticmethod
    def create_ban(user_id):
        data = request.get_json() or {}
        reason = data.get('reason', '')
        days = int(data.get('days', 0))
        if days <= 0:
            return jsonify({"Error": "days must be > 0"}), 400
        until_at = (datetime.utcnow() + timedelta(days=days)).isoformat()
        result = B.create_ban(user_id=user_id, reason=reason, until_at_iso=until_at)
        return jsonify(result), 201

    @staticmethod
    def check(user_id):
        banned, info = B.is_user_banned(user_id)
        return jsonify({"banned": banned, "info": info}), 200

    @staticmethod
    def unban(user_id):
        result = B.delete_active_bans_for_user(user_id)
        return jsonify(result), 200


