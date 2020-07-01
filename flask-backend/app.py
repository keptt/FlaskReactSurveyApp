"""
    Flask REST API
"""
# standart lib modules
import os
from werkzeug.security import generate_password_hash, check_password_hash
from collections import Counter
from functools import wraps
import datetime

# third party modules
from flask import Flask, request, jsonify
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import exc
from sqlalchemy import and_
from sqlalchemy import func
import uuid
import jwt

# user created modules
from validate import validate_email, EmailInvalid
# from models import User, UserAnswer, Question, Survey, UserSchema, UserAnswerSchema, QuestionSchema, SurveySchema


# begining of the url
COMMON_PART = '/api'
# secret key to encrypt user auth tokens
SECRET_KEY_ENV_VAR = 'SECRET_KEY_SURVEY_APP'

# init app
app = Flask(__name__)

# allow all domains to get rid of No 'Access-Control-Allow-Origin' header is present on the requested resource
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))

# config database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.join(basedir, 'database'), 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get(SECRET_KEY_ENV_VAR) or uuid.uuid4().hex


# Create db and marshmallow instances for work with db and its objects serialization
db = SQLAlchemy(app)
ma = Marshmallow(app)


class User(db.Model):
    __tablename__ = 'user'
    obj_id        = db.Column(db.Integer, primary_key=True)
    # public_id    = db.Column(db.String(50), unique=True, nullable=False)
    username      = db.Column(db.String(30), nullable=False, unique=True)
    password      = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(100), nullable=False, unique=True)
    date_created  = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Response(db.Model):
    __tablename__   = 'response'
    obj_id          = db.Column(db.Integer, primary_key=True)
    date_responded  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    user_answers   = db.relationship('UserAnswer', cascade='all,delete', back_populates='response')


class Survey(db.Model):
    __tablename__ = 'survey'
    obj_id        = db.Column(db.Integer, primary_key=True)
    hash_key      = db.Column(db.Integer, unique=True, nullable=False) # hash key is used when creating survey url
    name          = db.Column(db.String(100), unique=True, nullable=False)
    description   = db.Column(db.Text, nullable=True)
    date_created  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    questions     = db.relationship('Question', cascade='all,delete', back_populates='survey')
    # user_answers   = db.relationship('UserAnswer', cascade='all,delete', backref='survey')


class Question(db.Model):
    __tablename__ = 'question'
    obj_id        = db.Column(db.Integer, primary_key=True)
    survey_id     = db.Column(db.Integer, db.ForeignKey(Survey.obj_id))
    text          = db.Column(db.Text, nullable=False)

    survey         = db.relationship('Survey', back_populates='questions')
    user_answers   = db.relationship('UserAnswer', cascade='all,delete', back_populates='question')


class UserAnswer(db.Model):
    __tablename__ = 'user_answer'
    response_id   = db.Column(db.Integer, db.ForeignKey(Response.obj_id), primary_key=True, autoincrement=False)
    question_id   = db.Column(db.Integer, db.ForeignKey(Question.obj_id), primary_key=True, autoincrement=False)
    # survey_id     = db.Column(db.Integer, db.ForeignKey(Survey.obj_id), nullable=False)
    answer        = db.Column(db.Text)

    response      = db.relationship('Response', uselist=False, back_populates='user_answers')
    question      = db.relationship('Question', uselist=False, back_populates='user_answers')


# Create Schemas
class UserSchema(ma.Schema):
    class Meta:
        fields = ('obj_id', 'username', 'email', 'is_admin', 'date_created')


class QuestionSchema(ma.Schema):
    class Meta:
        fields = ('obj_id', 'survey_id', 'text')


class SurveySchema(ma.Schema):
    class Meta:
        fields = ('obj_id', 'hash_key', 'name', 'description', 'date_created')


class UserAnswerSchema(ma.Schema):
    class Meta:
        fields = ('response_id', 'survey_id', 'question_id', 'answer')


