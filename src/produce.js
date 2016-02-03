var Rx = require('rx');
var _ = require('lodash');
var fs = require('fs-extra');
var jsdom = require('jsdom');
var path = require('path');

module.exports = function produce (paramFilePath, templatePath, jquery) {
	var readJSON = Rx.Observable.fromNodeCallback(fs.readJSON);
	var writeFile = Rx.Observable.fromNodeCallback(fs.writeFile);
	var template = fs.readFileSync(templatePath, {
        encoding: 'utf8'
    });
	var jsdomObservable = Rx.Observable.create(function (observer) {
		jsdom.env({
			html: template,
			src: [jquery],
			done: function(err, window) {
				if (err) return observer.onError(err);

				observer.onNext(window);
				observer.onCompleted();
			}
		});
	});
	var readJSONObservable = readJSON(paramFilePath, 'utf8')
		.flatMap(function transformJsonContent (jsonContent) {
			return Rx.Observable.from(_.map(jsonContent, function (val, key) {
				return {
					'name': key,
					'params': val
				};
			}))
		});

	var produceTemplatesObservable = jsdomObservable
		.flatMap(function (window) {
			return readJSONObservable.flatMap(function (instance) {
				// Convert to writing observable
				// console.log('instance: ',instance)
				var newHTML = transformToNewHtml(window, instance.params);
				var outputPath = path.resolve(process.cwd(), instance.name);
				// console.log('outputPath: ',outputPath);
				// return Rx.Observable.return(outputPath);
				return writeFile(outputPath, newHTML, {
					encoding: 'utf8'
				}).flatMap(function () {
					return Rx.Observable.return(instance.name);
				});
			})
		});

	produceTemplatesObservable.subscribe(function (val) {
			console.log('Write to '+val);
		}, function onError (error) {
			console.log('Error:', error);
		});
	
	///
	function transformToNewHtml (window, parameters) {
		var newHTML = '';
		var $ = window.$;
		var $html = $(window.document.querySelector('html')).clone();
		Object.keys(parameters).forEach(function(parameter) {
			var $queriedElem = $html.find('*[data-dh-parameter="' + parameter + '"]');
			var content = parameters[parameter];

			$html.find('*[data-dh-parameter="' + parameter + '"]').not('img').html(content);
			$html.find('img[data-dh-parameter="' + parameter + '"]').attr("src", content);
			$html.find('*[data-dh-parameter="' + parameter + '"]').removeAttr('data-dh-parameter');
		});
		return "<!DOCTYPE html><html>" + $html.html() + "</html>";
	}
}