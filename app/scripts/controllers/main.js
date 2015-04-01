'use strict';

/**
 * @ngdoc function
 * @name nordeashApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the nordeashApp
 */
angular.module('nordeashApp')
  .controller('MainCtrl', function ($scope) {


  	$scope.upload = function(evt){
  		console.log(evt.target.files[0]);


  		Upload('csvFile',manipulateData);

  	}

  	var manipulateData = function(data){
  		var summary = [];
  		data = _.groupBy(data, function(item) {
  			return item.target
  		})

  		_.map(data, function(purchase,id){
  			summary.push({
  				id:id,
  				length:purchase.length,
  				sum: Math.round( _.reduce(purchase, function(memo, num){ var price = (-1 * parseFloat(num.sum.replace(',','.'))); return price > 0 ? memo + price : memo; },0) )
  			})
  		})

  		summary = _.sortBy(summary, function(item){
  			return item.sum;
  		}).reverse();

  		//%
  		summary = _.map(summary,function(item){
  			item.percentage = Math.round( item.sum / summary[0].sum * 100);
  			return item;
  		})

  		$scope.total = _.reduce(summary,function(memo, num) { return memo+parseInt(num.sum) },0)


  		$scope.summary = summary;
  		console.log(summary);
  	}

  	var  Upload = function(id,cb) {
	    var fileUpload = document.getElementById(id);
	    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/,
	    		tab = '(\t(?=(?:(?:[^"]*"){2})*[^"]*$))',
	    		tabregex	= new RegExp (tab, 'g');
        
	    if (regex.test(fileUpload.value.toLowerCase())) {
	        if (typeof (FileReader) != "undefined") {
	            var reader = new FileReader();
	            reader.onload = function (e) {
	                var data	= [];
	                var rows = e.target.result.split("\n");

	                for (var i = 2; i < rows.length; i++) {

	                    rows[i] = rows[i].replace(tabregex, '{;}');
	                    var cells = rows[i].split("{;}").slice(0,5);

	                    if(cells[0]&&cells[3])
	                    data.push({
	                    	date: cells[0],
	                    	sum: cells[3],
	                    	target: cells[4]
	                    })


	                }

	                cb(data);
	            }
	            reader.readAsText(fileUpload.files[0]);
	        } else {
	            alert("This browser does not support HTML5.");
	        }
	    } else {
	        alert("Please upload a valid CSV file.");
	    }
	}



  })


  .directive('customOnChange', function() {
		return {
		restrict: "A",
		link: function (scope, element, attrs) {
			var onChangeFunc = element.scope()[attrs.customOnChange];
			element.bind('change', onChangeFunc);
		}
	};
});