# Init Schemas
user_schema         = UserSchema()
users_schema        = UserSchema(many=True)
question_schema     = QuestionSchema()
questions_schema    = QuestionSchema(many=True)
answer_schema       = UserAnswerSchema()
answers_schema      = UserAnswerSchema(many=True)
survey_schema       = SurveySchema()


def auth_check(func):
    """
    Decorator to check if user access token is valid
    """
    @wraps(func)
    def inner(*args, **kwargs):
        token = None

        # check header 'access-token'
        if 'access-token' in request.headers:
            token = request.headers['access-token']

        if not token:
            return {'message' : 'No authorization information. Please log in', 'err_code' : 401}

        try:
            data         = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.get(data['id'])
        except:
            return {'message' : 'Provided token invalid. Please log in', 'err_code' : 401}

        return func(current_user, *args, **kwargs)

    return inner


@app.route(f'{COMMON_PART}/users/<user_id>', methods=['GET'])
@auth_check
def get_user(current_user, user_id):
    user = User.query.get(user_id)
    return user_schema.jsonify(user)


@app.route(f'{COMMON_PART}/users', methods=['GET'])
@auth_check
def get_users(current_user):
    all_users = User.query.all()
    result    = users_schema.dump(all_users)
    return users_schema.jsonify(result)


@app.route(f'{COMMON_PART}/users', methods=['POST'])
def create_user():
    username_       = request.json['username']
    hashed_password = generate_password_hash(request.json['password'], method='sha256')
    email_          = request.json['email']
    # public_id_      = str(uuid.uuid4())

    try:
        validate_email(email_)
    except EmailInvalid as ex:
        return {'message' : str(ex)}

    try:
        new_user = User(username=username_, password=hashed_password, email=email_)

        db.session.add(new_user)
        db.session.commit()
    except exc.IntegrityError:
        return {'message' : 'User with the same username or email already exists'}
    except exc.SQLAlchemyError:
        return {}

    return user_schema.jsonify(new_user)


@app.route(f'{COMMON_PART}/users/<user_id>', methods=['DELETE'])
@auth_check
def delete_user(current_user, user_id):
    user = User.query.get(user_id)

    if user:
        db.session.delete(user)
        db.session.commit()

    return user_schema.jsonify(user)


@app.route(f'{COMMON_PART}/surveys/<surveyid>', methods=['GET'])
@auth_check
def get_survey(current_user, surveyid):
    result = {}
    survey = Survey.query.get(surveyid)
    if survey:
        result = survey_schema.jsonify(survey).json
        result['questions_qty'] = len(survey.questions)
    return jsonify(result)


@app.route(f'{COMMON_PART}/surveys/hsh/<hashkey>', methods=['GET'])
def get_survey_by_hash_key(hashkey):
    result = {}
    survey = Survey.query.filter_by(hash_key=hashkey).first()
    if survey:
        result = survey_schema.jsonify(survey).json
        result['questions_qty'] = len(survey.questions)
    return jsonify(result)


@app.route(f'{COMMON_PART}/surveys', methods=['GET'])
@auth_check
def get_surveys(current_user):
    all_surveys = Survey.query.all()
    result = []

    for survey in all_surveys:
        json_obj = survey_schema.jsonify(survey).json
        json_obj['questions_qty'] = len(survey.questions)
        result.append(json_obj)

    return jsonify(result)


