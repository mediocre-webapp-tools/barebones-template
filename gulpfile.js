'use strict';

const DEST             = './build';

const JS_SOURCE        = './app/js',
      JS_DEV_DEST      = './app';

const SCSS_SOURCE      = './app/scss',
      CSS_ADD_FILES    = [
                          	//'./node_modules/bootstrap/dist/css/bootstrap.css'
                         ],
      // Replaces strings inside all CSS files (compiled SASS + CSS_ADD_FILES), though this is
      // only useful for CSS_ADD_FILES. In some cases you want to modify relative paths.
      // 
      // For instance, when working with materialize we want to change the '../fonts/' src to
      // './fonts', because the compiled css will be down one level relative to the fonts folder.
      CSS_REPLACEMENTS = [
                         	// {
                         	// 	before: '../fonts',
                         	// 	after: './fonts'
                         	// }
                         ];

const HTML_SOURCE      = './app/html',
      HTML_DEV_DEST    = './app',
      HTML_PAGES_TAG   = '<pages />',
      HTML_SCRIPTS_TAG = '<scripts />',
      HTML_STYLES_TAG  = '<styles />';

const FONT_SOURCES     = [
                         	//'./node_modules/bootstrap/dist/fonts/*'
                         ],
      FONT_DEST_DIR    = DEST + '/fonts';

const pkg              = require('./package.json');

const browserify       = require('browserify'),
      fs               = require('fs'),
      gulp             = require('gulp'),
      babel            = require('gulp-babel'),
      cleancss         = require('gulp-clean-css'),
      concatCss        = require('gulp-concat-css'),
      htmlmin          = require('gulp-htmlmin'),
      plumber          = require('gulp-plumber'),
      rename           = require('gulp-rename'),
      sass             = require('gulp-sass'),
      tap              = require('gulp-tap'),
      uglify           = require('gulp-uglify'),
      source           = require('vinyl-source-stream');

/*************************************************************************************************
                                         PRODUCTION BUILD
*************************************************************************************************/

/**
 * This task does the following:
 * - transform ES6 syntax into ES5 syntax, for browser compatibility
 *   note that UglifyJS is not compatible with ES6 syntax, so this
 *   has to be done first.
 */
gulp.task('babel', function(){
	return gulp.src(JS_SOURCE + '/**/*.js')
	           .pipe(plumber())
	           .pipe(babel({
                   presets: ['es2015']
               }))
               .pipe(gulp.dest('./tmp/babel'));
});

/**
 * This task does the following:
 * - move package.json files into the babel temporary directory so that
 *   browserify can find the modules.
 */
gulp.task('move_json', function(){
	return gulp.src(JS_SOURCE + '/**/package.json')
	           .pipe(plumber())
	           .pipe(gulp.dest('./tmp/babel'));
});

/**
 * This task does the following:
 * - combines every js file into one using browserify
 */
gulp.task('browserify', ['babel', 'move_json'], function(){
	var b = browserify({
		entries: './tmp/babel/main.js',
		debug: true
	});

	return b.bundle()
	        .pipe(plumber())
	        // vinyl-source-stream takes care of "converting" "browserify format" to "gulp format"
	        .pipe(source('bundle.js'))
	        .pipe(gulp.dest('./tmp/browserify/'));
});

/**
 * This task does the following:
 * - minifies the result of the 'browserify' task
 */
gulp.task('uglify', ['browserify'], function(){
	return gulp.src('./tmp/browserify/bundle.js')
	           .pipe(plumber())
	           .pipe(uglify())
	           .pipe(rename('scripts.js'))
	           .pipe(gulp.dest(DEST));
});

/**
 * This task does the following:
 * - replaces the devbundle.js script include with scripts.js, the name used in production.
 * - combines index.html with every html component
 * - minifies the result
 */
gulp.task('html', function(){
	return gulp.src('./app/html/index.html')
	           .pipe(plumber())
	           .pipe(tap(function(file, t){
				    var modified = file.contents
				                       .toString('utf-8')
				                       .replace(
				                       		HTML_SCRIPTS_TAG,
				                       		getBrowserifyBunldeTag('scripts.js')
				                       	)
				                       .replace(
				                       		HTML_STYLES_TAG,
				                       		getCssTag('styles.css')
				                       	)
				                       .replace(HTML_PAGES_TAG, getHtmlPages());
				    file.contents = new Buffer(modified, 'utf-8');
	           }))
	           .pipe(htmlmin({
	           		collapseWhitespace: true,
	           		removeComments: true
	           }))
	           .pipe(gulp.dest(DEST));
});


/**
 * This task does the following:
 * - compiles scss files in /app/scss/ into css
 */
gulp.task('sass', function(){
	return gulp.src('./app/scss/main.scss')
	           .pipe(plumber())
	           .pipe(sass().on('error', sass.logError))
	           .pipe(gulp.dest('./tmp/css'));
});

/**
 * This task does the following:
 * - moves required css libraries defined in CSS_ADD_FILES (i.e: bootstrap) into the temp folder
 *   so the 'css' task can use them
 */
gulp.task('move-aditional-css', function(){
	return gulp.src(CSS_ADD_FILES)
	           .pipe(plumber())
	           .pipe(gulp.dest('./tmp/css'));
});

