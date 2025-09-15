from flask import Blueprint
from controller.ban_controller import Bans_Controller as B
from auth_decorator import AuthDecorator

bans_bp = Blueprint('/bans', __name__)

@bans_bp.route('/bans/<int:user_id>', methods=['POST'])
@AuthDecorator.require_admin
def create_ban(user_id):
    return B.create_ban(user_id)

@bans_bp.route('/bans/<int:user_id>', methods=['GET'])
@AuthDecorator.require_admin
def check_ban(user_id):
    return B.check(user_id)

@bans_bp.route('/bans/<int:user_id>', methods=['DELETE'])
@AuthDecorator.require_admin
def unban(user_id):
    return B.unban(user_id)


