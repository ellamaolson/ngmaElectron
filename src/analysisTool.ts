/**
 * ngMigration Assistant scans an AngularJS application and recommends
 * a particular migration path to take to Angular. It looks for good practices
 * and anti-patterns to help determine which stage in migration the
 * application is and which migration path is right for you.
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import {Project, ScriptTarget} from "ts-simple-ast";

const nodesloc = require('node-sloc');
const gitignore = require('parse-gitignore');
const glob = require('glob');
const project = new Project({
    compilerOptions: {
        target: ScriptTarget.ES3
    }
});

const cheerio = require('cheerio');
const esprima = require('esprima');
const walk = require( 'esprima-walk' );

export class AnalysisTool {

    private CODE_LIMIT_MULTIPLIER: number = 1.25;
    private VALUE_NOT_FOUND: number = -1;

    numDotComponentCount = 0;
    numAtComponentCount = 0;


    analysisDetails = {
        rewriteThreshold: 880, // 880 lines is considered 1 month's work of coding
        angularElement: false,
        rootScope: false,
        compile: false,
        uiRouter: false,
        angularjsRouter: false,
        angularRouter: false,
        hasUnitTest: false,
        usingAngular: false,
        usingAngularJS: false,
        totalFilesOrFolderCount: 0,
        relevantFilesOrFolderCount: 0,
        jsFileCount: 0,
        tsFileCount: 0,
        controllersCount: 0,
        componentCount: 0,
        linesOfCode: 0,
        mapOfFilesToConvert: new Map(),
        antiPatternReport: new Array(),
    };

    /**
     * Calls countLinesOfCode and waits for it to finish executing before calling
     * the contained methods: runAnalysis(), runAntiPatternReport() which must
     * finish executing before calling runRecommendation().
     * @param rootpath user input original directory path
     */
    constructor(rootpath: string) {
        // console.log("ROOTPATH: " + rootpath);
        this.analysisDetails.mapOfFilesToConvert = new Map <String, Array<String>> ();
        setTimeout(() => {}, 1000);
        this.promiseSchedule(rootpath, function(){});
        project.addExistingSourceFiles(rootpath + "/**/*{.d.ts,.ts}");


    }

    promiseSchedule(rootpath: string, callback: Function) {
        // console.log("ROOTPATH 2: " + rootpath);
        this.countLinesOfCode(rootpath, this.buildPathIgnoringGlobs(rootpath))
            .then(sourceLines => {
                this.analysisDetails.linesOfCode = sourceLines;
                this.runAnalysis(rootpath);
                return this.runAntiPatternReport();
            })
            .catch(err => {
                console.error("Error 1: ", err);
            })
            .then(report => {
                this.runAppStatistics();
                console.log(this.runAppStatistics());
                this.analysisDetails.antiPatternReport = report;
                console.log(report);
                this.runRecommendation();
                console.log(this.runRecommendation());
                console.log("rewriteThreshold: " + Math.round(this.analysisDetails.rewriteThreshold) + ", sloc: " + this.analysisDetails.linesOfCode + "\n");
                callback();
            })
            .catch(err => {
                console.error("Error 2: ", err);
            });
    }

    /**
     * Builds a new filesystem by removing files matching the ignore globs using glob.
     * Returns as an array of files and folders.
     * @param rootPath original directory path
     */
    buildPathIgnoringGlobs(rootpath: string) {
        let ignoreGlobs = this.getGlobsFromGitignore(rootpath);
        let filesWithoutIgnores = glob.sync("**", {
            ignore: ignoreGlobs,
            cwd: rootpath
        });
        this.analysisDetails.totalFilesOrFolderCount = filesWithoutIgnores.length;
        return filesWithoutIgnores;
    }

    /**
     * Parses .gitignore file into an array of ignoreGlobs and appends default ignoreGlobs
     * to the array. Filters out patterns starting with ! from the ignoreGlobs array
     * because ! means to never ignore. Returns the globs to ignore.
     * @param rootpath original directory path
     */
    getGlobsFromGitignore(rootpath: string): string[] {
        let allIgnoreGlobs: string[] = [];
        let defaultIgnoreGlobs = [
            'node_modules', 'node_modules/**', '**/node_modules', '**/node_modules/**',
            '.git', '.git/**', '**/.git', '**/.git/**',
            'tsconfig.json', 'tsconfig.json/**', '**/tsconfig.json', '**/tsconfig.json/**',
            'e2e', 'e2e/**', '**/e2e', '**/e2e/**',
            'jquery.js', 'jquery.js/**', '**/jquery.js', '**/jquery.js/**',
            'angular.js', 'angular.js/**', '**/angular.js', '**/angular.js/**'
        ];
        allIgnoreGlobs = [...gitignore(rootpath + "/.gitignore"), ...defaultIgnoreGlobs].filter((pattern) => {
            return !pattern.startsWith("!");
        });
        return allIgnoreGlobs;
    }

    // /**
    //  * DO NOT DELETE - possible for future implementation!
    //  * Another way of parsing the .gitignore and building a new filesystem. Scans only
    //  * git repos and asks git for a list of files to check from the .gitignore file
    //  * within the given directory. Uses grep to ignore default ignore globs.
    //  */
    // const exec = require('child_process').exec;
    // buildPathIgnoringGlobs(path: string) {
    //     exec("cd \"" + path + "\" && git ls-tree -r master --name-only | egrep -v \".*(node_modules|e2e|.git|tsconfig.json).*\"", function (error: string, data: string) {
    //         let a = data.split("\n");
    //         a.pop();
    //         console.log(a);
    //     });
    // }

    /**
     * Counts the source lines of code (sloc) using node-sloc to traverse through
     * the passed in filesystem. Uses filtered filesystem as not count sloc
     * in node_modules and other ignored files. Returns a promise that resolves to sloc.
     * @param rootPath original directory path
     * @param filteredFilePaths filtered filesystem buildPathIgnoringGlobs() returns
     */
    async countLinesOfCode(rootPath: string, filteredFilePaths: string[]): Promise < any > {
        return new Promise((resolve, reject) => {
            const promisesINeedResolvedForMeToBeDone = [];

            let lines: number = 0;
            for (let file of filteredFilePaths) {
                const options = {
                    path: rootPath + "/" + file,
                    extensions: ['js', 'ts', 'html'],
                    ignorePaths: ['node_modules'],
                    ignoreDefaut: false,
                };
                promisesINeedResolvedForMeToBeDone.push(
                    nodesloc(options)
                        .then((results: any) => {
                            lines += results.sloc.sloc || 0;
                        })
                        .catch((err: any) => {
                            console.log("Is there");
                            console.error(err);
                            reject(err);
                        })
                );
            }
            Promise.all(promisesINeedResolvedForMeToBeDone).then(() => resolve(lines));
        });
    }

    /**
     * Traverses through filtered filesystem returned by buildPathIgnoringGlobs()
     * and calls testFile() to run the individual tests.
     * @param rootPath original directory path
     */
    private runAnalysis(rootpath: string) {
        for (let fileOrFolder of this.buildPathIgnoringGlobs(rootpath)) {
            let currentPath = rootpath + "/" + fileOrFolder;
            if (fs.lstatSync(currentPath).isFile()) {
                // this.testFile(currentPath);
                this.checkTypeForAST(currentPath);
            }
        }
    }

    /**
     * Calls tests on each file in the filtered filesystem to looks for anti-patterns,
     * Angular version, and additional practices.
     * @param currentPath
     */
    async testFile(currentPath: string) {
        let tests = [
            (filename: string, data: string) => this.checkFileForRootScope(filename, data),
            (filename: string, data: string) => this.checkFileForCompile(filename, data),
            (filename: string, data: string) => this.checkFileForAngularElement(filename, data),
            (filename: string, data: string) => this.checkFileForRouter(filename, data),
            (filename: string, data: string) => this.checkFileForUnitTests(filename, data),
            (filename: string, data: string) => this.checkAngularVersion(filename, data),
            (filename: string, data: string) => this.checkFileForScriptingLanguage(filename, data),
            (filename: string, data: string) => this.checkFileForComponent(filename, data)
        ];

        if (currentPath.substr(-3) === '.js' || this.fileHasTsExtension(currentPath) || currentPath.substr(-5) === '.html' || currentPath.substr(-5) === '.json') {
            this.analysisDetails.relevantFilesOrFolderCount++;
            for (let i = 0; i < tests.length; i++) {
                tests[i](currentPath, fs.readFileSync(currentPath, "utf8"));
            }
        }
    }

    checkTypeForAST(currentPath: string) {
        if (this.fileHasTsExtension(currentPath)) {                  // If file is TypeScript ==> TS Parser
            this.analysisDetails.tsFileCount++;
            this.testFileUsingTsAST(currentPath);
        } else {
            let scriptContent;
            if (currentPath.substr(-5) === '.html') {                             // If file is HTML --> HTML Parser --> Check if there's JS
                const $ = cheerio.load(fs.readFileSync(currentPath, "utf8"));
                scriptContent = $('script').html();
            } else {
                scriptContent = fs.readFileSync(currentPath, "utf8");
            }
            // this.testJSFileUsingEsprimaParser(scriptContent);
        }
    }


    testJSFileUsingEsprimaParser(fileData: string) {
        // fileData = this.trimShebang(fileData);  // we always have to trim the file first before scan
        let tree = esprima.parse(fileData);
        walk(tree, function ( node:any ) {
            if(node.type === 'Identifier') {
                if (node.name === '$rootScope') { // find the rootScope
                    //this.analysisDetails.rootScope = true;
                    //this.pushValueOnKey(this.analysisDetails.mapOfFilesToConvert, filename, " $rootScope");
                } else if (node.name === 'createCustomElement') { // find the createCustomElement
                    // find
                } else if (node.name === 'controller') { // find the controller
                    // find
                } else if (node.name === 'component') { // find the component
                    // find
                }
            }
            if(node.type === 'Literal' && node.value === '@angular/core') {
                // find the @angular/core
            }
        });
    }

    fileHasTsExtension(filename: string): boolean {
        return filename.endsWith('.ts') && !filename.endsWith('.d.ts');
    }

    /**
     * Test TypeScript File
     * @param currentPath
     */
    testFileUsingTsAST(currentPath: string) {
        let tests = [
            () => this.checkTSFileForRootScope(currentPath),
            () => this.checkTSFileForCompile(currentPath),
            () => this.checkTSFileForAngularElement(currentPath),
            () => this.checkTSFileForComponent(currentPath)
        ];

        for (let i = 0; i < tests.length; i++) tests[i]();
    }


    checkTSFileForRootScope(filePath: string) {
        const sourceFile = project.getSourceFileOrThrow(filePath);


        const classesList = sourceFile.getClasses();
        const variableDeclarationList = sourceFile.getVariableDeclarations();

        // Check if it's a variable Declaration
        for (let i = 0; i < variableDeclarationList.length - 1; i++) {
            if (variableDeclarationList[i].getName() === "$rootScope") {
                this.addFileToSpecificMap(filePath, " $rootScope");
            }
        }

        for (let i = 0; i < classesList.length; i++) {
            let functionList = classesList[i].getMethods();
            let propertyList = classesList[i].getProperties();

            // Check if it's defined in a class
            for (let j = 0; j < propertyList.length - 1; j++) {
                if (propertyList[j].getName() === "$rootScope")
                    this.addFileToSpecificMap(filePath, " $rootScope");
            }

            for (let j = 0; j < functionList.length - 1; j++) {

                // Check if it's used in a body of a function
                for (let k = 0; k < functionList[j].getVariableDeclarations().length - 1; k++) {
                    if (functionList[j].getVariableDeclarations()[k].getName() === "$rootScope") {
                        this.addFileToSpecificMap(filePath, " $rootScope");
                    }
                }

                // Check if it's a variable in a parameter
                if (functionList[j].getParameter("$rootScope")) {
                    this.addFileToSpecificMap(filePath, " $rootScope");
                }
            }
        }
    }

    checkTSFileForCompile(filePath: string) {
        const sourceFile = project.getSourceFileOrThrow(filePath);
        const classesList = sourceFile.getClasses();

        for (let i = 0; i < classesList.length; i++) {
            let functionList = classesList[i].getMethods();
            for (let j = 0; j < functionList.length - 1; j++) {
                if (functionList[j].getName() === "compile") {
                    this.addFileToSpecificMap(filePath, " $compile")
                }
            }
        }
    }

    checkTSFileForAngularElement(filePath: string) {
        const sourceFile = project.getSourceFileOrThrow(filePath);
        const classesList = sourceFile.getClasses();
        const importList = sourceFile.getImportDeclarations();

        for (let i = 0; i < importList.length - 1; i++) {
            for (let j = 0; j < importList[i].getNamedImports().length; j++) {
                if (importList[i].getNamedImports()[j].getName() === "createCustomElement") {
                    this.analysisDetails.angularElement = true;
                }
            }
        }

        for (let i = 0; i < classesList.length; i++) {
            for (let j = 0; j < classesList[i].getConstructors().length; j++) {
                if (classesList[i].getConstructors()[j].getNamespace("createCustomElement")) {
                    this.analysisDetails.angularElement = true;
                }
            }
        }
    }

    checkTSFileForComponent(filePath: string) {
        const sourceFile = project.getSourceFileOrThrow(filePath);
        const classesList = sourceFile.getClasses();

        // Check if .component + .controller
        const temp1 = sourceFile.getStatements();
        for (let i = 0; i < temp1.length; i++) {
            temp1[i].forEachDescendant((node) => {
                if (node.getKindName() === "PropertyAccessExpression") {
                    node.forEachDescendant((anotherNode) => {
                        if (anotherNode.getFullText() === "controller") {
                            // console.log("found .controller ");
                            this.addFileToSpecificMap(filePath, " controller");
                        } else if (anotherNode.getFullText() === "component") {
                            // console.log("found .component" + " " + sourceFile.getBaseName());
                            this.numDotComponentCount++;
                            this.analysisDetails.componentCount++;
                        }
                    });
                }
            });
        }


        // Check if @component --> Check for decorator
        for (let i = 0; i < classesList.length; i++) {
            if (classesList[i].getDecorator("Component")) {
                this.numAtComponentCount++;
                this.analysisDetails.componentCount++;
            }
        }
    }


    addFileToSpecificMap(filePath: string, value: string) {
        if (value === " $rootScope") this.analysisDetails.rootScope = true;
        else if (value === " $compile") this.analysisDetails.compile = true;
        else if (value === " controller") this.analysisDetails.controllersCount++;
        this.pushValueOnKey(this.analysisDetails.mapOfFilesToConvert, filePath, value);
    }



    checkFileForRootScope(filename: string, fileData: string) {
        if (filename.substr(-7, 4) != 'spec' && !filename.includes('test')) {
            if (fileData.match(/\$rootScope/)) {
                this.analysisDetails.rootScope = true;
                this.pushValueOnKey(this.analysisDetails.mapOfFilesToConvert, filename, " $rootScope");
            }
        }
    }

    checkFileForCompile(filename: string, fileData: string) {
        if (filename.substr(-7, 4) != 'spec' && !filename.includes('test')) {
            if (fileData.match(/compile\(/)) {
                this.analysisDetails.compile = true;
                this.pushValueOnKey(this.analysisDetails.mapOfFilesToConvert, filename, " $compile");
            }
        }
    }

    checkFileForAngularElement(filename: string, fileData: string) {
        if (fileData.match(/NgElementConstructor/)) {
            this.analysisDetails.angularElement = true;
        }
    }

    checkFileForRouter(filename: string, fileData: string) {
        if (fileData.match(/['"]ui\.router['"]/)) {
            this.analysisDetails.uiRouter = true;
        } else if (fileData.match(/['"]ngRoute['"]/)) {
            this.analysisDetails.angularjsRouter = true;
        } else if (fileData.match(/['"]\@angular\/router['"]/)) {
            this.analysisDetails.angularRouter = true;
        }
    }

    checkFileForUnitTests(filename: string, fileData: string) {
        if (filename.substr(-7, 4) === 'spec' || filename.includes('test')) {
            this.analysisDetails.hasUnitTest = true;
        }
    }

    checkAngularVersion(filename: string, fileData: string) {
        if (filename.substr(-12) === 'package.json' || filename.substr(-10) === 'bower.json') {
            if (fileData.match(/\"\@angular\/core\"\:/) || fileData.match(/\"angular2\"\:/)) {
                this.analysisDetails.usingAngular = true;
            }

            if (fileData.match(/\"angular\"\:/)) {
                this.analysisDetails.usingAngularJS = true;
            }
        } else if (fileData.match(/https\:\/\/ajax\.googleapis\.com\/ajax\/libs\/angularjs/)) {
            this.analysisDetails.usingAngularJS = true;
        }
    }

    checkFileForScriptingLanguage(filename: string, fileData: string) {
        if (filename.substr(-3) === '.js') {
            this.analysisDetails.jsFileCount++;
            this.pushValueOnKey(this.analysisDetails.mapOfFilesToConvert, filename, " JavaScript");
        } else if (this.fileHasTsExtension(filename)) {
            this.analysisDetails.tsFileCount++;
        }
    }

    checkFileForComponent(filename: string, fileData: string) {
        const controllerMatches = fileData.match(/\.controller\(/g);
        const componentMatches = fileData.match(/component\(/g);
        const decoratedComponentMatches = fileData.match(/@Component\(/g);

        if (controllerMatches) {
            this.analysisDetails.controllersCount += controllerMatches.length;
            this.pushValueOnKey(this.analysisDetails.mapOfFilesToConvert, filename, " controller");
        }

        if (componentMatches) {
            this.numDotComponentCount++;
            this.analysisDetails.componentCount += componentMatches.length;
        }

        // AngularJS decorated component matches
        if (decoratedComponentMatches && !fileData.includes('@angular/core')) {
            this.numAtComponentCount++;
            this.analysisDetails.componentCount += decoratedComponentMatches.length;
        }
    }

    pushValueOnKey(map: Map < any, any > , key: string, value: string) {
        if (map.has(key)) {
            let values = map.get(key);
            values.push(value);
            map.set(key, values);
        } else {
            let newValuesArray: string[] = [value];
            map.set(key, newValuesArray);
        }
    }

    /**
     * Creates the anti-pattern report and calculates the rewriteThreshold runRecommendation() uses.
     * Each time an anti-pattern is found, general instructions and files needing corrections
     * are appended to the preparation report. Returns a promise that resolves to the preparation report.
     */
    private runAntiPatternReport(): Promise <any> {
        let preparationReport = new Array();

        if (this.analysisDetails.rootScope) {
            preparationReport.push ("  * App contains $rootScope, please refactor rootScope into services.");
            this.analysisDetails.rewriteThreshold *= this.CODE_LIMIT_MULTIPLIER;
        }
        if (this.analysisDetails.compile) {
            preparationReport.push("  * App contains $compile, please rewrite compile to eliminate dynamic feature of templates.");
            this.analysisDetails.rewriteThreshold *= this.CODE_LIMIT_MULTIPLIER;
        }
        if (!this.analysisDetails.hasUnitTest) {
            preparationReport.push("  * App does not contain unit tests, please include unit tests.");
            this.analysisDetails.rewriteThreshold *= this.CODE_LIMIT_MULTIPLIER;
        }
        if (this.analysisDetails.jsFileCount > 0) {
            preparationReport.push("  * App contains " + this.analysisDetails.jsFileCount + " JavaScript files that need to be converted to TypeScript." +
                "To learn more, visit https://angular.io/guide/upgrade#migrating-to-typescript");
            this.analysisDetails.rewriteThreshold *= this.CODE_LIMIT_MULTIPLIER;
        }
        if (this.analysisDetails.controllersCount > 0) {
            preparationReport.push("  * App contains " + this.analysisDetails.controllersCount +
                " controllers that need to be converted to AngularJS components. To learn more, visit https://docs.angularjs.org/guide/component");
            this.analysisDetails.rewriteThreshold *= this.CODE_LIMIT_MULTIPLIER;
        }

        if (this.analysisDetails.mapOfFilesToConvert.size > 0) {
            preparationReport.push("Files that contain AngularJS patterns and need to be modified:");
            let index = 1;
            for (let key of this.analysisDetails.mapOfFilesToConvert.keys()) {
                preparationReport.push("" + index++ + ".  " + key + " --> Patterns found: " + this.analysisDetails.mapOfFilesToConvert.get(key));
            }
        }
        return Promise.resolve(preparationReport);
    }

    //Returns an array of the app statistics
    public runAppStatistics(): string[] {
        let reportArray: string[] = [];
        reportArray[0] = "App Statistics";

        if (this.analysisDetails.controllersCount > 0 ||
            this.analysisDetails.componentCount > 0 ||
            this.analysisDetails.jsFileCount > 0 ||
            this.analysisDetails.tsFileCount > 0) {

            console.log("Num of .component matches: " + this.numDotComponentCount);

            console.log("Num of @component matches: " + this.numAtComponentCount);

            reportArray[1] = " * Complexity: " + this.analysisDetails.controllersCount + " controllers, " +
                this.analysisDetails.componentCount + " AngularJS components, " +
                +this.analysisDetails.jsFileCount + " JavaScript files, and " +
                this.analysisDetails.tsFileCount + " Typescript files.";
        }
        reportArray[2] = " * App size: " + this.analysisDetails.linesOfCode + " lines of code";
        reportArray[3] = " * File Count: " + this.analysisDetails.totalFilesOrFolderCount + " total files/folders,";
        reportArray[4] = " * AngularJS Patterns: ";

        if (this.analysisDetails.rootScope) {
            reportArray[4] += " $rootScope, "
        }
        if (this.analysisDetails.compile) {
            reportArray[4] += " $compile, "
        }
        if (!this.analysisDetails.hasUnitTest) {
            reportArray[4] += " no unit tests, "
        }
        if (this.analysisDetails.jsFileCount > 0) {
            reportArray[4] += " JavaScript, "
        }
        if (this.analysisDetails.controllersCount > 0) {
            reportArray[4] += " .controller, "
        }

        return reportArray;
    }

    /**
     * Recommendation algorithm that checks type of application (AngularJS, Angular, or
     * hybrid), checks if sloc is under the rewriteThreshold, and checks if passes the
     * ngUpgrade requirements. Returns a recommendation with a preparation report only
     * when needed.
     * Returns an array of the recommendations
     * @param preparationReport preparation instructions for upgrading
     */
    public runRecommendation(): string[] {
        let recommendation: string[] = [];
        recommendation[0] = "Your Recommendation";
        if (this.typeOfApplication() == "angular") {
            recommendation[1] = "This is already an Angular application. You do not need to migrate.";
            return recommendation;
        }

        //Rewriting from scratch
        if (this.analysisDetails.rewriteThreshold >= this.analysisDetails.linesOfCode) {
            if (this.typeOfApplication() == "hybrid") {
                recommendation[1] = "Even though you have already begun making a hybrid application with" +
                    " both AngularJS and Angular, the simplest solution is to rewrite your application from scratch.";;
            } else {
                recommendation[1] = "The simplest solution is to rewrite your application from scratch.";
            }

            if (!this.analysisDetails.hasUnitTest) {
                recommendation[2] = "Please include unit tests in your new Angular application.";
            }
        } else {
            if (this.passesNgUpgradeRequirements()) {
                recommendation[1] = "You have passed the necessary requirements and can use ngUpgrade as your migration path.";
                if (this.analysisDetails.angularElement == true) {
                    recommendation[2] = "Continue using Angular Elements for components.";
                } else if (this.analysisDetails.uiRouter == true) {
                    recommendation[2] = "Use the hybrid ui-router in addition.";
                } else if (this.analysisDetails.angularjsRouter) {
                    recommendation[2] = "Use the hyrbid AngularJS and Angular router in addition.";
                }
            } else {
                if (this.typeOfApplication() == "hybrid") {
                    recommendation[1] = "Even though you have already begun making a hybrid application with" +
                        " both AngularJS and Angular, your app does not pass the necessary requirements to use ngUpgrade."; +
                        "Please follow these preparation steps in the files identified before migrating with ngUpgrade.";
                } else {
                    recommendation[1] = "Please follow these preparation steps in the files identified before migrating with ngUpgrade.";
                }
                //recommendation[2] = preparationReport;
            }
        }
        return recommendation;
    }

    typeOfApplication(): string {
        if (this.analysisDetails.usingAngular && this.analysisDetails.usingAngularJS) {
            return "hybrid";
        } else if (this.analysisDetails.usingAngular && !this.analysisDetails.usingAngularJS) {
            return "angular"
        }
        return "angularjs";
    }

    passesNgUpgradeRequirements(): boolean {
        if (this.analysisDetails.rootScope == false &&
            this.analysisDetails.compile == false &&
            this.analysisDetails.hasUnitTest == true &&
            this.analysisDetails.jsFileCount == 0 &&
            this.analysisDetails.controllersCount == 0) {
            return true;
        }
        return false;
    }

}