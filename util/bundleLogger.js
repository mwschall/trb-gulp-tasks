var prettyHrtime = require('pretty-hrtime');


module.exports = function(gulp, plugins) {

  var util = plugins.util;
  var startTime;

  return {

    start: function (filepath) {
      startTime = process.hrtime();
      util.log('Bundling', util.colors.green(filepath) + '...');
    },

    watch: function (bundleName) {
      util.log('Watching files required by', util.colors.yellow(bundleName));
    },

    end: function (filepath) {
      var taskTime = process.hrtime(startTime);
      var prettyTime = prettyHrtime(taskTime);
      util.log('Bundled', util.colors.green(filepath), 'in', util.colors.magenta(prettyTime));
    }

  };
};
