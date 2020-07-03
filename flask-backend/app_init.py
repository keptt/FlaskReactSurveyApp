"""
    Flask REST API app and db models initialization routine
"""
# standart lib modules
import os

# third party modules
from flask import Flask, request, jsonify, make_response
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import uuid
import datetime


# user created modules
from validate import validate_email, EmailInvalid
# from models import User, ResponderAnswer, Question, Survey, UserSchema, ResponderAnswerSchema, QuestionSchema, SurveySchema


# secret key to encrypt user auth tokens
SECRET_KEY_ENV_VAR = 'SECRET_KEY_SURVEY_APP'


# init app
app = Flask(__name__)

# allow all domains to get rid of No 'Access-Control-Allow-Origin' header is present on the requested resource
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))

# config database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get(SECRET_KEY_ENV_VAR) or uuid.uuid4().hex


# Create db and marshmallow instances for work with db and its objects serialization
db = SQLAlchemy(app)
ma = Marshmallow(app)


class User(db.Model):
    """
    Model of admin user
    """
    __tablename__ = 'user'
    obj_id        = db.Column(db.Integer, primary_key=True)
    # public_id    = db.Column(db.String(50), unique=True, nullable=False)
    username      = db.Column(db.String(30), nullable=False, unique=True)
    password      = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(100), nullable=False, unique=True)
    date_created  = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Response(db.Model):
    """
    Model of response - instance of responder (anonymous user) sending a response to a survey
    Saves time when when response to a survey was received
    """
    __tablename__     = 'response'
    obj_id            = db.Column(db.Integer, primary_key=True)
    date_responded    = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    responder_answers = db.relationship('ResponderAnswer', cascade='all,delete', back_populates='response')


class Survey(db.Model):
    """
    Model of the survey with general info, hash_key and array of corresponding questions. Questions are stored separately in Question model
    """
    __tablename__ = 'survey'
    obj_id        = db.Column(db.Integer, primary_key=True)
    hash_key      = db.Column(db.Integer, unique=True, nullable=False) # hash key is used when creating survey url # TODO add Index by hash_key
    name          = db.Column(db.String(100), unique=True, nullable=False)
    description   = db.Column(db.Text, nullable=True)
    date_created  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    questions     = db.relationship('Question', cascade='all,delete', back_populates='survey')


class Question(db.Model):
    __tablename__     = 'question'
    obj_id            = db.Column(db.Integer, primary_key=True)
    survey_id         = db.Column(db.Integer, db.ForeignKey(Survey.obj_id))
    text              = db.Column(db.Text, nullable=False)

    survey            = db.relationship('Survey', back_populates='questions')
    responder_answers = db.relationship('ResponderAnswer', cascade='all,delete', back_populates='question')


class ResponderAnswer(db.Model):
    """
    Model of answers for each question of given survey.
    Each answer has relationship with question and question has relationship with survey
    Also each answer has a relationship with particular response (time of response can be taken from there).

    Composite primary key be response_id and question_id (each question has unique id). Question ids can be duplicated only
    in terms of different responses
    """
    __tablename__ = 'responder_answer'
    response_id   = db.Column(db.Integer, db.ForeignKey(Response.obj_id), primary_key=True, autoincrement=False)
    question_id   = db.Column(db.Integer, db.ForeignKey(Question.obj_id), primary_key=True, autoincrement=False)
    answer        = db.Column(db.Text)

    response      = db.relationship('Response', uselist=False, back_populates='responder_answers')
    question      = db.relationship('Question', uselist=False, back_populates='responder_answers')


# Create Meta Schemas for quick jsonifying of db model objects
class UserSchema(ma.Schema):
    class Meta:
        fields = ('obj_id', 'username', 'email', 'is_admin', 'date_created')


class QuestionSchema(ma.Schema):
    class Meta:
        fields = ('obj_id', 'survey_id', 'text')


class SurveySchema(ma.Schema):
    class Meta:
        fields = ('obj_id', 'hash_key', 'name', 'description', 'date_created')


class ResponderAnswerSchema(ma.Schema):
    class Meta:
        fields = ('response_id', 'survey_id', 'question_id', 'answer')
