javascript-lib-seed
===========


Template project for creating Javascript libraries.


## Getting started

Clone the project:

    git clone https://scm.prod.nordnet.se/scm/platform/javascript-lib-seed.git <YOUR_LIBRARY_NAME>


Remove _.git_ folder:

    rm -rf .git


Create new repository in [Stash](https://scm.prod.nordnet.se) and 
follow instructions there on how to link your local folder with remote repository.


Install dependencies

    npm set registry http://sinopia.prod.nordnet.se
    npm install


Now you can start working on you library.


## npm scripts

* `npm build` - Build library and transform from ES6 to ES5, results are stored in _lib/_ folder
* `npm run build:umd` - Run a production build, results are stored in _dist/_ folder
* `npm test` - Run the tests once
* `npm run test:debug` - Run the in chrome so you can debug
* `npm run test:tdd` - Run the tests and start watching for changes
* `npm run lint` - Run a lint of the source code