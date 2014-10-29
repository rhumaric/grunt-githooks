#!/usr/bin/env node

// GRUNT-GITHOOKS START
var exec = require('child_process').exec,
    fs = require('fs');

fs.open('{{expectedWorkingDir}}/Gruntfile.js', 'r', function(err, data) {
  var exitCode = 0;
  if ( err ) {
    // Gruntfile.js does not exist exit cleanly.
    process.exit(exitCode);
  }

  exec('/usr/bin/grunt githooks::pre-commit --gruntfile {{expectedWorkingDir}}/Gruntfile.js', {
    cwd: '{{expectedWorkingDir}}'
  }, function (err, stdout, stderr) {

    console.log(stdout);

    if (err) {
      console.log(stderr || err);
      exitCode = -1;
    }

    process.exit(exitCode);
  });
});


// GRUNT-GITHOOKS END