/**
 * This task does the following:
 * - combines every css file into one file,
 * - performs the CSS_REPLACEMENTS into that file,
 * - then minifies it
 */
gulp.task('css', ['sass', 'move-aditional-css'], function(){
	return gulp.src('./tmp/css/*.css')
	           .pipe(plumber())
	           .pipe(concatCss('styles.css'))
	           .pipe(tap(function(file, t){
				    file.contents = new Buffer(
				    	doCssReplacements(
				    		file.contents.toString('utf-8'),
				    		CSS_REPLACEMENTS
				    	),
				    	'utf-8'
				    );
	           }))
	           .pipe(cleancss({debug: true}))
	           .pipe(gulp.dest(DEST));
});

/**
 * This task does the following:
 * - moves every font to the fonts folder
 */
gulp.task('move-fonts', function(){
	return gulp.src(FONT_SOURCES)
	           .pipe(gulp.dest(FONT_DEST_DIR));
});

/*************************************************************************************************
                                             DEV BUILD
*************************************************************************************************/

/**
 * This doesn't uglify the bundle. However, it does babelify it
 * because browserify-shim doesn't seem to work with ES6 syntax.
 */
gulp.task('dev-browserify', ['babel', 'move_json'], function(){
	var b = browserify({
		entries: './tmp/babel/main.js',
		debug: true
	});

	return b.bundle()
	        .pipe(plumber())
	        .pipe(source('bundle.js'))
	        .pipe(rename('_devbundle.js'))
	        .pipe(gulp.dest(JS_DEV_DEST));
});

/**
 * This does the same as the html task accordingly to the dev build
 * params. However, it doesn't minify the output file.
 */
gulp.task('dev-html', function(){
	return gulp.src('./app/html/index.html')
	           .pipe(plumber())
	           .pipe(tap(function(file, t){
				    var modified = file.contents
				                       .toString('utf-8')
				                       .replace(
				                       		HTML_SCRIPTS_TAG,
				                       		getBrowserifyBunldeTag('_devbundle.js')
				                       	)
				                       .replace(
				                       		HTML_STYLES_TAG,
				                       		getCssTag('_devstyles.css')
				                       	)
				                       .replace(HTML_PAGES_TAG, getHtmlPages());
				    file.contents = new Buffer(modified, 'utf-8');
	           }))
	           .pipe(rename('_devindex.html'))
	           .pipe(gulp.dest(HTML_DEV_DEST));
});

/**
 * This does the same as the css task accordingly to the dev build
 * params. However, it doesn't minify the output file.
 */
gulp.task('dev-css', ['sass', 'move-aditional-css'], function(){
	return gulp.src('./tmp/css/*.css')
	           .pipe(plumber())
	           .pipe(concatCss('_devstyles.css'))
	           .pipe(tap(function(file, t){
				    file.contents = new Buffer(
				    	doCssReplacements(
				    		file.contents.toString('utf-8'),
				    		CSS_REPLACEMENTS
				    	)
				    	.replace('/fonts/', '/_devfonts/'),
				    	'utf-8'
				    );
	           }))
	           .pipe(gulp.dest('./app'));
});

/**
 * This does the same as the move-fonts task accordingly to the dev build params.
 */
gulp.task('dev-move-fonts', function(){
	return gulp.src(FONT_SOURCES)
	           .pipe(gulp.dest('./app/_devfonts'));
});


/*************************************************************************************************
                                           BUILD TYPES
*************************************************************************************************/

gulp.task('build', ['uglify', 'html', 'css', 'move-fonts'], function(){});
gulp.task('dev', ['dev-browserify', 'dev-html', 'dev-css', 'dev-move-fonts'], function(){});

//If no build type is specified, default to 'build'
gulp.task('default', ['build'], function(){});

/*************************************************************************************************
                                       GULPFILE FUNCTIONS
*************************************************************************************************/

// HTML

function getHtmlPages() {
	// Matches every html file
	var regex = /(.+)\.html/;
	var pages = '';

	// Get the component list
	var dirname = HTML_SOURCE + '/pages';
	var filenames = fs.readdirSync(dirname);

	// Filter out every element that doesn't match the regex
	// So, every non-html file
	filenames = filenames.filter(val => {
		return val.match(regex) !== null;
	});

	// Add each file to the pages string, wrapped around a div containing the page's name
	for (var i = 0; i < filenames.length; i++) {
		pages += '<div data-page="' + filenames[i].match(regex)[1] + '" ' +
		              'style="display: none;">';
		pages += fs.readFileSync(dirname + '/' + filenames[i], 'utf-8');
		pages += '</div>';
	}

	return pages;
}

function getBrowserifyBunldeTag(bundle_filename) {
	return '<script type="text/javascript" src="' + bundle_filename + '"></script>';
}

function getCssTag(bundle_filename) {
	return '<link rel="stylesheet" href="' + bundle_filename + '">';
}

// CSS

function doCssReplacements(file_string, replacements) {
	for (var i = 0; i < replacements.length; i++) {
		file_string = file_string.replace(replacements[i].before, replacements[i].after);
	}
	return file_string;
}