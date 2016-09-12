# Barebones webapp template

This is a template that contains a build system for web apps. It is mediocre. You probably want to use other solutions out there.

### What does it do?

This template takes a modular aproach to Javascript and HTML so it's easier to develop, and easier to manage dependencies. On the javascript side:

* [Browserify](http://browserify.org/) makes developing in the NPM ecosystem compatible with developing in for the browser. It combines every javascript file into a single one. So, while npm handles dependency manager, you don't flood the browser with HTTP connections, thus increasing load times.
* [Babel](https://babeljs.io/) converts [ES6 Syntax](http://es6-features.org/) to ES5 Syntax, so you have full browser compatibility while still being able to use ES6 features.
* [UglifyJS](https://github.com/mishoo/UglifyJS2) minifies the Browserify bundle to reduce the file size.

On the HTML side:

* [pagemanager](https://github.com/mediocre-webapp-tools/pagemanager), in adition with the included `gulpfile.js`, takes care of having multiple HTML pages, and combines them into a single file.
* [html-minifier](https://github.com/kangax/html-minifier) then reduces that file's size by minifying it.

And on the CSS side:

* [Sass](http://sass-lang.com/) files are compiled to regular files.
* [gulp-concat-css](https://www.npmjs.com/package/gulp-concat-css) combines every CSS file into one.
* [clean-css](https://github.com/jakubpawlowicz/clean-css) minifies that file.

### Getting started

You need:

* [Git](https://git-scm.com/).
* [Node](https://nodejs.org/en/) (includes npm).

First clone the repo:

```
git clone https://github.com/mediocre-webapp-tools/barebones-template.git
```

Then initialize the package with your webapp's data:

```
cd barebones-template
npm init
```
 Finally install all dependencies:
 
```
 npm install
```

There we go. You can begin editing your project inside the `app` folder.

### Installing modules

With this template you can take advantage of the npm environment and easily install third-party modules. For example, let's say that you want to install [Moment](http://momentjs.com/). Run the command:

```
npm install --save moment
```

Note: the `--save` option registers the module as a dependency on `package.json`. Thanks to this, if you "lose" your `node_modules` directory *(for instance, you might not want to commit it to version control because it bloats it)*, you can get it back with a simple `npm install`.

After that, you can add your module to your `main.js`:

```javascript
var moment = require('moment');

console.log(moment().format('DD/MM/YYYY'));
```

### Building your project

There are two build profiles: `build` and `dev`. Use `dev` when you're developing your project. You will find the built files inside the `app` folder. Use `build` when you've finished your project. The files get inside the `build` folder. Those are the files you want to release.

If you're on Windows, use `devbuild.ps1` and `build.ps1` to build the project. On any other OS, use the comands `gulp dev` for dev build and `gulp` for production build.

You might want to integrate builds with your editor so it's easier for you to perform a dev build. If you're using Sublime, [learn more about build systems](http://www.sublimetext.com/docs/build).
