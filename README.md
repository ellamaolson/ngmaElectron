# ngMigration Assistant Desktop App

ngMigration Assistant Electron is an easy-to-use desktop app that scans an AngularJS application and recommends how to migrate to Angular. Click <a href = "./ngmaDesktop.zip" download = "ngmaDesktop">here</a> to download ngmaDesktop.

<img width="796" alt="screen shot 2018-12-03 at 11 00 30 pm" src="https://user-images.githubusercontent.com/27384475/49424392-47919380-f74f-11e8-9e13-133115274fa6.png">

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/ellamaolson/ngmaElectron
# Go into the repository
cd ngmaElectron
# Install dependencies
npm install
# Run the app
npm start
```

## Re-compile automatically

To recompile automatically and to allow using [electron-reload](https://github.com/yan-foto/electron-reload), run this in a separate terminal:

```bash
npm run watch
```

## App Composition

###  Class: analysisTool

Runs the analysis on the provided directory and returns a recommendation on which migration path to take to Angular. It looks at the complexity, source lines of code (sloc), antipatterns, AngularJS version, and preparation necessary for migration. It identifies the files that need to be modified and the specific changes that will prepare the app for upgrading. 

### Methods

* ```buildPathIgnoringGlobs()``` Builds a new filesystem by removing files matching the ignore globs using glob. Returns as an array of the new filesystem.
* ```getGlobsFromGitignore()``` Parses .gitignore file into an array of globs and appends default globs to the array. Filters out patterns starting with ! from the array because ! means to never ignore. Returns the globs to ignore.
* ```countLinesOfCode()``` ***asynchronous*** Counts sloc using node-sloc to traverse new filesystem returned by buildPathIgnoringGlobs(). Returns a promise that resolves to sloc.
* ```runAnalysis()``` Traverses through filtered filesystem returned by buildPathIgnoringGlobs() and calls testFile() to run the individual tests.
* ```runAntiPatternReport()``` ***asynchronous*** Creates the anti-pattern report and calculates the rewriteThreshold runRecommendation() uses. Each time an anti-pattern is found, general instructions and files needing corrections are appended to the preparation report. Returns a promise that resolves to the preparation report. 
* ```runRecommendation()``` ***asynchronous*** Recommendation algorithm that checks type of application (AngularJS, Angular, or hybrid), checks if sloc is under the rewriteThreshold, and checks if passes the ngUpgrade requirements. Returns a recommendation and preparation report. 

### Built With

* [node-glob](https://www.npmjs.com/package/glob)
* [parse-gitignore](https://www.npmjs.com/package/parse-gitignore)
* [node-sloc](https://www.npmjs.com/package/node-sloc)
* [readline-sync](https://www.npmjs.com/package/readline-sync)

## Authors

**Elana Olson** - [ellamaolson](https://github.com/ellamaolson)

**Calvin Cuong**

**Sara Akhtar**

**Sri Devi**

**Ziyun He**


## License 

Use of this source code is governed by an MIT-style license.





