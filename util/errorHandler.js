var browserSync = require('browser-sync');

module.exports = function (gulp, plugins, options) {

  if (typeof options.notify !== 'boolean') {
    options.notify = process.env.NOTIFICATION_CENTER || true;
  }

  return function (err) {
    // Send to browser-sync
    browserSync.notify(err.message, 3000);

    if (options.notify) {
      // Send error to notification center with gulp-notify
      plugins.notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
      }).apply(this, Array.prototype.slice.call(arguments));
    } else {
      // Log to console
      plugins.util.log(err.toString());
    }

    if (process.argv.indexOf('--fail') !== -1) {
      process.exit(1);
    }

    // Keep gulp from hanging on this task
    this.emit('end');
  };
};
