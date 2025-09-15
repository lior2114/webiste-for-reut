from flask import Flask, Blueprint
from controller.countries_controller import Countries_controller as C
from auth_decorator import AuthDecorator

countries_bp = Blueprint("/countries", __name__)

@countries_bp.route("/countries", methods = ["POST"])
@AuthDecorator.require_admin
def create_country():
    return C.create_country()

@countries_bp.route("/countries", methods = ["GET"])
def get_all_countries():
    return C.get_all_country()

@countries_bp.route("/countries/<int:country_id>", methods = ["GET"])
def show_country_by_id(country_id):
    return C.show_country_by_id(country_id)

@countries_bp.route("/countries/<int:country_id>", methods = ["PUT"])
@AuthDecorator.require_admin
def update_country_by_id(country_id):
   return C.update_country_by_id(country_id)

@countries_bp.route("/countries/<int:country_id>", methods = ["DELETE"])
@AuthDecorator.require_admin
def delete_country_by_id(country_id):
    return C.delete_country_by_id(country_id)