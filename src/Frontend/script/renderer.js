const realFileButton = document.getElementById("real-file");
const customButton = document.getElementById("custom-button");
const scanButton = document.getElementById("scanbutton");

let dir, fileName;
let dropzone = document.getElementById('dropzone');
// Opens file manager
customButton.addEventListener("click", function () {
    realFileButton.click();
});

let promise = new Promise(function(resolve, reject) {
    // do a thing, possibly async, then…
    if (resolve) {
        resolve("Stuff worked!");
    }
    else {
        reject(Error("It broke"));
    }
});

scanButton.addEventListener("click", function () {
    promise.then(() => {
        document.body.innerHTML += "<div class='loading'></div>";
    }).then(() => {
        setTimeout(function() {
            analyzeFile(dir, fileName);
        }, 100);
    })
});

// Displays file name when user selects a file
realFileButton.addEventListener("change", function (e) {

    // realFileButton performs all actions --> contains value of file
    // Updates customText to name of file

    if (realFileButton.value) {
        dir = this.files[0].path;
        fileName = this.files[0].name;
        customText.innerHTML = fileName;
        scanButton.style.display = "block";
        // alert('Uploaded Successfully');
    } else {
        customText.innerHTML = "No file chosen";
        scanButton.style.display = "none";
    }
});

(function () {

    dropzone.ondrop = function (e) {
        e.preventDefault();
        this.className = 'dropzone';
        dir = e.dataTransfer.files[0].path;
        fileName = e.dataTransfer.files[0].name;
        customText.innerHTML = fileName;
        scanButton.style.display = "block";
        // alert('\'' + e.dataTransfer.files[0].name + '\'' + ' successfully uploaded!');
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

