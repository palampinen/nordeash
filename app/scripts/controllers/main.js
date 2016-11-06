'use strict';

/**
 * @ngdoc function
 * @name nordeashApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the nordeashApp
 */
 angular.module('nordeashApp')
 .controller('MainCtrl', function ($scope, $timeout, Bank, Chart, $http) {


  $scope.chartoptions = Chart.chartoptions;



  	// BANK
    $scope.banks = ['Nordea','Osuuspankki']
    $scope.my = { bank: 'Nordea' };
    $scope.timeInterval = [];

    $scope.upload = function(evt){
      console.log($scope.my.bank);
      if(!$scope.my.bank)
        return
      $scope.loading=true;
      Bank.upload('csvFile',$scope.my.bank, manipulateData)
    }


    // Test file
/*
    $http.get('/scripts/test/nordea-malli.txt').
    success(function(data) {
      Bank.parseCSV(data,'nordea',manipulateData)
    });
*/


    var calculateVariation = function(bankdata){

      var outcomeVariation = {},
      incomeVariation = {},
      tmpdate,
      tmpamoumt;

    // Variation
    moment.locale('fi');
    _.map(bankdata, function(purchase){
      tmpdate = moment(purchase.date, "DD.MM.YYYY").format('MMM YYYY');
      purchase.sum += '';
      tmpamoumt = parseFloat(purchase.sum.replace(',','.'));

      if(tmpamoumt > 0){
        if(!incomeVariation[tmpdate])
          incomeVariation[tmpdate] = {sum:0};
        incomeVariation[tmpdate].sum += tmpamoumt;
      }else{
        if(!outcomeVariation[tmpdate])
          outcomeVariation[tmpdate] = {sum:0};

        outcomeVariation[tmpdate].sum += (-1*tmpamoumt);
      }
    })

    return {
      income:incomeVariation,
      outcome:outcomeVariation
    }

  }


  var manipulateData = function(bankdata){

    $scope.bankdata = bankdata;
  	 // Time Interval
    $scope.timeInterval.push(bankdata[0].date);
    $scope.timeInterval.push(bankdata[bankdata.length-1].date);


    // monthlist between result range
    var start = moment($scope.timeInterval[0], "DD.MM.YYYY"),
    end = moment($scope.timeInterval[1], "DD.MM.YYYY"),
    startMonth = start.format('M'),
    startYear = start.format('YYYY'),
    endMonth = end.format('M'),
    endYear = end.format('YYYY'),
    dateRange = [],
    outcome = [],
    income  = [];

    // first year till end
    for(var j = startMonth;(j<=endMonth&&startYear==endYear&&j<=12)||(startYear!=endYear&&j<=12);j++){
        dateRange.push( moment( startYear+'-'+j,'YYYY-M').format('MMM YYYY'))
    }

    // rest dates
    for(var i = parseInt(startYear)+1; i<=endYear; i++){
      for(var j = 1;(j<=endMonth&&i==endYear&&j<=12)||(i!=endYear&&j<=12);j++){
        dateRange.push( moment( i+'-'+j,'YYYY-M').format('MMM YYYY'))
      }
    }

    $scope.dateRange = dateRange;

    $scope.chartdata = {
      labels : dateRange,
      datasets : [
      {
        label:'Menot',
        fillColor : "rgba(0,0,0,0)",
        strokeColor : "#fa4789",
        pointColor : "#fa4789",
        pointStrokeColor : "#eee",
        pointHighlightFill: "#B2305F",
        //data :  _.map(dateRange, function(item) {return outcomeVariation[item]&&outcomeVariation[item].sum ? Math.round(outcomeVariation[item].sum*10)/10 : 0})
        data :  _.map(dateRange, function(item) {return 0} )
      }, {
        label:'Tulot',
        fillColor : "rgba(0,0,0,0)",
        strokeColor : "#44AAE5",
        pointColor : "#44AAE5",
        pointStrokeColor : "#eee",
        pointHighlightFill: "#399ACE",
        data :  _.map(dateRange, function(item) {return 0})
        //data :  _.map(dateRange, function(item) {return incomeVariation[item]&&incomeVariation[item].sum ? Math.round(incomeVariation[item].sum*10)/10 : 0})
      }]
    };


      var variation = calculateVariation(bankdata);
      $scope.chartdata.datasets[0].data = _.map(dateRange, function(item) {return variation.outcome[item]&&variation.outcome[item].sum ? Math.round(variation.outcome[item].sum*10)/10 : 0});
      $scope.chartdata.datasets[1].data = _.map(dateRange, function(item) {return variation.income[item]&&variation.income[item].sum ? Math.round(variation.income[item].sum*10)/10 : 0})


      // Group by saaja/maksaja
      var data = _.groupBy(bankdata, function(item) {
       return item.target.toLowerCase().trim();
      })

  		// Parse outcome & income
  		_.map(data, function(shop,id){
        var tmpOut = [], tmpIn = [], tmpSum;

        _.map(shop,function(purchase){
          if(parseFloat(purchase.sum.replace(',','.')) > 0)
            tmpIn.push(purchase)
          else
            tmpOut.push(purchase)
        })

        if(tmpOut.length){
          tmpSum = Math.round( _.reduce(tmpOut, function(memo, num){ var price = (-1 * parseFloat(num.sum.replace(',','.'))); return price > 0 ? memo + price : memo },0) )
          outcome.push({
            id:id,
            percentage: 0,
            length:tmpOut.length,
            sum: tmpSum,
            avg: Math.round(tmpSum/tmpOut.length*10)/10
          })
        }
        if(tmpIn.length){
          tmpSum = Math.round( _.reduce(tmpIn, function(memo, num){ var price = parseFloat(num.sum.replace(',','.')); return price > 0 ? memo + price : memo },0) )
          income.push({
            id:id,
            percentage: 0,
            length:tmpIn.length,
            sum: tmpSum,
            avg: Math.round(tmpSum/tmpIn.length*10)/10
          })
        }



      })

  		// Sort by sum
  		outcome = _.sortBy(outcome, function(item){
  			return item.sum;
  		}).reverse();

      income = _.sortBy(income, function(item){
        return item.sum;
      }).reverse();




  		// Add to scope
      $scope.outcome = outcome;
      $scope.income = income;

      // delayed percentage
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
      }, 3000)

      $scope.loaded = true;
      $scope.mode = 'outcome';

      //scroll to menu
      $timeout(function(){
        window.scrollTo(0, $("#account-menu").offset().top);
      }, 100)

  }



    $scope.total = function(data,id){
      return _.reduce(data,function(memo, num) {
        return  $scope.hidden.indexOf(num.id) >= 0 ? memo : memo+parseInt(num.sum)
      },0)
    }


    $scope.changeMode=function(mode){
      $scope.mode=mode;
    }


    // Hide elements
    $scope.hidden = []

    $scope.hide = function(target){
      if($scope.hidden.indexOf(target)>=0)
        $scope.hidden = _.without($scope.hidden, target)
      else
        $scope.hidden.push(target)

    }


    $scope.reCalcChart = function(outcome, filter) {

      var startData = $scope.bankdata, itemName;
      filter = (filter || '').toLowerCase();

      startData = _.filter(startData, function(item){
        itemName = item.target.toLowerCase();
        return itemName.indexOf(filter) >=0 && $scope.hidden.indexOf(itemName) < 0;
      })

      var variation = calculateVariation(startData);
      if(outcome){

        // Own line
        $scope.chartdata.datasets[0].data = _.map($scope.dateRange, function(item) {
          return variation.outcome[item] && variation.outcome[item].sum
            ? Math.round(variation.outcome[item].sum * 10) / 10
            : 0
        });

        // Hide other line
        $scope.chartdata.datasets[1].data = filter.length
         ? []
         : _.map($scope.dateRange, function(item) {return variation.income[item] && variation.income[item].sum ? Math.round(variation.income[item].sum*10)/10 : 0});


      } else {

        // own line
        $scope.chartdata.datasets[1].data = _.map($scope.dateRange, function(item) {
          return variation.income[item] && variation.income[item].sum
            ? Math.round(variation.income[item].sum * 10) / 10
            : 0
        });


        // Hide other line
        $scope.chartdata.datasets[0].data = filter.length
         ? []
         : _.map($scope.dateRange, function(item) {return variation.outcome[item] && variation.outcome[item].sum ? Math.round(variation.outcome[item].sum*10)/10 : 0});

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
