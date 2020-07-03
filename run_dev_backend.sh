python3 -m venv flask-backend/env
. flask-backend/env/Scripts/activate

pip3 install -r flask-backend/requirements.txt

python3 flask-backend/db_init.py
python3 flask-backend/app.py
