from flask import jsonify,request
from models.countries_model import Country_Model as C

class Countries_controller:
    @staticmethod
    def create_country():
        data = request.get_json()
        if not data or not "country_name":
            return jsonify({"Error":"No country_name"}), 400
        result = C.create_country(data["country_name"])
        return jsonify(result), 201
    
    @staticmethod
    def get_all_country():
        result = C.get_all_countries()
        return jsonify(result), 201
    
    @staticmethod
    def show_country_by_id(country_id):
        result = C.show_country_by_id(country_id)
        return jsonify (result), 201
    
    @staticmethod
    def update_country_by_id(country_id):
        data = request.get_json()
        if not data or not "country_name":
            return jsonify({"Error":"Data empty or not country_name"}), 400
        result = C.update_country(country_id, data["country_name"])
        return jsonify(result), 201
    
    @staticmethod
    def delete_country_by_id(country_id):
        result = C.delete_country_by_id(country_id)
        if not result:
            return jsonify({"Error":"No Countries with that ID"})
        return jsonify({"Message": f"country {country_id} has been deleted succefully"})
    