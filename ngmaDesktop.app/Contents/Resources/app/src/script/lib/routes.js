Path.map("#/home").to(function() {
    $("#stage").load("src/screens/home.html");
});

Path.map("#/about").to(function() {
    $("#stage").load("src/screens/about.html");
});

Path.map("#/result").to(function() {
    $("#stage").load("src/screens/result.html");
});

Path.root("#/home");
Path.listen();