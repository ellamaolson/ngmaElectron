const realFileButton = document.getElementById("real-file");
const customButton = document.getElementById("custom-button");
const scanButton = document.getElementById("scanbutton");

let dir;
let dropzone = document.getElementById('dropzone');
// Opens file manager
customButton.addEventListener("click", function () {
    realFileButton.click();
});

scanButton.addEventListener("click", function () {
    analyzeFile(dir);
});

// Displays file name when user selects a file
realFileButton.addEventListener("change", function (e) {

    // realFileButton performs all actions --> contains value of file
    // Updates customText to name of file

    if (realFileButton.value) {
        // console.log(realFileButton.getPath());
        dir = this.files[0].path;
        customText.innerHTML = realFileButton.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];

        scanButton.style.display = "block";
        alert('Uploaded Successfully');
    } else {
        customText.innerHTML = "No file chosen";
        scanButton.style.display = "none";
    }
});

(function () {

    dropzone.ondrop = function (e) {
        e.preventDefault();
        this.className = 'dropzone';
        console.log(e.dataTransfer.files[0].path);
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

