chmod -R 755 "$(pwd)"

python -m venv env
. env/scripts/activate

pip3 install -r requirements.txt

npm install

python3 flask-backend/init_db.py
python3 flask-backend/app.py

cd react-frontend

npm start


