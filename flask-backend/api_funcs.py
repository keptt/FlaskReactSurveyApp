from app_init import User, Response, Survey, Question, ResponderAnswer, UserSchema, QuestionSchema, ResponderAnswerSchema, SurveySchema, db, app

from flask import request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from collections import Counter
from functools import wraps
import datetime

from sqlalchemy import exc
from sqlalchemy import and_
from sqlalchemy import func
import uuid
import jwt


# begining of the url
COMMON_PART = '/api'
# general error msg for the unknown error on the backend side, usually cought in the last except levels
UNKNOWN_ERROR_TEXT=  'Unknown error'


user_schema         = UserSchema()
users_schema        = UserSchema(many=True)
question_schema     = QuestionSchema()
questions_schema    = QuestionSchema(many=True)
answer_schema       = ResponderAnswerSchema()
answers_schema      = ResponderAnswerSchema(many=True)
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
            err_msg = 'No authorization information. Please log in'
            return make_response(err_msg, 401, {'message' : err_msg})

        try:
            data         = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.get(data['id'])
        except:
            err_msg = 'Provided token invalid. Please log in'
            return make_response(err_msg, 401, {'message' : err_msg})

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

    try:
        validate_email(email_)
    except EmailInvalid as ex:
        return make_response(str(ex), 400, {'message' : str(ex)})

    try:
        new_user = User(username=username_, password=hashed_password, email=email_)

        db.session.add(new_user)
        db.session.commit()
    except exc.IntegrityError:
        err_msg = 'User with the same username or email already exists'
        return make_response(err_msg, 400, {'message' : err_msg})
    except exc.SQLAlchemyError:
        return make_response(UNKNOWN_ERROR_TEXT, 400, {'message' :  UNKNOWN_ERROR_TEXT})

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
    Create-surveys input json has the following structure:
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

    new_survey = Survey(name=survey_name, description=survey_description, hash_key=uuid.uuid4().hex)

    try:
        counted_elements = dict(Counter(questions_text))
    except:
        err_msg = 'Questions have unknown type. Bad request'
        return make_response(err_msg, 400, {'message' : err_msg})


    if not counted_elements:
        err_msg = 'Survey cannot be empty'
        return make_response(err_msg, 400, {'message' : err_msg})

    try:
        db.session.add(new_survey) # add survey object to session, commit and check for exceptions
        db.session.commit()
    except exc.IntegrityError:
        err_msg = 'Survey with identical name already exists'
        return make_response(err_msg, 400, {'message' : err_msg})
    except exc.SQLAlchemyError:
        # need to log this somewhere in backend logs. Return empty dict so that user does not see db specific error msg
        return make_response(UNKNOWN_ERROR_TEXT, 400, {'message' : UNKNOWN_ERROR_TEXT})

    question_objects = []     # save Question model objects to an array in order to bulk insert them to db later (insert in one swoop, without making calling db inside loop)
    for question_text in questions_text:
        if counted_elements[question_text] > 1:
            err_msg = f'Duplicated question: "{question_text}"'
            return make_response(err_msg, 400, {'message' : err_msg})

        question_objects.append(Question(text=question_text, survey_id=new_survey.obj_id))

    db.session.bulk_save_objects(question_objects)      # bulk insert all presaved Question objects
    # db.session.commit()

    new_survey.date_created = datetime.datetime.utcnow() # insert survey creation date after all survey questions were added to db
    db.session.commit()

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
def create_responder_answers(survey_hashkey):
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

    # make some checks, only after that add and commit response
    if survey:
        if len(answers_text_dict) != len(survey.questions):
            err_msg = 'Survey is incomplete, not all questions answered'
            return make_response(err_msg, 400, {'message' : err_msg})
        if set(answers_text_dict.keys()) != set(question.obj_id for question in survey.questions):
            err_msg = 'Wrong question ids given'
            return make_response(err_msg, 400, {'message' : err_msg})

        db.session.add(response)
        db.session.commit()

        user_responder_objects = [] # list of answers to be inserted to db

        for questionid, answer_text in answers_text_dict.items():
            new_responder_answer = ResponderAnswer(question_id=questionid, response_id=curr_response_id, answer=answer_text)
            user_responder_objects.append(new_responder_answer)

        db.session.bulk_save_objects(user_responder_objects)
        db.session.commit()
    else:
        err_msg = 'Survey does not exist'
        return make_response(err_msg, 400, {'message' : err_msg})

    return {'success' : len(answers_text_dict)}


@app.route(f'{COMMON_PART}/answers/sr/<survey_hashkey>', methods=['GET'])
@auth_check
def get_user_answers(current_user, survey_hashkey):
    """"
    Return array structure:
    [
        {
            'question_id': '<question id>'
            , 'response_id': '<response id>'
            , 'survey_id': '<survey id>'
            , 'text': '<queson text>'
            , 'answer': '<answer text>'
            , 'date_responded': ''
        },...
    ]
    """
    survey       = Survey.query.filter_by(hash_key=survey_hashkey).first()
    responder_answers = {}

    if survey:
        question_ids =  [question.obj_id for question in survey.questions]

        responder_answers = db.session.query(ResponderAnswer.question_id
                                    , ResponderAnswer.response_id
                                    , ResponderAnswer.answer
                                    , Response.date_responded
                                    , Question.survey_id
                                    , Question.text
                                    )\
                                    .join(Response, Response.obj_id == ResponderAnswer.response_id)\
                                    .join(Question, Question.obj_id == ResponderAnswer.question_id)\
                                    .filter(and_(ResponderAnswer.question_id.in_(question_ids))) # use join to get data of when answers were received and what is the text of the question
    else:
        err_msg = 'Survey does not exist'
        return make_response(err_msg, 400, {'message' : err_msg})

    results = []

    for answer in responder_answers:
        answer_obj  = {}
        answer_obj['question_id']       = answer.question_id
        answer_obj['response_id']       = answer.response_id
        answer_obj['survey_id']         = answer.survey_id
        answer_obj['text']              = answer.text
        answer_obj['answer']            = answer.answer
        answer_obj['date_responded']    = answer.date_responded
        results.append(answer_obj)

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
        err_msg = 'Could not verify; Credential info incomplete; Login required'
        return make_response(err_msg, 401, {'message' : err_msg})

    # get appropriate user from user table
    user = User.query.filter_by(username=auth_info.username).first()

    # if user does not exist in the database
    if not user:
        return make_response(CRED_INVALID, 401, {'message' : CRED_INVALID})

    # if user exists in the database and passwords match create access token with experation after 24 hours
    if check_password_hash(user.password, auth_info.password):
        token = jwt.encode({'id' : user.obj_id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'])
        # attach user object and auth token to reply
        return {'token' : token.decode('UTF-8')
                , 'user' : user_schema.jsonify(user).json
                }

    # if password was incorrect
    return make_response(CRED_INVALID, 401, {'message' : CRED_INVALID})
