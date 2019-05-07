from flask import Flask
from flask import request
import json
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)

client = MongoClient('localhost', 27017)

db = client.test1_database

users = db.users


@app.route("/")
def hello():
    return "Hello!"


@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = json.loads(request.data)
        status = db.users.insert_one({data["username"]: data})
        return dumps({'message': 'SUCCESS'})
    except Exception as e:
        return dumps({'error': str(e)})


@app.route('/users', methods=['GET'])
def get_all_users():
    try:
        for user in users.find():
            print(user)
        return dumps({"message": "SUCCESS"})
    except Exception as e:
        return dumps({"error": str(e)})


@app.route('/users/<username>', methods=["GET"])
def get_user_by_username():
    try:
        one_user = users.find({"username": "fred"})
        print(one_user)
        return dumps({"message": "SUCCESS"})
    except Exception as e:
        return dumps({"message": str(e)})
