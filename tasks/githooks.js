/*
 * grunt-githooks
 * https://github.com/rhumaric/grunt-githooks
 *
 * Copyright (c) 2013 Romaric Pascal
 * Licensed under the MIT license.
 */

'use strict';

var githooks = require('../lib/githooks'),
    path = require('path');

var defaults = {
  // Default destination for hooks is in the git directory but can be overriden to output them somewhere else
  dest: '.git/hooks',
  template: path.resolve(__dirname, '../templates/node.js.hb'),
  hashbang: '#!/usr/bin/env node',
  preventExit: false,
  startMarker: '// GRUNT-GITHOOKS START',
  endMarker: '// GRUNT-GITHOOKS END',
  command: 'grunt',
  gruntfile: 'Gruntfile.js'
};

var task = module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('githooks', 'Binds grunt tasks to git hooks', function() {

    var options = this.options(task.defaults);

    // Are we running tasks or hooking?
    if ( this.args.length > 0 ) {
      task.runTasks.apply(this, [options, grunt]);
    } else {
      task.createHooks.apply(this, [options, grunt]);
    }
  });
};

task.runTasks = function (options, grunt) {

  var hook, taskNames;

  for (var i = 0; i < this.args.length; i += 1 ) {
    hook = this.args[i];

    taskNames = this.data[hook];

    // Fix for old task specific options syntax
    if (typeof taskNames === 'object') {
      taskNames = taskNames.taskNames;
    }

    if (taskNames) {
      grunt.task.run( taskNames.split(' ') );
    }
  }
};

task.createHooks = function (options, grunt) {

  grunt.file.mkdir(options.dest);

  for (var key in this.data) {

    if (task.isGitHookDefinition(key)) {
      if (typeof this.data[key] === 'object') {
        grunt.log.error("Hook specific options are deprecated");
      }

      task.createHook(key, this.name, options, grunt);
    }
  }
};

// Expose the internals of the task so people can override them... at their own risk :D
task.createHook = function (hookName, taskNames, options, grunt) {

  options = task.cloneOptions(options);

  grunt.log.subhead('Binding `' + taskNames + '` to `' + hookName + '` Git hook.');
  task.validateHookName(hookName, grunt);

  try {
    var hook = new task.internals.Hook(hookName, taskNames, options);
    hook.create();
    grunt.log.ok();
  } catch (error) {
    task.logError(error, hookName, grunt);
  }
};

task.cloneOptions = function (options) {

  var result = {};

  for (var key in options) {
    result[key] = options[key];
  }

  return result;
};

task.isGitHookDefinition = function(key) {

  // Consider any key that does not have a default as a GitHookDefinition
  return key !== 'options';
};

task.validateHookName = function (hookName, grunt) {

  if (!task.internals.Hook.isNameOfAGitHook(hookName)) {
    grunt.log.errorlns('`' + hookName + '` is not the name of a Git hook. Script will be created but won\'t be triggered by Git actions.');
  }
};

task.logError = function (error, hookName, grunt) {

  var gruntError = error;
  if(error.message && error.message === 'ERR_INVALID_SCRIPT_LANGUAGE'){
    gruntError = 'A hook already exist for `' + hookName + '` but doesn\'t seem to be written in the same language as the binding script.';
  }
  grunt.fail.warn(gruntError);
};

task.defaults = defaults;
task.internals = githooks;