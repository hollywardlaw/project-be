from flask import Flask
from flask import request
import json
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)

client = MongoClient('localhost', 27017)

db = client.test2_database

users = db.users


@app.route("/")
def hello():
    return "Hello!"

# Add a new user
@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = json.loads(request.data)
        if users.find_one({"username": data["username"]}) == "None":
            status = db.users.insert_one(data)
            print(status)
            return dumps({'message': 'SUCCESS'})
        else:
            return dumps({"message": 'USERNAME ALREADY EXISTS'})
    except Exception as e:
        return dumps({'error': str(e)})


# get all users
@app.route('/users', methods=['GET'])
def get_all_users():
    try:
        for user in users.find():
            print(user)
        return dumps({"message": "SUCCESS"})
    except Exception as e:
        return dumps({"error": str(e)})


# get user by username
@app.route('/users/<username>', methods=["GET"])
def get_user_by_username(username):
    try:
        one_user = users.find_one({"username": username})
        print(one_user)
        return dumps({"message": "SUCCESS"})
    except Exception as e:
        return dumps({"message": str(e)})
