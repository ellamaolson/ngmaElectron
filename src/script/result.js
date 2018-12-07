//Run ngma on the directory then print results
function analyzeFile(dir, fileName) {
    //ngma instance

    const AnalysisTool = require('./dist/lib/analysisTool').AnalysisTool; //'ngma/analysisTool'

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
            if (element === blah[0]) {
                report += '<br><h4>' + element + '</h4>';
            } else {
                report += element + " " + '<br>' ;
            }
        });

        report += '<p>';
        let blah2 = analysis.runRecommendation();
        blah2.forEach(function (element) {
            if (element === blah2[0]) {
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
        report += '<br> <button onclick="window.location.href=\'#/home\'" class="btn btn-info text-center">Scan A New Project</button>';
        h.innerHTML = report;
    });

    setTimeout(function() {
        $(".loading").fadeOut("slow");
    }, 1000);
}