@app.route(f'{COMMON_PART}/surveys', methods=['POST'])
@auth_check
def create_survey(current_user):
    """
    Create surveys json has the following structure:
    {
        "name" : "<survey_name>"
        , "description" : "<survey_desc>"
        , "questions" : ["<question_one_text>", "<question_two_text>"...]
    }
    No duplicates in questions for a particular survey allowed
    """
    survey_name        = request.json['name']
    survey_description = request.json['description']

    questions_text     = request.json['questions']

    try:
        new_survey = Survey(name=survey_name, description=survey_description, hash_key=uuid.uuid4().hex)
        db.session.add(new_survey)
        db.session.commit()
    except exc.IntegrityError:
        return {'message' : 'Survey with identical name already exists'}
    except exc.SQLAlchemyError:
        # need to log this somewhere. Return empty dict so that user does not see db specific error msg
        return {}

    counted_elements = dict(Counter(questions_text))

    if not counted_elements:
        db.session.delete(new_survey)
        db.session.commit()
        return {'message' : f'Survey cannot be empty'}


    for question_text in questions_text:
        if counted_elements[question_text] > 1:
            db.session.delete(new_survey)
            db.session.commit()
            return {'message' : f'Duplicated question: "{question_text}"'}

        question = Question(text=question_text, survey_id=new_survey.obj_id)
        db.session.add(question)
        db.session.commit()

    new_survey.date_created = datetime.datetime.utcnow()

    result = survey_schema.jsonify(new_survey).json
    result['questions_qty'] = len(counted_elements)

    return jsonify(result)


@app.route(f'{COMMON_PART}/questions/qt/<questionid>', methods=['GET'])
def get_question(questionid):
    question = Question.query.get(questionid)
    return question_schema.jsonify(question)


@app.route(f'{COMMON_PART}/questions/sr/<surveyid>', methods=['GET'])
def get_questions(surveyid):
    result = {}
    survey  = Survey.query.filter_by(obj_id=surveyid).first()
    if survey:
        result  = questions_schema.dump(survey.questions)
    return questions_schema.jsonify(result)


# @app.route(f'{COMMON_PART}/questions/sr/hsh/<hashkey>', methods=['GET'])
# def get_questions_by_hashkey(hashkey):
#     result = {}
#     survey  = Survey.query.filter_by(hash_key=hashkey).first()
#     if survey:
#         result  = questions_schema.dump(survey.questions)
#     return questions_schema.jsonify(result)



@app.route(f'{COMMON_PART}/questions/sr/hsh/<hashkey>', methods=['GET'])
def get_questions_and_survey_by_hashkey(hashkey):
    """
    Get questions and survey info by hashkey survey attribute

    Return format:
    {
        "survey_id" : "<survey_id>"
        , "name" : "<survey_name>"
        , "description" : "<survey_desc>"
        , "questions" : [
            {
                "obj_id"
                , "text"
            }...
        ]
    }
    """
    result = {}
    survey  = Survey.query.filter_by(hash_key=hashkey).first()
    if survey:
        questions = questions_schema.dump(survey.questions)
        result['survey_id']     = survey.obj_id
        result['name']          = survey.name
        result['description']   = survey.description
        result['questions']     = questions_schema.jsonify(questions).json
    return result


@app.route(f'{COMMON_PART}/answers/sr/<survey_hashkey>', methods=['POST'])
def create_user_answers(survey_hashkey):
    """
    Create answers of a particular anonymous user for the whole survey
    input data has the following format {"answers" : {"<question_id>" : "<answer_text>"}}
    """
    answers_text_dict = {int(key): value for key, value in request.json['answers'].items()}

    survey = Survey.query.filter_by(hash_key=survey_hashkey).first()

    # get response id as max response id + 1; response id is the id of each servey submition
    curr_response_id = db.session.query(func.max(Response.obj_id).label('max_response_id')).one().max_response_id
    curr_response_id = curr_response_id + 1 if curr_response_id else 1

    # add new response object to db to store notion of when survey has been answered
    response = Response(date_responded=datetime.datetime.utcnow())
    db.session.add(response)
    db.session.commit()

    if survey:
        # print(len(answers_text_dict))
        # print(len(survey.questions))
        if len(answers_text_dict) != len(survey.questions):
            db.session.delete(response)
            db.session.commit()
            return {'message' : 'Survey is incomplete, not all questions answered'}
        # print(set(answers_text_dict.keys()))
        # print(set(question.obj_id for question in survey.questions))
        if set(answers_text_dict.keys()) != set(question.obj_id for question in survey.questions):
            db.session.delete(response)
            db.session.commit()
            return {'message' : 'Wrong question ids given'}

        for questionid, answer_text in answers_text_dict.items():
            new_user_answer = UserAnswer(question_id=questionid, response_id=curr_response_id, answer=answer_text)
            print(answer_schema.jsonify(new_user_answer).json)

            db.session.add(new_user_answer)
            db.session.commit()

        # db.session.commit()
    else:
        db.session.delete(response)
        db.session.commit()
        return {'message' : 'Survey does not exist'}

    return {'success' : len(answers_text_dict)}


