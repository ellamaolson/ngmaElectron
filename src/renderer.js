// Default button from <input type = "file">
const realFileButton = document.getElementById("real-file");

// Bootstrap button connected to realFileButton
const customButton = document.getElementById("custom-button");

// Displays file name
const customText = document.getElementById("custom-text");

const scanButton = document.getElementById("scanbutton");

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
        alert('Upload Successful!');
        scanButton.addEventListener("click", function () {
            const AnalysisTool = require('./dist/analysisTool').AnalysisTool; //'ngma/analysisTool'
            alert('Scan Button Pressed1asdsasd!');
            var a = new AnalysisTool('./angular-phonecat-copy2');

            var h = document.createElement('h1');
            h.innerText = a.runAppStatistics();
            document.body.appendChild(h);

            alert('after!');
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