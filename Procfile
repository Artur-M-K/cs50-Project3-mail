release: python manage.py migrate
web: waitress-serve --port=8000 project3.wsgi:application
heroku ps:scale web=1
