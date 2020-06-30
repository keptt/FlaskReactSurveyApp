"""
    Database creation and initialization steps; Has to run before running flask rest api - app.py - in order to set things up
"""
from app import db, User
from os import environ
from werkzeug.security import generate_password_hash


BROODMASTER_PASSWORD_ENV_VAR = 'BROODMASTER_PASSWORD_ENV_VAR'

# check env var for the password for initial admin - broodmaster or use 'default' as the password
BROODMASTER_PASSWORD = environ.get(BROODMASTER_PASSWORD_ENV_VAR) or 'default'

# creat db
db.create_all()

# create initial admin broodmaster
user = User(username='broodmaster', password=generate_password_hash(BROODMASTER_PASSWORD, method='sha256'), email='contact_broodmaster@gmail.com', is_admin=True)

db.session.add(user)
db.session.commit()
