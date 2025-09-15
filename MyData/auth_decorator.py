from functools import wraps
from flask import jsonify, request
import jwt
import os
from dotenv import load_dotenv
from models.users_model import Users_Model

# Load environment variables from MyData/config.env
load_dotenv(os.path.join(os.path.dirname(__file__), 'config.env'))


class AuthDecorator:
    """Authentication and authorization decorators using JWT.

    Exposes:
    - require_auth: any authenticated user (valid token)
    - require_admin: admin only (role_id == 1)
    - require_user_or_admin: role_id in [1, 2]
    """

    JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
    JWT_ALGORITHM = 'HS256'

    @staticmethod
    def _verify_jwt_token(token: str):
        try:
            payload = jwt.decode(token, AuthDecorator.JWT_SECRET, algorithms=[AuthDecorator.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def _get_token_from_request():
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        parts = auth_header.split(' ')
        if len(parts) != 2:
            return None
        return parts[1]

    @staticmethod
    def require_auth(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = AuthDecorator._get_token_from_request()
            if not token:
                return jsonify({"Error": "No token provided"}), 401
            payload = AuthDecorator._verify_jwt_token(token)
            if not payload:
                return jsonify({"Error": "Invalid or expired token"}), 401
            request.user_id = payload.get('user_id')
            request.user_role = payload.get('role_id')
            return f(*args, **kwargs)
        return wrapper

    @staticmethod
    def require_admin(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = AuthDecorator._get_token_from_request()
            if not token:
                return jsonify({"Error": "No token provided"}), 401
            payload = AuthDecorator._verify_jwt_token(token)
            if not payload:
                return jsonify({"Error": "Invalid or expired token"}), 401
            
            # Check current role in database to handle dynamic role changes
            user_id = payload.get('user_id')
            if not user_id:
                return jsonify({"Error": "Invalid token payload"}), 401
                
            try:
                current_user = Users_Model.show_user_by_id(user_id)
                if not current_user:
                    return jsonify({"Error": "User not found"}), 401
                if int(current_user.get('role_id', 2)) != 1:
                    return jsonify({"Error": "Admin access required"}), 403
                    
                request.user_id = user_id
                request.user_role = current_user.get('role_id')
            except Exception as e:
                return jsonify({"Error": "Failed to verify user permissions"}), 500
                
            return f(*args, **kwargs)
        return wrapper

    @staticmethod
    def require_user_or_admin(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = AuthDecorator._get_token_from_request()
            if not token:
                return jsonify({"Error": "No token provided"}), 401
            payload = AuthDecorator._verify_jwt_token(token)
            if not payload:
                return jsonify({"Error": "Invalid or expired token"}), 401
            
            # Check current role in database to handle dynamic role changes
            user_id = payload.get('user_id')
            if not user_id:
                return jsonify({"Error": "Invalid token payload"}), 401
                
            try:
                current_user = Users_Model.show_user_by_id(user_id)
                if not current_user:
                    return jsonify({"Error": "User not found"}), 401
                role_id = int(current_user.get('role_id', 0))
                if role_id not in (1, 2):
                    return jsonify({"Error": "Valid user access required"}), 403
                    
                request.user_id = user_id
                request.user_role = current_user.get('role_id')
            except Exception as e:
                return jsonify({"Error": "Failed to verify user permissions"}), 500
                
            return f(*args, **kwargs)
        return wrapper


