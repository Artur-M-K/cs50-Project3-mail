release: python manage.py migrate
web: waitress-serve --port=$PORT project3.wsgi:application
heroku ps:scale web=1
