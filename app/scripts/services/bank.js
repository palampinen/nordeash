 
angular.module('nordeashApp')
  .service('Bank', function () {

    var settings = {
      nordea:{
        delimiter: new RegExp ('(\t(?=(?:(?:[^"]*"){2})*[^"]*$))', 'g'),
        date:0,
        sum:3,
        target:4,
        startRow:3 
      },
      osuuspankki:{
        delimiter: new RegExp (';', 'g'),
        date:0,
        sum:2,
        target:5,
        startRow:1
      }
    }

    return {
      upload:function(id,bank,cb) { 
        bank = bank.toLowerCase();     
        var fileUpload = document.getElementById(id);
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/,
            delimiterRegex = settings[bank].delimiter;
           // tabregex  = new RegExp (tab, 'g');

          
        if (regex.test(fileUpload.value.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data  = [];
                    var rows = e.target.result.split("\n");

                    for (var i = settings[bank].startRow; i < rows.length; i++) {

                        rows[i] = rows[i].replace(delimiterRegex, '{;}');
                        var cells = rows[i].split("{;}").slice(0,6);

                        if(cells[settings[bank].date]&&cells[settings[bank].sum])
                        data.push({
                          date: cells[settings[bank].date],
                          sum: cells[settings[bank].sum],
                          target: cells[settings[bank].target]
                        })


                    }

                    cb(data);
                }
                reader.readAsText(fileUpload.files[0]);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid CSV/TXT file.");
        }
      }
    }


  });