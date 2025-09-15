from flask import jsonify, request
from models.users_model import Users_Model as U
from models.bans_model import Bans_Model as B
import re
import bcrypt
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables from config.env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config.env')) 

class Users_Controller:

    # JWT Secret Key - in production, use environment variable
    JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

    @staticmethod
    def hash_password(password):
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password, hashed_password):
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

    @staticmethod
    def generate_jwt_token(user_id, role_id):
        """Generate JWT token for user"""
        payload = {
            'user_id': user_id,
            'role_id': role_id,
            'exp': datetime.utcnow() + timedelta(hours=Users_Controller.JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, Users_Controller.JWT_SECRET, algorithm=Users_Controller.JWT_ALGORITHM)
        return token

    @staticmethod
    def verify_jwt_token(token):
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, Users_Controller.JWT_SECRET, algorithms=[Users_Controller.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def create_user():
        data = request.get_json()
        lis_requimints = ["first_name", "last_name", "user_email", "user_password"]
        if not data or not all(k in data for k in lis_requimints):
            return jsonify ({"Error":"Missing values or data empty"}), 400
        if len(data["user_password"].strip()) < 4:
            return jsonify ({"Error":"password need to be more then 4 values"}), 400
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data["user_email"]): #תנאי בדיקת מיילים 
            return jsonify({"Error": "Invalid email format"}), 400
        if U.if_mail_exists(data["user_email"]):
            return jsonify ({"Error":"Email already exists"}), 400
        
        # Hash the password before storing
        hashed_password = Users_Controller.hash_password(data["user_password"])
        
        result = U.create_user(
            first_name=data["first_name"],
            last_name=data["last_name"],
            user_email=data["user_email"],
            user_password=hashed_password,
        )
        return jsonify(result) , 201

    @staticmethod
    def get_all_users(): 
        result = U.get_all_users()
        return jsonify(result), 200
    
    @staticmethod
    def show_user_by_id(user_id):
        result = U.show_user_by_id(user_id)
        if result is None:
            return jsonify({"Error": "User not found"}), 404
        return jsonify(result), 200
    
    @staticmethod
    def show_user_by_email_and_password():

        # Prefer query params for GET, then try JSON body silently
        data = request.args.to_dict()
        if not data:
            data = request.get_json(silent=True) or {}
        
        # Debug: print received data
        print(f"Received data: {data}")
        
        if not data:
            return jsonify ({"Error":"Missing values or data empty"}), 400
        if "user_email" not in data or "user_password" not in data:
            return jsonify ({"Error":"Missing email or password parameters"}), 400
        
        # Clean the data (strip whitespace)
        email = str(data["user_email"]).strip()
        password = str(data["user_password"]).strip()
        
        print(f"Cleaned email: '{email}', password: '{password}'")
        
        if not email or not password:
            return jsonify ({"Error":"Email and password cannot be empty"}), 400
            
        # Get user by email only (we'll verify password separately)
        user = U.show_user_by_email(email)
        if user is None:
            return jsonify({"Error": "Invalid email or password"}), 401
        
        # Verify password using bcrypt
        if not Users_Controller.verify_password(password, user["user_password"]):
            return jsonify({"Error": "Invalid email or password"}), 401
        
        # Check ban status before issuing token
        banned, info = B.is_user_banned(int(user["user_id"]))
        if banned:
            msg = "הורחקת. אנא פנה למנהל המערכת | You have been banned. Please contact admin."
            return jsonify({
                "Error": msg,
                "banned": True,
                "info": info
            }), 403

        # Generate JWT token
        token = Users_Controller.generate_jwt_token(user["user_id"], user["role_id"])
        
        # Return user data without password and include token
        result = {
            "user_id": user["user_id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "user_email": user["user_email"],
            "role_id": user["role_id"],
            "token": token
        }
        
        return jsonify(result), 200

    @staticmethod
    def update_user_by_id(user_id):
        data = request.get_json()
        allowed_keys = ["first_name", "last_name", "user_email", "user_password", "role_id"]
        if not data:
            return jsonify ({"Error":"Missing values or data empty"}), 400
        for value in data:
            if value not in allowed_keys:
                return jsonify ({"Error":f"invalid key: {value}"}), 400
        if "user_password" in data and len(str(data["user_password"]).strip()) < 4: #סטריפ מוריד רווחים 
            return jsonify ({"Error":"password need to be more then 4 values"}), 400
        
        # Hash password if it's being updated
        if "user_password" in data:
            data["user_password"] = Users_Controller.hash_password(data["user_password"])
        if "user_email" in data:
            if not re.match(r"[^@]+@[^@]+\.[^@]+", str(data["user_email"])): #תנאי בדיקת מיילים
                return jsonify({"Error": "Invalid email format"}), 400
            if not U.if_mail_exists(data["user_email"]):
                return jsonify ({"Error":"Email already exists"}), 400
        if "first_name" in data and (not str(data["first_name"]).isalpha()):
            return jsonify({"Error": "first_name must contain only letters"}), 400
        if "last_name" in data and (not str(data["last_name"]).isalpha()):
            return jsonify({"Error": "last_name must contain only letters"}), 400
        if "role_id" in data:
            try:
                data["role_id"] = int(data["role_id"])  # normalize
            except Exception:
                return jsonify({"Error":"role_id must be integer"}), 400
            if data["role_id"] not in [1,2]:
                return jsonify({"Error":"role_id must be 1 (admin) or 2 (user)"}), 400
        if "user_email" in data:
            if U.if_mail_exists(data["user_email"])==True:
                return jsonify({"Error":"Mail already exists in the system"})
        result = U.update_user_by_id(user_id, data)
        if result is None:
            return jsonify({"Error": "user not found"}), 404
        return jsonify(result), 200
    
    @staticmethod
    def delete_user_by_id(user_id):
        result = U.delete_user_by_id(user_id)
        if result is None:
            return jsonify({"Error": "User not found"}), 404
        return jsonify(result), 200
    
    @staticmethod
    def check_if_email_exists():
        # Support both JSON body and query parameters
        if request.is_json:
            data = request.get_json()
        else:
            data = request.args.to_dict()
        
        if not data:
            return jsonify ({"Error":"Missing values or data empty"}), 400
        if not "user_email" in data:
            return jsonify ({"error":"wrong value"}), 400
        if U.if_mail_exists(data["user_email"]) == True:
            return jsonify({"Message":"email already exists in system"}), 200
        if U.if_mail_exists(data["user_email"]) == False:
            return jsonify({"Message":"email not exists"}), 200

    @staticmethod
    def verify_token():
        """Verify JWT token and return user info"""
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"Error": "No token provided"}), 401
        
        try:
            # Extract token from "Bearer <token>" format
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({"Error": "Invalid token format"}), 401
        
        payload = Users_Controller.verify_jwt_token(token)
        if not payload:
            return jsonify({"Error": "Invalid or expired token"}), 401
        
        # Get user info
        user = U.show_user_by_id(payload['user_id'])
        if not user:
            return jsonify({"Error": "User not found"}), 404
        
        # Return user info without password
        result = {
            "user_id": user["user_id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "user_email": user["user_email"],
            "role_id": user["role_id"]
        }
        
        return jsonify(result), 200
        
