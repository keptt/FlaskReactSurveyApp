#!/bin/bash

cd react-frontend

npm build

cd ..

cp deployment-template-files/app.py flask-backend/
cp deployment-template-files/app_init.py flask-backend/

. flask-backend/env/scripts/activate

pip3 install gunicorn

cd flask-backend/

gunicorn -b :3000 api:app
