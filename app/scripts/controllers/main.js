'use strict';

/**
 * @ngdoc function
 * @name nordeashApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the nordeashApp
 */
angular.module('nordeashApp')
  .controller('MainCtrl', function ($scope, $timeout, Bank) {


    $scope.banks = ['Nordea','Osuuspankki']
    $scope.my = { bank: 'Nordea' };


    $scope.upload = function(evt){
      console.log($scope.my.bank);
      if(!$scope.my.bank)
        return
      $scope.loading=true;
      Bank.upload('csvFile',$scope.my.bank, manipulateData)
  	}

    $scope.timeInterval = [];

  	var manipulateData = function(data){



     $scope.timeInterval.push(data[0].date);
     $scope.timeInterval.push(data[data.length-1].date);

  		var outcome = [],
          income  = [];


  		data = _.groupBy(data, function(item) {
  			return item.target.toLowerCase().trim();
  		})

  		_.map(data, function(shop,id){
        var tmpOut = [], tmpIn = [];

        _.map(shop,function(purchase){
          if(parseFloat(purchase.sum.replace(',','.')) > 0)
            tmpIn.push(purchase)
          else 
            tmpOut.push(purchase)
        })

        if(tmpOut.length)
  			outcome.push({
  				id:id,
          percentage: 0,
          length:tmpOut.length,
  				sum: Math.round( _.reduce(tmpOut, function(memo, num){ var price = (-1 * parseFloat(num.sum.replace(',','.'))); return price > 0 ? memo + price : memo },0) )
  			})

        if(tmpIn.length)
        income.push({
          id:id,
          percentage: 0,
          length:tmpIn.length,
          sum: Math.round( _.reduce(tmpIn, function(memo, num){ var price = parseFloat(num.sum.replace(',','.')); return price > 0 ? memo + price : memo },0) )
        })



  		})


  		outcome = _.sortBy(outcome, function(item){
  			return item.sum;
  		}).reverse();

      income = _.sortBy(income, function(item){
        return item.sum;
      }).reverse();

      $scope.totalOutcome = _.reduce(outcome,function(memo, num) { return memo+parseInt(num.sum) },0)
  		$scope.totalIncome = _.reduce(income,function(memo, num) { return memo+parseInt(num.sum) },0)

      $scope.outcome = outcome;
      $scope.income = income;

      //%
      $timeout(function(){
        $scope.outcome = _.map($scope.outcome,function(item){
          item.percentage = Math.round( item.sum / outcome[0].sum * 100);
          return item;
        })
        $scope.income = _.map($scope.income,function(item){
          item.percentage = Math.round( item.sum / income[0].sum * 100);
          return item;
        })
        $scope.loading = false;
      },4000)

      $scope.loaded = true;
      $scope.mode = 'outcome';
  	}

    $scope.changeMode=function(mode){
      $scope.mode=mode;
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
