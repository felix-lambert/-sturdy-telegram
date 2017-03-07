# CityTaps Cloud Web Api

This is a node.js application powered by Express that provides the main functions to interact with water meter signals.

## Our website
You can visit it on ~~http://console.citytaps.org~~ 

## Tools

We use Node.js and Bookshelf.js (a MySQL ORM) as our main technologies. 

### Node.js

Node.js is a great and modern engine with a huge community of module creators. 

### Bookshelf.js

Bookshelf.js is among the most popular of the Node.js ORM packages. It stems from the Knex.js, which is a flexible query builder that works with MySQL and SQLite3.

## Install some tools to get started

### Install Git 

The first step is obviously to install the development dependencies. 

On GNU/Linux, just install Git with your package manager or:

```
apt-get install git
```

On Mac OS, download the software here: 

```
http://git-scm.com/download/mac
```

To check if git is installed:

```
git --version
```

### Install Node

Installing Node.js on your local environment is necessary to run CityTaps API.

You can find detailed instructions of installation on the [official page](https://nodejs.org/en/download/).


### Run api

After install, make sure to run `npm install` and `npm start`.

## Clone from source

The easiest way is to open up a terminal and type the installation command below:

```bash
$ git clone git@gitlab.com:Citytaps/ct-cloud-API.git
$ cd ct-cloud-API
$ npm install
$ npm start
```

## Introduction to CityCloud api

The platform is made of 3 main components:

### The models

The Models is where all data is stored and ready to be used. It is being handled by Bookshelf.js which is an MySql ORM.

### The controller API

All the bodies responses are encoded in JSON and all the data you send along request should be encoded in JSON.

You will find HTTP status code for the response, here is what they mean:

* 200: success
* 201: success (and something has been created)
* 204: success (and something has been deleted)
* 307: no data for next row (in pagination)
* 400: bad request
* 401: not authenticated
* 403: forbidden (authenticated but not enough permissions)
* 404: table not found
* 409: document already exists
* 500: internal server error


All the requests that mention "Requires authentication and authorization" are likely to send 401 and 403 if the conditions are not met.

Please check the apiDOC to have deeper understanding of how each routes work.

### Authentification

Authentication is based on a token.

### Skeleton

We can now introduce the application files structure.

* authentification
* controller
* helper
* lib
* models
* package.json
* test

#### The controller

A controller is a set of handlers attached to a route. When a request matches a route, the handler is executed.

We can also check the official (Express.js documentation)[http://expressjs.com/en/guide/routing.html] about routing if we want to learn more about it, or keep it as a reference for future use.

#### The entry point: server.js

You may wonder how to glue everything together. All that magic is done in server.js. The code itself is straightforward.

### The model

Models are used to interact with the database. They represent the data our application needs.

For info on Knex config JSON, see [how to install](http://knexjs.org/#Installation-client).

Then, your module object contains the CT models and a Bookshelf element.

#### Migrations

To create a migration file:

    knex migration:make [name]

To apply all the migration files:

    knex migration:latest

To rollback the lastet migration:

    knex migration:rollback

See: http://knexjs.org/#Migrations

### The modules

The node_modules/ folder contains the dependencies installed.
package.json is needed to keep the dependencies the application needs

## Tests

Unit test using Tape (see https://github.com/substack/tape).
Tests are defined in the `test/` folder.

Tests can be run with

    ```npm test```

Or with Nodemon

    ```npm run devtest```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using `npm run devtest`.

1. Create an issue on Trello and describe your idea
2. Create your feature branch (`git checkout -b [#link_of_the_trello_card]`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Publish the branch (`git push origin my-new-feature`)
5. Create a new Merge Request
7. Profit! :white_check_mark: