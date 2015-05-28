// https://github.com/Lostmyname/lmn-gulp-tasks/blob/master/index.js

var gulp         = require('gulp');
var plugins      = require('gulp-load-plugins')();

var errorHandler = require('./util/errorHandler');


module.exports = function getTask(name, options) {

  if (typeof options !== 'object')  {
    options = {};
  }

  if (typeof options.onError !== 'function') {
    options.onError = errorHandler(gulp, plugins, { notify: true });
  }

  // Keep gulp from hanging on this task
  var actualErrorHandler = options.onError;
  options.onError = function () {
    actualErrorHandler.apply(this, arguments);
    this.emit('end');
  };

  return require('./tasks/' + name)(gulp, plugins, options);
};
