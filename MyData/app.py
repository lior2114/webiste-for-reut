from flask import Flask, Blueprint, send_from_directory
import os
from flask_cors import CORS
from routes.countries_routes import countries_bp
from routes.roles_routes import roles_bp
from routes.users_routes import users_bp
from routes.vacations_routes import vacations_bp
from routes.likes_routes import likes_bp
from routes.bans_routes import bans_bp
from models.countries_model import Country_Model as c
from models.roles_model import Role_Model as R
from models.users_model import Users_Model as U
from models.vacations_model import Vacations_Model as V
from models.likes_model import Likes_Model as L
from models.bans_model import Bans_Model as B

app = Flask (__name__)
CORS(app)
app.register_blueprint(countries_bp)
app.register_blueprint(roles_bp)
app.register_blueprint(users_bp)
app.register_blueprint(vacations_bp)
app.register_blueprint(likes_bp)
app.register_blueprint(bans_bp)

# File uploads configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

c.create_table()
R.create_table()
U.create_table()
V.create_table()
B.create_table()
L.create_table()

if (__name__ == "__main__"):
    app.run (debug=True, host = "0.0.0.0", port = 5000)