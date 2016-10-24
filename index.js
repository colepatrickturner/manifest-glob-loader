var glob = require('glob');
var path = require('path');
var loaderUtils = require("loader-utils");
var assign = require("lodash.assign");
/**
 * This is a very naive webpack manifest loader. Given a path of files, it will return a json array of those files to be
 * passed to a resource loader
 * @param source
 * @returns {*}
 */
module.exports = function( source ) {

    var query = loaderUtils.parseQuery(this.query);
    var callback = this.async();
    var configKey = query.config || "manifestLoader";
    var config = {};
    this.cacheable();

    //get the config
    if ( this.options[configKey] ) {
        config = assign(config, this.options[configKey]);
    }

    var options = config.globOptions || {};
    var addDependency = this.addContextDependency;

    //read the files
    glob(config.globPattern, options, function( err, files ) {

        //return the error
        if ( err ) {
            callback(err);
        }

        var dependencies = files.map(function(f) {
            return ('cwd' in options ? options.cwd : process.cwd()) + path.dirname(f);
        }).sort(function(a, b) { return a.length < b.length ? -1 : 1; });

        var baseDependencies = [];
        for(var i=0;i<dependencies.length;i++) {
          var dependency = dependencies[i];
          var dependencyRoot = dependency;

          while(dependencyRoot != path.dirname(dependencyRoot)) {
            dependencyRoot = path.dirname(dependencyRoot);

            if (dependencies.indexOf(dependencyRoot) !== -1) {
              if(baseDependencies.indexOf(dependencyRoot) === -1) {
                baseDependencies.push(dependencyRoot);
              }

              break;
            }
          }

          if(dependencyRoot === path.dirname(dependencyRoot) && baseDependencies.indexOf(dependency) === -1) {
            baseDependencies.push(dependency);
          }
        }

        for(var i=0;i<baseDependencies.length;i++) {
          addDependency(baseDependencies[i]);
        }

        //return
        callback(null, files);
    });
};
