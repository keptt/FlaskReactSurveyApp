# from app_init import app
import os
import api_funcs


def main():
    api_funcs.app.run(debug=(False if os.environ.get('FLASK_PROD_MODE') else True))


# run server
if __name__ == '__main__':
    main()

