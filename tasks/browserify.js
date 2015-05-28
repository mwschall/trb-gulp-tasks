var babelify     = require('babelify');
var browserify   = require('browserify');
var browserSync  = require('browser-sync');
var _            = require('lodash');
var through      = require('through2');
var buffer       = require('vinyl-buffer');
var source       = require('vinyl-source-stream');
var watchify     = require('watchify');

var bundleLogger = require('../util/bundleLogger');


module.exports = function (gulp, plugins, options) {

  if (typeof options.minify !== 'boolean') {
    options.minify = process.env.MINIFY_ASSETS || false;
  }

  if (typeof options.sourcemaps !== 'boolean') {
    options.sourcemaps = process.env.SOURCEMAPS || true;
  }

  var watch  = options.watch;
  var logger = bundleLogger(gulp, plugins);

  return function browserifyTask(callback) {

    var bundleQueue  = options.bundles.length;

    function browserifyThis(bundleConfig) {

      if(watch) {
        // Add watchify args
        _.extend(bundleConfig, watchify.args);

        if (options.sourcemaps) {
          // Add debug (sourcemaps) option
          _.extend(bundleConfig, { debug: true });
        }
      }

      // Use Babel as core transform
      var b = browserify(bundleConfig)
        .transform(babelify.configure(bundleConfig.babelify));

      function bundle() {
        // Log when bundling starts
        logger.start(bundleConfig.outputName);

        return b
          .bundle()
          // .on('error', options.onError)
          .pipe(plugins.plumber({ errorHandler: options.onError }))
          .pipe(source(bundleConfig.outputName))
          .pipe(buffer())
          .pipe(options.sourcemaps ? plugins.sourcemaps.init({ loadMaps: true }) : through.obj())

          // Sourcemaps start
          .pipe(options.minify ? plugins.uglify() : through.obj())
          .pipe(options.minify ? plugins.stripDebug() : through.obj())
          // Sourcemaps end

          .pipe(options.sourcemaps ? plugins.sourcemaps.write('./') : through.obj())
          .pipe(plugins.plumber.stop())
          .pipe(gulp.dest(bundleConfig.dest))
          .on('end', reportFinished)
          .pipe(browserSync.reload({stream:true}));
      }

      if(watch) {
        // Wrap with watchify and rebundle on changes
        b = watchify(b);
        // Rebundle on update
        b.on('update', bundle);
        logger.watch(bundleConfig.outputName);
      }

      function reportFinished() {
        // Log when bundling completes
        logger.end(bundleConfig.outputName);

        if(bundleQueue) {
          bundleQueue--;
          if(bundleQueue === 0) {
            // If queue is empty, tell gulp the task is complete.
            callback();
          }
        }
      }

      return bundle();
    }

    // Start bundling with Browserify in "parallel"
    // TODO https://github.com/gulpjs/gulp/blob/master/docs/API.md#return-a-promise
    options.bundles.forEach(browserifyThis);
  };
};
