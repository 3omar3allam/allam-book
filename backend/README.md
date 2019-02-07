# ALLAM BOOK

Social networking **Angular __MEAN-stack__** application.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install dependencies via [npm](https://www.npmjs.com/get-npm):
```
npm install --save express express-fileupload mongoose mongoose-unique-validator cors body-parser bcryptjs jsonwebtoken nodemon
```

### Installing

After installing setting dependencies you should see these modules added in **package.json**.

Now you can run the application locally on [port 3000](http://localhost:3000) by:
```
nodemon server.js
```
you should see `Connected to database!` on your console as a success flag.

#### Customizing application
1. Set your own database by changing *MONGO_CONN_STR* in [mongo-config.js](mongo-config.js) as well as changing the value of *MONGO_ATLAS_PW* in [nodemon.json](nodemon.json).
2. Run on different port by changing value of *PORT* in [nodemon.json](nodemon.json).
3. Frontend application is built in [angular](angular/) directory, try building your custom frontend and change *FRONTEND_DIRNAME* at the top of [app.js](app.js) if needed.

## Deployment

Before deployment to a live host, don't forget to copy the environment variables located in [nodemon.json](nodemon.json) to your host environment variables.

#### See my deployed version at [Allam Book](http://socialmedia-env.6h2ff58d57.us-east-2.elasticbeanstalk.com/).

## Built With

* [Angular 6](https://angular.io/) - client-side cross-platform framework.
* [Express](https://expressjs.com/) - server-side web frameword.
* [Mongo](https://www.mongodb.com/) - document-based database.
* [NPM](https://www.npmjs.com/) - node dependency management.


## Authors

* **[Omar Allam](https://github.com/3omar3allam)** - *Initial work*.
