/**
 * Created by chuso_000 on 31/10/2015.
 */
'use strict';

// var fs = require("fs");
var fs = require("fs-extra");
var path = require('path');
var stripBom = require('strip-bom');
var jsdom = require('jsdom');
var async = require('async');
var Rx = require('rx');

var watcher = function watcher (filePath) {
    return Rx.Observable.create(function (observer) {
        fs.watch(filePath, function (event, fileName) {
            observer.onNext({event: event, fileName: fileName});
        })
    })
};

module.exports = function(props) {
    props = props || {};
    var root = process.cwd();
    if (props.pwd) root = path.resolve(root, props.pwd);
    var jquery = fs.readFileSync(path.resolve(path.dirname(__filename),'./jquery.min.js'),"utf8");
    var argv = process.argv.filter(function(n) {
        return !n.match(/^--.+/);
    });
    var options = process.argv.filter(function(n) {
        return !!n.match(/^--.+/);
    });
    // console.log('argv', argv);
    // console.log('options', options);
    var paramFilePath = path.resolve(root, props.parameters || argv[3]);
    console.log('paramFilePath', paramFilePath);

    // var outputFile = path.resolve(root, 'output.txt');
    var templatePath = path.resolve(root, props.template || argv[2]);

    if (options.indexOf('--watch') !== -1) {
        Rx.Observable.merge(watcher(paramFilePath), watcher(templatePath))
            .subscribe(function onNext (result) {
                console.log('Change detected: '+result.fileName);
                start();
            });
    }
    start();

    function start() {
        require('./produce.js')(paramFilePath, templatePath, jquery);
    }
}
