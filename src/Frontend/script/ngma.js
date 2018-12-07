let customText  = document.getElementById("custom-text");
let isDone = false;

//Run ngma on the directory then print results
function analyzeFile(dir, fileName) {
    //ngma instance

    const AnalysisTool = require('./dist/analysisTool').AnalysisTool; //'ngma/analysisTool'

    let analysis = new AnalysisTool(dir);
    analysis.promiseSchedule(dir, function(){
        //print ngma results

        let h = document.querySelector('.results-panel');
        let report = '<h2>' + "Welcome to ngMigration Assistant!" + '</h2>'
            + '<br>' + "Here are the criteria I am scanning for in your "+ '<b>' + fileName + '</b>' + " application:"
            + '<br>' + "  * Complexity" + '<br>' + "  * App size in lines of code and amount of relevant files and folders"
            + '<br>' + "  * AngularJS patterns" + '<br>' + "  * AngularJS version" + '<br>'
            + "  * Preparation necessary for migration" + '<br>'
            + "To learn more about criteria selection, visit https://angular.io/guide/upgrade#preparation." + '<br>';

        let blah = analysis.runAppStatistics();
        // console.log('BLAh: ' + blah);
        blah.forEach(function (element) {
            if (element === analysis.runAppStatistics()[0]) {
                report += '<br><h4>' + element + '</h4>';
            } else {
                report += element + " " + '<br>' ;
            }
        });

        report += '<p>';
        analysis.runRecommendation().forEach(function (element) {
            if (element === analysis.runRecommendation()[0]) {
                report += '<br><h4>' + element + '</h4>';
            } else {
                report += element + '<br>';
            }
        });
        report += '<p>';
        analysis.analysisDetails.antiPatternReport.forEach(function (element) {
            if (element === "Files that contain AngularJS patterns and need to be modified:") {
                report += '<br><h4>' + element + '</h4>';
            } else {
                report += element + '<br>';
            }
        });
        report += '<br>' + "Head to Migration-Forum to understand this migration approach, found at https://github.com/angular/ngMigration-Forum/wiki" + '<br>';
        h.innerHTML = report;
        isDone = true;
    });
    $(".loading").fadeOut("fast");
}