/**
 * Created by chuso_000 on 31/10/2015.
 */
'use strict';

var fs = require("fs");
var path = require('path');
var stripBom = require('strip-bom');
var jsdom = require('jsdom');
var root = process.cwd();
var async = require('async');

var jquery = fs.readFileSync(path.resolve(path.dirname(process.argv[1]), "./node_modules/jquery/dist/jquery.js"), {encoding: 'utf8'});
var paramFile = path.resolve(root,process.argv[3]);

// var outputFile = path.resolve(root, 'output.txt');
var templateFile = path.resolve(root,process.argv[2]);
var template = fs.readFileSync(templateFile, {encoding: 'utf8'});

async.waterfall([
	function(cb){
		fs.readFile(paramFile, "utf8", function(err, data){
			console.log(data);
			if (err) return cb(err);
			try{
				var jsonContent = JSON.parse(data);

				cb(null, jsonContent);
			}catch(e){
				cb(e);
			}
		});
	},
	function(jsonContent, cb){

		jsdom.env({
	        html: template,
	        src: [jquery],
	        done: function (err, window) {
	            var $ = window.$;
	            var $dhElems = $("*[data-dh-parameter]");
	            //console.log('Number of dhElems: ' + $dhElems.length);
	            //displayDHParameters($dhElems);
	            
	            // First : Language Code
				Object.keys(jsonContent).forEach(function(languageCode){
					// Second: params
					produceTemplate(jsonContent[languageCode], templateFile.replace(path.extname(templateFile),'.'+languageCode+'.html'));
				})

	            function displayDHParameters($dhElems){
	                $dhElems.each(function () {
	                    console.log(this.nodeName + ": "+$(this).attr('data-dh-parameter'));
	                    if (this.nodeName=="IMG"){
	                        console.log("-- src=\"" + $(this).attr('src')+"\"");
	                    }else{
	                        console.log("-- innerHTML=\""+ $(this).html()+"\"");
	                    }
	                })
	            }

	            function produceTemplate(parameters, outputFileName){

	                Object.keys(parameters).forEach(function (parameter) {
	                    var $queriedElem = $('*[data-dh-parameter="'+parameter+'"]');
	                    if ($queriedElem.length>0){
	                        /* Found! */
	                        if ($queriedElem[0].nodeName == "IMG"){
	                            $queriedElem.attr("src",parameters[parameter]);
	                        }else{
	                            $queriedElem.html(parameters[parameter]);
	                        }
	                    }
	                });

	                // console.log(paramFile);
	            
	                var newFile = outputFileName;
	                // console.log('New file\'s name:',newFile);
	                fs.closeSync(fs.openSync(newFile, 'w'));

	                fs.writeFile(newFile, "<!DOCTYPE html><html>"+window.document.querySelector('html').innerHTML+"</html>",{encoding: 'utf8'}, function(err) {
	                    if(err) {
	                        return console.log(err);
	                    }
	                    console.log("The file has been saved!");
	                });
	            }
	        }
	    });

		

		// fs.writeFile(outputFile, jsonContent, "utf8");
	}
	], function(err, result){
		if (err) console.error('Error: ',err);
	});


