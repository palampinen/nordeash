 
angular.module('nordeashApp')
  .service('Bank', function ($q,$http) {


    return {
      upload:function(id,cb) {      
        var fileUpload = document.getElementById(id);
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/,
            tab = '(\t(?=(?:(?:[^"]*"){2})*[^"]*$))',
            tabregex  = new RegExp (tab, 'g');
          
        if (regex.test(fileUpload.value.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data  = [];
                    var rows = e.target.result.split("\n");

                    for (var i = 3; i < rows.length; i++) {

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
    }


  });