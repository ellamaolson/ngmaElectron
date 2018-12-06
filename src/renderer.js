// Default button from <input type = "file">
// import {AnalysisTool} from "./analysisTool";

const realFileButton = document.getElementById("real-file");

// Bootstrap button connected to realFileButton
const customButton = document.getElementById("custom-button");

// Displays file name
const customText = document.getElementById("custom-text");

const scanButton = document.getElementById("scanbutton");

// Opens file manager
customButton.addEventListener("click", function() {
    realFileButton.click();
});

// Displays file name when user selects a file
realFileButton.addEventListener("change", function() {

    // realFileButton performs all actions --> contains value of file
    // Updates customText to name of file
    if(realFileButton.value) {
        customText.innerHTML = realFileButton.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        // scanButton.style.display = "block";
        alert('Upload Successful!');
    }
    else {
        customText.innerHTML = "No file chosen";
        scanButton.style.display = "none";
    }
});

let scan_button = document.getElementById("scan-button");

scan_button.addEventListener("click", async function() {
    alert("Oh");
});

(function() {
    let dropzone = document.getElementById('dropzone');
    let a = new AnalysisTool("../angular-phonecat");
    a.run("../angular-phonecat");
    alert(a.getJSON().Complexity);

    dropzone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'dropzone';
        scanButton.style.display = "block";
        alert('\'' + e.dataTransfer.files[0].name + '\'' + ' successfully uploaded!');
    };

    dropzone.ondragover = function() {
        this.className = 'dropzone dragover';
        return false;
    };

    dropzone.ondragleave = function() {
        this.className = 'dropzone';
        return false;
    };
}());