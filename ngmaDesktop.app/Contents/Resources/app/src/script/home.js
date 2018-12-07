App.realFileButton = document.getElementById("real-file");
App.customButton = document.getElementById("custom-button");
App.scanButton = document.getElementById("scanbutton");

App.customText  = document.getElementById("custom-text");
App.dropzone = document.getElementById('dropzone');

// Opens file manager
App.customButton.addEventListener("click", function () {
    App.realFileButton.click();
});

// Displays file name when user selects a file
App.realFileButton.addEventListener("change", function () {

    // realFileButton performs all actions --> contains value of file
    // Updates customText to name of file

    if (App.realFileButton.value) {
        App.directory = this.files[0].path;
        App.fileName = this.files[0].name;
        App.customText.innerHTML = App.fileName;
        App.scanButton.style.display = "block";
    } else {
        App.customText.innerHTML = "No file chosen";
        App.scanButton.style.display = "none";
    }
});
(function () {

    App.dropzone.ondrop = function (e) {
        e.preventDefault();
        App.directory = e.dataTransfer.files[0].path;
        App.fileName = e.dataTransfer.files[0].name;
        App.customText.innerHTML = App.fileName;
        App.scanButton.style.display = "block";
    };

    App.dropzone.ondragover = function () {
        return false;
    };

    App.dropzone.ondragleave = function () {
        return false;
    };
}());

