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
            analyzeFile();
        });
    } else {
        customText.innerHTML = "No file chosen";
        scanButton.style.display = "none";
    }
});

(function () {
    let dropzone = document.getElementById('dropzone');

    dropzone.ondrop = function (e) {
        e.preventDefault();
        this.className = 'dropzone';
        alert('\'' + e.dataTransfer.files[0].name + '\'' + ' successfully uploaded!');
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
    // Please use your own Path
    // let dir = '/Users/cuongvqnguyen/Documents/School/Fall 2018/SE 133/angularjs-typescript-webpack';
    let dir = '/Users/cuongvqnguyen/Documents/School/Fall 2018/SE 133/ngmaElectron/angular-phonecat-copy2';
    let analysis = new AnalysisTool(dir);
    analysis.promiseSchedule(dir, function(){
        //print ngma results
        let h = document.querySelector('.results-panel');
        let report = '<h2>' + "Welcome to ngMigration Assistant!" + '</h2>'
            + '<br>' + "Here are the criteria I am scanning for in your application:"
            + '<br>' + "  * Complexity" + '<br>' + "  * App size in lines of code and amount of relevant files and folders"
            + '<br>' + "  * AngularJS patterns" + '<br>' + "  * AngularJS version" + '<br>'
            + "  * Preparation necessary for migration" + '<br>'
            + "To learn more about criteria selection, visit https://angular.io/guide/upgrade#preparation." + '<br>';

        let blah = analysis.runAppStatistics();
        console.log('BLAh: ' + blah);
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
    });
}