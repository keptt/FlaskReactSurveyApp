python -m venv env
. env/Scripts/activate

pip install -r flask-backend/requirements.txt

python flask-backend/db_init.py
python flask-backend/app.py


