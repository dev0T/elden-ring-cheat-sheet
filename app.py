# By Teryn Alves
# 100350471
# Documentation is located in the README.MD

# source env/bin/activate
# deactivate
import os, re
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_pymongo import PyMongo
from pymongo.collection import ReturnDocument
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    create_access_token,
    get_jwt_identity,
)
from dotenv import load_dotenv
from flask_cors import CORS


load_dotenv()

app = Flask(__name__, static_url_path="", static_folder="client/build")
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.secret_key = os.environ.get("SECRET_KEY")
app.config["ENV"] = os.environ.get("FLASK_ENV")
app.config["JWT_SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)
app.config["DEBUG"] = os.environ.get("DEBUG")
app.config["MONGO_URI"] = os.environ.get("DATABASE_URL")
jwt = JWTManager(app)
mongo = PyMongo(app)
CORS(app)

dbUsers = mongo.db.Users

@app.route("/", defaults={"path": ""})
def serve(path):
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    givenEmail = data["email"]

    if not re.match(r"[^@]+@[^@]+\.[^@]+", givenEmail):
        return jsonify(message="Please provide an email address."), 400
    elif dbUsers.find_one({"email": givenEmail}):
        return jsonify(message="That email already exists."), 409
    else:
        newUser = {}
        newUser["email"] = givenEmail
        newUser["password"] = generate_password_hash(data["password"], method="sha256")
        newUser["profiles"] = [{"name": "Default", "checklist": {}}]

        dbUsers.insert_one(newUser)
        access_token = create_access_token(identity=givenEmail)

        return (
            jsonify(message="User created successfully.", user_identity=access_token),
            201,
        )


@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()
    givenEmail = data["email"]
    givenPassword = data["password"]
    user = dbUsers.find_one({"email": givenEmail})

    if user is not None:
        if check_password_hash(user["password"], givenPassword):
            access_token = create_access_token(identity=user["email"])
            return jsonify(message="Login succeeded!", user_identity=access_token)
        else:
            return jsonify(message="Bad email or password"), 401
    else:
        return jsonify(message="User not found."), 404


@app.route("/api/user", methods=["GET", "POST"])
@jwt_required()
def user():
    current_user = get_jwt_identity()

    if request.method == "POST":
        data = request.get_json()
        user = dbUsers.find_one_and_update(
            {"email": current_user},
            {"$set": {"profiles": data}},
            {"_id": 0, "password": 0},
            return_document=ReturnDocument.AFTER,
        )
        if user is not None:
            return jsonify(user)
        else:
            return jsonify(message="User not found."), 404

    elif request.method == "GET":
        user = dbUsers.find_one({"email": current_user}, {"_id": 0, "password": 0})
        if user is not None:
            return jsonify(user)
        else:
            return jsonify(message="User not found."), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0")
