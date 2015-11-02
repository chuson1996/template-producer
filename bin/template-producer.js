/**
 * Created by chuso_000 on 31/10/2015.
 */



var jsdom = require("jsdom");
var fs = require("fs");
var path = require('path');
var stripBom = require('strip-bom');
var root = process.cwd();


var jquery = fs.readFileSync(path.resolve(path.dirname(process.argv[1]), "../node_modules/jquery/dist/jquery.js"), {encoding: 'utf8'});

var template = fs.readFileSync(path.resolve(root,process.argv[2]), {encoding: 'utf8'});


var paramFile = path.resolve(root,process.argv[3]);
// console.log(paramFile);
console.log('Reading params...');
fs.readFile(paramFile,"utf-8", function (err, data) {
    if (err) return console.log(err);
    
    data = stripBom(data);
    //console.log(/\u00E4/.test(data));
    var keys = (data.match(/.+?(?=\|{3})/gm));
    var vals = data.split('\n').map(function (line) {
        return line.replace(/.+?\|{3}/,'').trim();
    });
    //console.log(vals);
    var parameters = {};
    for (var i = 0; i < Math.max(keys.length, vals.length); i++){
        parameters[keys[i]] = vals[i];
    }

    console.log("Params: ");
    console.log(parameters);

    ///
    jsdom.env({
        html: template,
        src: [jquery],
        done: function (err, window) {
            var $ = window.$;
            var $dhElems = $("*[data-dh-parameter]");
            //console.log('Number of dhElems: ' + $dhElems.length);
            //displayDHParameters($dhElems);
            produceTemplate(parameters);

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

            function produceTemplate(parameters){

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
            
                var newFile = paramFile.replace(/\.param.+/,'.html');
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

});
