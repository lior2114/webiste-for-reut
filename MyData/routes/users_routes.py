from flask import Flask, Blueprint
from controller.user_controller import Users_Controller as U
from auth_decorator import AuthDecorator

users_bp = Blueprint("/users", __name__)

@users_bp.route("/users", methods = ["POST"])
def create_user():
    return U.create_user()

@users_bp.route("/users", methods = ["GET"])
@AuthDecorator.require_admin
def get_all_users():
    return U.get_all_users()

@users_bp.route("/users/login", methods = ["GET"])
def show_user_by_email_and_password():
    return U.show_user_by_email_and_password()

@users_bp.route("/users/<int:user_id>", methods = ["GET"])
@AuthDecorator.require_auth
def show_user_by_id(user_id):
    return U.show_user_by_id(user_id)

@users_bp.route("/users/<int:user_id>", methods = ["PUT"])
@AuthDecorator.require_admin
def update_user_by_id(user_id):
    return U.update_user_by_id(user_id)


@users_bp.route("/users/<int:user_id>", methods = ["DELETE"])
@AuthDecorator.require_admin
def delete_user_by_id(user_id):
    return U.delete_user_by_id(user_id)

@users_bp.route("/users/check_email", methods = ["GET"])
def check_if_mail_exists():
    return U.check_if_email_exists()

@users_bp.route("/users/verify_token", methods = ["GET"])
@AuthDecorator.require_auth
def verify_token():
    return U.verify_token()