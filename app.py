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
from sqlalchemy import exc
from sqlalchemy import and_
import uuid
import jwt

# user created modules
from validate import validate_email, EmailInvalid
# from models import User, UserAnswer, Question, Survey, UserSchema, UserAnswerSchema, QuestionSchema, SurveySchema


SECRET_KEY_ENV_VAR = 'SECRET_KEY_SURVEY_APP'

# init app
app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))

# config database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
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
    is_admin      = db.Column(db.Boolean, default=False)
    date_created  = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    user_answers   = db.relationship('UserAnswer', cascade='all,delete', back_populates='user')


class Survey(db.Model):
    __tablename__ = 'survey'
    obj_id        = db.Column(db.Integer, primary_key=True)
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
    user_id       = db.Column(db.Integer, db.ForeignKey(User.obj_id), primary_key=True, autoincrement=False)
    question_id   = db.Column(db.Integer, db.ForeignKey(Question.obj_id), primary_key=True, autoincrement=False)
    # survey_id     = db.Column(db.Integer, db.ForeignKey(Survey.obj_id), nullable=False)
    answer        = db.Column(db.Text)

    user          = db.relationship('User', uselist=False, back_populates='user_answers')
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
        fields = ('obj_id', 'name', 'description', 'date_created')


class UserAnswerSchema(ma.Schema):
    class Meta:
        fields = ('user_id', 'survey_id', 'question_id', 'answer')


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


def admin_check(func):
    """
    Decorator to check if user has admin privilages
    """
    @wraps(func)
    def inner(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return {'message' : 'Not enough privilages', 'err_code' : 401}

        return func(current_user, *args, **kwargs)

    return inner


@app.route('/users/<user_id>', methods=['GET'])
@auth_check
@admin_check
def get_user(current_user, user_id):
    user = User.query.get(user_id)
    return user_schema.jsonify(user)


@app.route('/users', methods=['GET'])
@auth_check
@admin_check
def get_users(current_user):
    all_users = User.query.all()
    result    = users_schema.dump(all_users)
    return users_schema.jsonify(result)


@app.route('/users', methods=['POST'])
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


@app.route('/users/<user_id>', methods=['PUT'])
@auth_check
@admin_check
def promote_user(current_user, user_id):
    user = User.query.get(user_id)

    if user:
        user.is_admin = True
        db.session.commit()

    return user_schema.jsonify(user)


@app.route('/users/<user_id>', methods=['DELETE'])
@auth_check
@admin_check
def delete_user(current_user, user_id):
    user = User.query.get(user_id)

    if user:
        db.session.delete(user)
        db.session.commit()

    return user_schema.jsonify(user)


@app.route('/surveys/<surveyid>', methods=['GET'])
def get_survey(surveyid):
    result = {}
    survey = Survey.query.get(surveyid)
    if survey:
        result = survey_schema.jsonify(survey).json
        result['questions_qty'] = len(survey.questions)
    return jsonify(result)


@app.route('/surveys', methods=['GET'])
def get_surveys():
    all_surveys = Survey.query.all()
    result = []

    for survey in all_surveys:
        json_obj = survey_schema.jsonify(survey).json
        json_obj['questions_qty'] = len(survey.questions)
        result.append(json_obj)

    return jsonify(result)


@app.route('/surveys', methods=['POST'])
@auth_check
@admin_check
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
        new_survey = Survey(name=survey_name, description=survey_description)
        db.session.add(new_survey)
        db.session.commit()
    except exc.IntegrityError:
        return {'message' : 'Survey with identical name already exists'}
    except exc.SQLAlchemyError:
        # need to log this somewhere. Return empty dict so that user does not see db specific error msg
        return {}

    counted_elements = dict(Counter(questions_text))

    if not counted_elements:
        return {'message' : f'Survey cannot be empty'}

    for question_text in questions_text:
        if counted_elements[question_text] > 1:
            return {'message' : f'Duplicated question: "{question_text}"'}

        question = Question(text=question_text, survey_id=new_survey.obj_id)
        db.session.add(question)
        db.session.commit()

    new_survey.date_created = datetime.datetime.utcnow()

    result = survey_schema.jsonify(new_survey).json
    result['questions_qty'] = len(counted_elements)

    return jsonify(result)


@app.route('/questions/qt/<questionid>', methods=['GET'])
@auth_check
def get_question(current_user, questionid):
    question = Question.query.get(questionid)
    return question_schema.jsonify(question)


@app.route('/questions/sr/<surveyid>', methods=['GET'])
@auth_check
def get_questions(current_user, surveyid):
    result = {}
    survey  = Survey.query.filter_by(obj_id=surveyid).first()
    if survey:
        result  = questions_schema.dump(survey.questions)
    return questions_schema.jsonify(result)


@app.route('/answers/sr_status/sr/<surveyid>', methods=['GET'])
@auth_check
def has_user_done_survey(current_user, surveyid):
    """
    Find if user already answered the given survey
    """
    survey = Survey.query.get(surveyid)

    if survey:
        # if survey exists it will always have at least one question attached
        # if user_id is inside the list of all the people who answered any question
        # from the survey (in our case take first question) then user has answered all of the questions since user cannot submit unfinished servey
        first_question_id = survey.questions[0].obj_id
        if UserAnswer.query.filter_by(question_id=first_question_id, user_id=current_user.obj_id).first():
            return {'success' : 'true'}
    else:
        return {'messsage' : 'Survey does not exist'}

    return {}


@app.route('/answers/sr/<surveyid>', methods=['GET'])
@auth_check
def get_user_answers(current_user, surveyid):
    survey       = Survey.query.get(surveyid)
    user_answers = {}

    if survey:
        question_ids =  [question.obj_id for question in survey.questions]

        user_answers = UserAnswer.query.filter(and_(UserAnswer.question_id.in_(question_ids), UserAnswer.user_id == current_user.obj_id)).all()
    else:
        return {'message' : 'Survey does not exist'}

    return answers_schema.jsonify(user_answers)


@app.route('/answers/sr/<surveyid>', methods=['POST'])
@auth_check
def create_user_answers(current_user, surveyid):
    """
    Create answers of a particular user for the whole survey
    data will have the following format {"answers" : {"<question_id>" : "<answer_text>"}}
    """
    answers_text_dict = request.json['answers']

    survey = Survey.query.filter_by(obj_id=surveyid).first()

    if survey:
        if len(answers_text_dict) != len(survey.questions):
            return {'message' : 'Survey is incomplete, not all questions answered'}

        for questionid, answer_text in answers_text_dict.items():
            new_user_answer = UserAnswer(question_id=questionid, user_id=current_user.obj_id, answer=answer_text)     # current_user..user_id # add exc handling and add case when number of answers not match

            db.session.add(new_user_answer)
        db.session.commit()
    else:
        return {'message' : 'Survey does not exist'}

    return {'success' : len(answers_text_dict)}


@app.route('/check/login')
@auth_check
def check_login():
    """
    Checks if user is logged in
    """
    return {'success' : 'true'}


@app.route('/check/login/admin')
@auth_check
@admin_check
def check_login_admin():
    """
    Checks if user is logged in and is admin
    """
    return {'success' : 'true'}


@app.route('/login')
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

        return {'token' : token.decode('UTF-8')}

    # if password was incorrect
    return {'message' : CRED_INVALID, 'err_code' : 401}


# run server
if __name__ == '__main__':
    app.run(debug=(False if os.environ.get('FLASK_PROD_MODE') else True))
