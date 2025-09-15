from flask import Flask, Blueprint
from controller.roles_controller import Role_Controller as R
from auth_decorator import AuthDecorator

roles_bp = Blueprint("/roles", __name__)

@roles_bp.route("/roles", methods = ["POST"])
@AuthDecorator.require_admin
def create_role():
    return R.create_role()

@roles_bp.route("/roles", methods = ["GET"])
@AuthDecorator.require_admin
def get_all_roles():
    return R.get_all_roles()

@roles_bp.route("/roles/<int:role_id>", methods = ["GET"])
@AuthDecorator.require_admin
def show_role_by_id(role_id):
    return R.show_role_by_id(role_id)

@roles_bp.route("/roles/<int:role_id>", methods = ["PUT"])
@AuthDecorator.require_admin
def update_role_by_id(role_id):
    return R.update_role_by_id(role_id)

@roles_bp.route("/roles/<int:role_id>", methods = ["DELETE"])
@AuthDecorator.require_admin
def delete_role_by_id(role_id):
    return R.delete_role_by_id(role_id)