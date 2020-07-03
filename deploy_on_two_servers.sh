#!/bin/bash

# configure frontend

sudo apt-get install nginx

sudo rm /etc/nginx/sites-enabled/default

sudo cp deployment-template-files/my-surveys-app.nginx /etc/nginx/sites-available/

sudo ln -s /etc/nginx/sites-available/my-surveys-app.nginx /etc/nginx/sites-enabledavailable/my-surveys-app.nginx # config file for frontend that will be served from nginx

sudo systemctl reload nginx


# configure backend

. flask-backend/env/scripts/activate

pip3 install gunicorn

sudo cp ent-template-files/my-surveys-app.service /etc/systemd/system/my-surveys-app.service    # add service config for backend api; we will be then able to run backend through systemctl (with autorestart)

sudo systemctl deamon-reload

sudo systemctl start my-surveys-app