@app.route(f'{COMMON_PART}/answers/sr/<survey_hashkey>', methods=['GET'])
@auth_check
def get_user_answers(current_user, survey_hashkey):
    survey       = Survey.query.filter_by(hash_key=survey_hashkey).first()
    user_answers = {}

    if survey:
        question_ids =  [question.obj_id for question in survey.questions]

        # user_answers = UserAnswer.query

        user_answers = db.session.query(UserAnswer.question_id
                                    , UserAnswer.response_id
                                    , UserAnswer.answer
                                    , Response.date_responded
                                    , Question.survey_id
                                    , Question.text
                                    )\
                                    .join(Response, Response.obj_id == UserAnswer.response_id)\
                                    .join(Question, Question.obj_id == UserAnswer.question_id)\
                                    .filter(and_(UserAnswer.question_id.in_(question_ids)))
        # print(user_answers)
        # print('question ids: ', question_ids)
        # user_answers = user_answers.all()
    else:
        return {'message' : 'Survey does not exist'}

    results     = []

    # print(user_answers)

    for answer in user_answers:
        answer_obj  = {}
        answer_obj['question_id']       = answer.question_id
        answer_obj['response_id']       = answer.response_id
        answer_obj['survey_id']         = answer.survey_id
        answer_obj['text']              = answer.text
        answer_obj['answer']            = answer.answer
        answer_obj['date_responded']    = answer.date_responded
        results.append(answer_obj)

    # print(results)
    # return answers_schema.jsonify(answers_schema.dump(user_answers))
    return jsonify(tuple(results))


@app.route(f'{COMMON_PART}/check/login')
@auth_check
def check_login(current_user):
    """
    Checks if user is logged in
    """
    return {'success' : 'true'}



@app.route(f'{COMMON_PART}/login')
def login():
    CRED_INVALID = 'Password or username invalid!'

    # get authorization info from request obj
    auth_info = request.authorization

    if not auth_info or not auth_info.username or not auth_info.password:
        # return make_response('Could not verify', 401, {'WWW-Authenticate' : 'Basic realm="Login required!"'})
        return {'message' : 'Could not verify; Credential info incomplete; Login required', 'err_code' : 401}

    # get appropriate user from user table
    user = User.query.filter_by(username=auth_info.username).first()
    print('username:', user.username, 'pass:', user.password)

    # if user does not exist in the database
    if not user:
        return {'message' : CRED_INVALID, 'err_code' : 401}

    # if user exists in the database and passwords match create access token with experation after 24 hours
    print('given pass:', user.password)
    print('actual pass:', auth_info.password)
    if check_password_hash(user.password, auth_info.password):
        token = jwt.encode({'id' : user.obj_id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'])
        # attach user object and auth token to reply
        return {'token' : token.decode('UTF-8')
                , 'user' : user_schema.jsonify(user).json
                }

    # if password was incorrect
    return {'message' : CRED_INVALID, 'err_code' : 401}


# run server
if __name__ == '__main__':
    app.run(debug=(False if os.environ.get('FLASK_PROD_MODE') else True))


# get user answers
