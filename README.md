# Elden Ring Legendaries Checklist

Team Members

- Teryn Alves (ID: 100350471) CPSC-2650-M01

This app has been created using Flask, Angular and MongoDB.
The front end has been bootstrapped by using the Angular CLI.
There's also authentication using JWT.

## How to run the app locally

### Flask app with Virtual Environment

I would recommend a creation of a virtual environment. It will make sure you won't have problems with the modules versions and it will have it's own Python binaries. To start a virtual environment just use the following commands:

1 - Install the virtualenv module:

```
$ pip install virtualenv
```

2 - Create a virtual env in the project folder

```
$ python -m venv ./venv
```

3 - Activate the virtual env

```
$ source env/bin/activate
```

4 - Install the dependencies

```
$ pip install -r /path/to/requirements.txt
```

To stop using the virtual environment, you just need the following command:

```
$ deactivate
```

### Flask app without Virtual Environment

If you don't want to use a virtual environment and want to install the necessary modules globally, just use the following command:

```
$ pip install flask flask_pymongo flask_jwt_extended dotenv flask_cors Werkzeug datetime
```

After that start the flask API (still in the root folder, where app.py is located) by using the following command:

```
$ flask run
```

The flask application will start running on your terminal.

### Angular app

To run the angular application which will have all our user interface, navigate to the client folder.

```
$ cd client
```

Install all the necessary dependencies with npm:

```
$ npm install
```

You can then serve the front end application by using the following command:

```
$ ng serve
```

You can then proceed to use the application by navigating to `http://localhost:4200/`.

## References

This project has been inspired by this project [this project](https://smcnabb.github.io/dark-souls-cheat-sheet/).
Their implementation relies on HTML, JS, JQuery and Bootstrap v2.1.1. Code from 12 years ago!

All styling uses Bootstrap v5.0 along with a few components from [ng-bootstrap](https://ng-bootstrap.github.io/#/home).

## Deliverables

✅ Registration

✅ Login

✅ Logout

✅ Store user and profile data on MongoDB

✅ Different Profiles

✅ Angular frontend using bootstrap
