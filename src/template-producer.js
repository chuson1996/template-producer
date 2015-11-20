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
    var paramFile = path.resolve(root, props.parameters || argv[3]);

    // var outputFile = path.resolve(root, 'output.txt');
    var templateFile = path.resolve(root, props.template || argv[2]);
    var template = fs.readFileSync(templateFile, {
        encoding: 'utf8'
    });

    console.log(options);
    if (options.indexOf('--watch') !== -1) {
        console.log('Now watching files...' + paramFile);
        fs.watchFile(paramFile, function() {
            console.log('File changed...');
            start();
        });
        console.log('Now watching files...' + templateFile);
        fs.watchFile(templateFile, function() {
            console.log('File changed...');
            start();
        });
    }
    start();

    function start() {
        async.waterfall([
            function(cb) {
                fs.readJSON(paramFile, "utf8", function(err, data) {
                    if (err) return cb(err);
                    cb(null, data);
                });
            },
            function(jsonContent, cb) {

                jsdom.env({
                    html: template,
                    src: [jquery],
                    done: function(err, window) {
                        var $ = window.$;
                        var $dhElems = $("*[data-dh-parameter]");
                        //console.log('Number of dhElems: ' + $dhElems.length);
                        //displayDHParameters($dhElems);

                        // First : Language Code
                        Object.keys(jsonContent).forEach(function(writeFile) {
                            // Second: params
                            console.log('----------' + writeFile + '-----------')
                            produceTemplate(jsonContent[writeFile], path.resolve(root, writeFile));
                        });

                        function displayDHParameters($dhElems) {
                            $dhElems.each(function() {
                                console.log(this.nodeName + ": " + $(this).attr('data-dh-parameter'));
                                if (this.nodeName == "IMG") {
                                    console.log("-- src=\"" + $(this).attr('src') + "\"");
                                } else {
                                    console.log("-- innerHTML=\"" + $(this).html() + "\"");
                                }
                            })
                        }

                        function produceTemplate(parameters, outputFileName) {

                            Object.keys(parameters).forEach(function(parameter) {
                                var $queriedElem = $('*[data-dh-parameter="' + parameter + '"]');
                                var content = parameters[parameter];
                                if (typeof content == "object") {
                                    // It's an object with a templateUrl
                                    var templateUrl = path.resolve(root, content.templateUrl);
                                    content = fs.readFileSync(templateUrl, "utf8");
                                    
                                }

                                if ($queriedElem.length > 0) {
                                    /* Found! */
                                    if ($queriedElem[0].nodeName == "IMG") {
                                        $queriedElem.attr("src", content);
                                    } else {
                                        $queriedElem.html(content);
                                    }
                                    // $queriedElem.removeAttr('data-dh-parameter');
                                } else {
                                    console.error('Cannot find parameter: ' + parameter);
                                }
                            });

                            // console.log(paramFile);

                            var newFile = outputFileName;
                            process.stdout.write('Writing to ' + outputFileName + '\n');
                            // console.log('New file\'s name:',newFile);
                            fs.closeSync(fs.openSync(newFile, 'w'));

                            fs.writeFile(newFile, "<!DOCTYPE html><html>" + window.document.querySelector('html').innerHTML + "</html>", {
                                encoding: 'utf8'
                            }, function(err) {
                                if (err) {
                                    return console.log(err);
                                }
                                console.log("The file has been saved!");
                            });
                        }
                    }
                });



                // fs.writeFile(outputFile, jsonContent, "utf8");
            }
        ], function(err, result) {
            if (err) console.error('Error: ', err);
        });
    }



    function cleanJSON(string) {
        /* Remove comments */
        return string.replace(/\/\/.+/gm, '').replace(/\/\*.+?\*\//gm, '');
    }

}
