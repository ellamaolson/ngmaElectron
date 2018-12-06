const realFileButton = document.getElementById("real-file");
const customButton = document.getElementById("custom-button");
const customText = document.getElementById("custom-text");
const scanButton = document.getElementById("scanbutton");
//analyzeFile();
// Opens file manager
customButton.addEventListener("click", function () {
    realFileButton.click();
    scanButton.click();
});
// Displays file name when user selects a file
realFileButton.addEventListener("change", function () {
    // realFileButton performs all actions --> contains value of file
    // Updates customText to name of file
    if (realFileButton.value) {
        customText.innerHTML = realFileButton.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        scanButton.style.display = "block";
        alert('Uploaded Successfully');
        scanButton.addEventListener("click", function () {
            alert(2);
            analyzeFile();
        });
    } else {
        customText.innerHTML = "No file chosen";
        scanButton.style.display = "none";
    }
});
(function () {
    var dropzone = document.getElementById('dropzone');
    dropzone.ondrop = function (e) {
        e.preventDefault();
        this.className = 'dropzone';
        alert('\'' + e.dataTransfer.files[0].name + '\'' + ' successfully uploaded!');
        scanButton.style.display = "block";
    };
    dropzone.ondragover = function () {
        this.className = 'dropzone dragover';
        return false;
    };
    dropzone.ondragleave = function () {
        this.className = 'dropzone';
        return false;
    };
}());
//Run ngma on the directory then print results
function analyzeFile() {
    //ngma instance

    const AnalysisTool = require('./dist/analysisTool').AnalysisTool; //'ngma/analysisTool'
    var dir = '../angular-phonecat';

    var analysis = new AnalysisTool(dir);

    analysis.promiseSchedule(dir, function(){
    //     alert(3);
        //print ngma results
        var h = document.querySelector('.results-panel');
        var report = '<h2>' + "Welcome to ngMigration Assistant!" + '</h2>'
            + '<br>' + "Here are the criteria I am scanning for in your application:"
            + '<br>' + "  * Complexity" + '<br>' + "  * App size in lines of code and amount of relevant files and folders"
            + '<br>' + "  * AngularJS patterns" + '<br>' + "  * AngularJS version" + '<br>'
            + "  * Preparation necessary for migration" + '<br>'
            + "To learn more about criteria selection, visit https://angular.io/guide/upgrade#preparation." + '<br>';

        var blah = analysis.runAppStatistics();
        console.log('BLAh: ' + blah);
        blah.forEach(function (element, asd) {
            if (element == analysis.runAppStatistics()[0]) {
                report += '<br><h4>' + element + " " + asd + '</h4>';
            } else {
                report += element + " " + '<br>' ;
            }
        });
        report += '<p>';
        analysis.runRecommendation().forEach(function (element) {
            if (element == analysis.runRecommendation()[0]) {
                report += '<br><h4>' + element + '</h4>';
            } else {
                report += element + '<br>';
            }
        });
        report += '<p>';
        analysis.analysisDetails.antiPatternReport.forEach(function (element) {
            if (element == "Files that contain AngularJS patterns and need to be modified:") {
                report += '<br><h4>' + element + '</h4>';
            } else {
                report += element + '<br>';
            }
        });
        report += '<br>' + "Head to Migration-Forum to understand this migration approach, found at https://github.com/angular/ngMigration-Forum/wiki" + '<br>';
        h.innerHTML = report;
    });

}