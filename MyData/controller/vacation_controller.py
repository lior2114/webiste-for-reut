from flask import jsonify, request, current_app
from models.vacations_model import Vacations_Model as V
from models.users_model import Users_Model as U
from models.countries_model import Country_Model as C
from datetime import datetime
import os

class Vacations_Controller:

    @staticmethod
    def create_vacation():
        # helper: default image by country
        def get_default_image(country_id: int) -> str:
            try:
                country = C.show_country_by_id(country_id)
                # API may return list with dict
                if isinstance(country, list) and len(country) > 0 and isinstance(country[0], dict):
                    country_name = country[0].get("country_name", "")
                elif isinstance(country, dict):
                    country_name = country.get("country_name", "")
                else:
                    country_name = ""
                key = str(country_name).strip().lower()
            except Exception:
                key = ""
            images = {
                "israel": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
                "greece": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
                "italy": "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?q=80&w=1600&auto=format&fit=crop",
                "rome": "https://images.unsplash.com/photo-1526152308955-7b3b1e00f59b?q=80&w=1600&auto=format&fit=crop",
                "rhodes": "https://images.unsplash.com/photo-1600697395545-1b2a64e56810?q=80&w=1600&auto=format&fit=crop",
                "lahaina": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
                "corfu": "https://images.unsplash.com/photo-1628752068394-37be53ce38af?q=80&w=1600&auto=format&fit=crop",
                "hilo": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop",
                "montego bay": "https://images.unsplash.com/photo-1511909525232-61113c912358?q=80&w=1600&auto=format&fit=crop",
                "spain": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop",
                "france": "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop",
                "turkey": "https://images.unsplash.com/photo-1590074070400-93c6d88a5ab3?q=80&w=1600&auto=format&fit=crop",
                "cyprus": "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop",
                "united kingdom": "https://images.unsplash.com/photo-1468434107316-102c1bfaaea1?q=80&w=1600&auto=format&fit=crop",
                "london": "https://images.unsplash.com/photo-1468434107316-102c1bfaaea1?q=80&w=1600&auto=format&fit=crop",
                "paris": "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1600&auto=format&fit=crop",
                "barcelona": "https://images.unsplash.com/photo-1473954768590-540b8f04f7b3?q=80&w=1600&auto=format&fit=crop",
                "athens": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1600&auto=format&fit=crop",
                "thailand": "https://images.unsplash.com/photo-1501117716987-c8e2a8505f63?q=80&w=1600&auto=format&fit=crop",
                "bangkok": "https://images.unsplash.com/photo-1501117716987-c8e2a8505f63?q=80&w=1600&auto=format&fit=crop",
                "japan": "https://images.unsplash.com/photo-1505067484848-0d4fd1a6461d?q=80&w=1600&auto=format&fit=crop",
                "tokyo": "https://images.unsplash.com/photo-1505067484848-0d4fd1a6461d?q=80&w=1600&auto=format&fit=crop",
                "kyoto": "https://images.unsplash.com/photo-1473773508845-188df298d2d1?q=80&w=1600&auto=format&fit=crop",
                "south korea": "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?q=80&w=1600&auto=format&fit=crop",
                "seoul": "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?q=80&w=1600&auto=format&fit=crop",
                "china": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1600&auto=format&fit=crop",
                "hong kong": "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1600&auto=format&fit=crop",
                "singapore": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
                "australia": "https://images.unsplash.com/photo-1510745407471-9de6f3b7f0c4?q=80&w=1600&auto=format&fit=crop",
                "sydney": "https://images.unsplash.com/photo-1510745407471-9de6f3b7f0c4?q=80&w=1600&auto=format&fit=crop",
                "melbourne": "https://images.unsplash.com/photo-1526481280698-8bcc1a3057ae?q=80&w=1600&auto=format&fit=crop",
                "new zealand": "https://images.unsplash.com/photo-1473135343775-ae97a48dfb43?q=80&w=1600&auto=format&fit=crop",
                "bali": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop",
                "maldives": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop",
                "mexico": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1600&auto=format&fit=crop",
                "cancun": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1600&auto=format&fit=crop",
                "canada": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
                "toronto": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
                "vancouver": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
                "brazil": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop",
                "rio de janeiro": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop",
                "argentina": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop",
                "south africa": "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1600&auto=format&fit=crop",
                "cape town": "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1600&auto=format&fit=crop",
                "morocco": "https://images.unsplash.com/photo-1501117716987-c8e2a8505f63?q=80&w=1600&auto=format&fit=crop",
                "cairo": "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1600&auto=format&fit=crop",
                "egypt": "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1600&auto=format&fit=crop",
                "istanbul": "https://images.unsplash.com/photo-1590074070400-93c6d88a5ab3?q=80&w=1600&auto=format&fit=crop",
                "dubai": "https://images.unsplash.com/photo-1504270997636-07ddfbd48945?q=80&w=1600&auto=format&fit=crop",
                "netherlands": "https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=1600&auto=format&fit=crop",
                "amsterdam": "https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=1600&auto=format&fit=crop",
                "germany": "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1600&auto=format&fit=crop",
                "berlin": "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1600&auto=format&fit=crop",
                "austria": "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop",
                "vienna": "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop",
                "prague": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1600&auto=format&fit=crop",
                "switzerland": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
                "zermatt": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
                "norway": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop",
                "iceland": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop",
            }
            return images.get(key, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop")

        # Support multipart/form-data for file upload
        if request.content_type and 'multipart/form-data' in request.content_type:
            form = request.form
            file = request.files.get('file')
            filename = None
            if file and file.filename:
                filename = file.filename
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(save_path)
            data = {
                "country_id": int(form.get("country_id", 0)) if str(form.get("country_id", "")).strip().isdigit() else 0,
                "vacation_description": form.get("vacation_description", ""),
                "vacation_start": form.get("vacation_start", ""),
                "vacation_ends": form.get("vacation_ends", ""),
                "vacation_price": float(form.get("vacation_price", 0)),
                "vacation_file_name": filename or get_default_image(int(form.get("country_id", 0))),
                "vacation_currency": (form.get("currency") or form.get("vacation_currency") or "ILS").strip().upper()
            }
            # Create country if missing and name provided
            cn = form.get("country_name", "").strip()
            if (not data["country_id"] or data["country_id"] == 0) and cn:
                created = C.create_country(cn)
                if isinstance(created, list) and created:
                    data["country_id"] = created[0].get("country_id", 0)
                elif isinstance(created, dict):
                    data["country_id"] = created.get("country_id", 0)
            admin_user_id = form.get("admin_user_id")
        else:
            data = request.get_json()
            admin_user_id = data.get("admin_user_id") if data else None
            # If no country_id but has country_name, create it
            if data:
                try:
                    cid_val = int(data.get("country_id", 0))
                except Exception:
                    cid_val = 0
                cn = str(data.get("country_name", "")).strip()
                if (not cid_val or cid_val == 0) and cn:
                    created = C.create_country(cn)
                    if isinstance(created, list) and created:
                        data["country_id"] = created[0].get("country_id", 0)
                    elif isinstance(created, dict):
                        data["country_id"] = created.get("country_id", 0)

        # allow missing vacation_file_name; require either country_id or country_name
        base_fields = ["vacation_description", "vacation_start", "vacation_ends", "vacation_price"]
        if not data or not all(k in data for k in base_fields):
            return jsonify ({"Error":"Missing values or data empty"}), 400
        if not data.get("country_id") and not data.get("country_name"):
            return jsonify({"Error": "country_id or country_name is required"}), 400
        # admin guard
        try:
            admin_id = int(admin_user_id) if admin_user_id is not None else None
        except Exception:
            admin_id = None
        if admin_id is None:
            return jsonify({"Error": "Missing admin_user_id"}), 403
        admin_user = U.show_user_by_id(admin_id)
        if not admin_user or int(admin_user.get("role_id", 2)) != 1:
            return jsonify({"Error": "Only admin can create vacations"}), 403
        
        start_date = datetime.strptime(data["vacation_start"], "%Y-%m-%d")
        end_date = datetime.strptime(data["vacation_ends"], "%Y-%m-%d")
        if start_date > end_date:
            return jsonify({"Error": "cant added vacation beacuse vacation_start are bigger then vacation_end"}), 400
        today = datetime.now().date()
        if start_date.date() < today or end_date.date() < today:
            return jsonify({"Error": "vacation dates cannot be in the past"}), 400

        if data["vacation_price"] > 10000 or data["vacation_price"] < 0:
            return jsonify({"Error": "vacation_price cant be lower then 0 or high then 10000"}), 400
        # Ensure image default if not provided
        if not data.get("vacation_file_name"):
            try:
                cid = int(data.get("country_id"))
            except Exception:
                cid = 0
            data["vacation_file_name"] = get_default_image(cid)

        result = V.create_vacation(
            country_id = data["country_id"],
            vacation_description = data["vacation_description"],
            vacation_start = data["vacation_start"],
            vacation_ends = data["vacation_ends"],
            vacation_price = data["vacation_price"],
            vacation_file_name = data["vacation_file_name"],
            currency = (data.get("vacation_currency") or data.get("currency") or "ILS").upper()
            )
        return jsonify(result), 201

    

    @staticmethod
    def get_all_vacations():
        result = V.get_all_vacations()
        return jsonify(result),201
    
    @staticmethod
    def show_vacations_by_id(vacation_id):
        result = V.show_vacation_by_id(vacation_id)
        return jsonify(result),201
    
    @staticmethod
    def update_vacation_by_id(vacation_id):
        # Support optional file update and country creation by name
        # Also supports removing an existing image via 'remove_image' flag
        # and deletes the old uploaded file from disk if it is no longer used.
        existing = V.show_vacation_by_id(vacation_id)
        existing_filename = None
        if isinstance(existing, dict):
            existing_filename = existing.get("vacation_file_name")
        if request.content_type and 'multipart/form-data' in request.content_type:
            form = request.form
            file = request.files.get('file')
            data = {}
            for key in ["country_id", "vacation_description", "vacation_start", "vacation_ends", "vacation_price", "vacation_currency", "currency"]:
                if key in form:
                    data[key] = form[key]
            # allow choosing by country_name
            if (not data.get("country_id") or str(data.get("country_id")).strip()=="") and form.get("country_name"):
                created = C.create_country(form.get("country_name").strip())
                if isinstance(created, list) and created:
                    data["country_id"] = created[0].get("country_id")
                elif isinstance(created, dict):
                    data["country_id"] = created.get("country_id")
            if file and file.filename:
                filename = file.filename
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(save_path)
                data["vacation_file_name"] = filename
            # explicit remove flag from UI
            remove_flag = str(form.get("remove_image", "")).strip().lower() in ("1","true","yes","on")
            if remove_flag and "vacation_file_name" not in data:
                data["vacation_file_name"] = ""
            admin_user_id = form.get("admin_user_id")
        else:
            data = request.get_json()
            admin_user_id = data.get("admin_user_id") if data else None
            if data and (not data.get("country_id")) and data.get("country_name"):
                created = C.create_country(str(data.get("country_name")).strip())
                if isinstance(created, list) and created:
                    data["country_id"] = created[0].get("country_id")
                elif isinstance(created, dict):
                    data["country_id"] = created.get("country_id")
        # allow partial update; data may include any subset of fields including vacation_file_name
        if not data:
            return jsonify ({"Error":"Missing values or data empty"}), 400
        if not data:
            return jsonify({"Error": "No data provided"}), 400
        if "vacation_price" in data:
            if float(data["vacation_price"]) > 10000 or float(data["vacation_price"]) < 0: #הופך לפלואט שגם אם המשתמש בטעות יכניס עם גרשיים אז זה יחזיר את זה למספר ויכניס בלי שיקריס את השרת 
                return jsonify({"Error": "vacation_price cant be lower then 0 or high then 10000"}), 400
            
        # admin guard
        try:
            admin_id = int(admin_user_id) if admin_user_id is not None else None
        except Exception:
            admin_id = None
        if admin_id is None:
            return jsonify({"Error": "Missing admin_user_id"}), 403
        admin_user = U.show_user_by_id(admin_id)
        if not admin_user or int(admin_user.get("role_id", 2)) != 1:
            return jsonify({"Error": "Only admin can update vacations"}), 403

        result = V.update_vacation_by_id(vacation_id, data)
        if "Error" in result:
            return jsonify(result), 400
        # if image was removed or replaced, and the old file is a local upload and is no longer used, delete it
        try:
            old_name = existing_filename or ""
            new_name = data.get("vacation_file_name", None)
            # decide whether the old file should be deleted
            def is_http(value: str) -> bool:
                return isinstance(value, str) and value.lower().startswith(("http://","https://"))
            if old_name and not is_http(old_name):
                should_delete = False
                if new_name is not None:
                    if new_name == "" or new_name != old_name:
                        should_delete = True
                # if set to empty, or set to a different file, consider deletion
                if should_delete:
                    # ensure no other vacations reference this file
                    try:
                        from models.vacations_model import Vacations_Model as _VM
                        if _VM.count_file_usage(old_name) <= 1:
                            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], old_name)
                            if os.path.exists(file_path):
                                os.remove(file_path)
                    except Exception:
                        pass
        except Exception:
            pass
        return jsonify(result), 201
        
    
    @staticmethod
    def delete_vacation_by_id(vacation_id):
        # admin guard via query or json
        admin_user_id = request.args.get('admin_user_id')
        if not admin_user_id and request.is_json:
            body = request.get_json(silent=True) or {}
            admin_user_id = body.get('admin_user_id')
        try:
            admin_id = int(admin_user_id) if admin_user_id is not None else None
        except Exception:
            admin_id = None
        if admin_id is None:
            return jsonify({"Error": "Missing admin_user_id"}), 403
        admin_user = U.show_user_by_id(admin_id)
        if not admin_user or int(admin_user.get("role_id", 2)) != 1:
            return jsonify({"Error": "Only admin can delete vacations"}), 403
        result = V.delete_vacation_by_id(vacation_id)
        return jsonify(result)
        