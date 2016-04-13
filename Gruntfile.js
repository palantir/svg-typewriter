module.exports = function(grunt) {
  "use strict";

  var path = require("path");
  var cwd = process.cwd();

  var tsConfig = {
    dev: {
      src: ["src/**/*.ts", "typings/**/*.d.ts"],
      outDir: "build/src/",
      options: {
        target: "es5",
        sourceMap: false,
        noImplicitAny: true,
        declaration: true,
        removeComments: false
      }
    },
    test: {
      src: ["test/*.ts", "typings/**/*.d.ts", "build/svgtypewriter.d.ts"],
      outDir: "build/test/",
      options: {
        target: "es5",
        sourceMap: false,
        noImplicitAny: true,
        declaration: false,
        removeComments: false
      }
    },
    verify_d_ts: {
      src: ["typings/d3/d3.d.ts", "svgtypewriter.d.ts"]
    }
  };

  // poor man"s deep copy
  var deepCopy = function(x) {
    return JSON.parse(JSON.stringify(x));
  };

  tsConfig.dev_release = deepCopy(tsConfig.dev);
  delete tsConfig.dev_release.options.compiler;

  var tsFiles;
  var updateTsFiles = function() {
    tsFiles = grunt.file.read("src/reference.ts")
                  .split("\n")
                  .filter(function(s) {
                    return s !== "";
                  })
                  .map(function(s) {
                    return s.match(/"(.*\.ts)"/)[1];
                  });
  };
  updateTsFiles();

  var testTsFiles;
  var updateTestTsFiles = function() {
    testTsFiles = grunt.file.read("test/testReference.ts")
      .split("\n")
      .filter(function(s) { return s !== ""; })
      .map(function(s) { return s.match(/"(.*\.ts)"/)[1]; });
  };
  updateTestTsFiles();

  var bumpJSON = {
    options: {
      files: ["package.json", "bower.json"],
      updateConfigs: ["pkg"],
      commit: false,
      createTag: false,
      push: false
    }
  };

  var prefixMatch = "\\n *(function |var |static )?";
  var varNameMatch = "[^(:;]*(\\([^)]*\\))?"; // catch function args too
  var nestedBraceMatch = ": \\{[^{}]*\\}";
  var typeNameMatch = ": [^;]*";
  var finalMatch = "((" + nestedBraceMatch + ")|(" + typeNameMatch + "))?\\n?;";
  var jsdoc_init = "\\n *\\/\\*\\* *\\n";
  var jsdoc_mid = "( *\\*[^\\n]*\\n)+";
  var jsdoc_end = " *\\*\\/ *";
  var jsdoc = "(" + jsdoc_init + jsdoc_mid + jsdoc_end + ")?";

  var configJSON = {
    pkg: grunt.file.readJSON("package.json"),
    bump: bumpJSON,
    concat: {
      header: {
        src: ["license_header.txt", "svgtypewriter.js"],
        dest: "svgtypewriter.js",
      },
      svgtypewriter: {
        src: tsFiles.map(function(s) {
          return "build/src/" + s.replace(".ts", ".js");
        }),
        dest: "svgtypewriter.js",
      },
      tests: {
        src: testTsFiles.map(function(s) {
          return "build/test/" + s.replace(".ts", ".js");
        }),
        dest: "test/tests.js",
      },
      definitions: {
        options: {
            footer: '\ndeclare module "svg-typewriter" { export = SVGTypewriter; }\n',
        },
        src: tsFiles.map(function(s) {
          return "build/src/" + s.replace(".ts", ".d.ts");
        }),
        dest: "build/svgtypewriter.d.ts",
      },
    },
    sed: {
      version_number: {
        pattern: "@VERSION",
        replacement: "<%= pkg.version %>",
        path: "svgtypewriter.js"
      },
      definitions: {
        pattern: '/// *<reference path=[\""].*[\""] */>',
        replacement: "",
        path: "build/svgtypewriter.d.ts",
      },
      private_definitions: {
        pattern: jsdoc + prefixMatch + "private " + varNameMatch + finalMatch,
        replacement: "",
        path: "build/svgtypewriter.d.ts",
      }
    },
    typedoc: {
      build: {
        options: {
          module: "commonjs",
          target: "es5",
          out: "docs/",
          name: "SVGTypewriter.js"
        },
        src: "src/**/*"
      }
    },
    ts: tsConfig,
    tslint: {
      options: {
        configuration: grunt.file.readJSON("tslint.json")
      },
      all: {
        src: ["src/**/*.ts", "test/**/*.ts"]
      }
    },
    umd: {
        all: {
            options: {
                src: "svgtypewriter.js",
                objectToExport: "SVGTypewriter",
                deps: {
                    default: ["d3"],
                }
            }
        }
    },
    watch: {
      options: {
        livereload: 35731
      },
      rebuild: {
        tasks: ["dev-compile"],
        files: ["src/**/*.ts"]
      },
      tests: {
        tasks: ["test-compile"],
        files: ["test/**/*.ts"]
      }
    },
    blanket_mocha: {
      all: ["test/coverage.html"],
      options: {
        threshold: 95
      }
    },
    connect: {
      server: {
        options: {
          port: 9999,
          hostname: "*",
          base: "",
          livereload: 35731
        }
      }
    },
    jshint: {
      files: ["Gruntfile.js"],
      options: {
        "curly": true,
        "eqeqeq": true,
        "evil": true,
        "indent": 2,
        "latedef": true,
        "globals": {
          "jQuery": true,
          "d3": true,
          "window": true,
          "console": true,
          "$": true,
          "makeRandomData": true,
          "setTimeout": true,
          "document": true,
        },
        "strict": true,
        "eqnull": true
      }
    },
    parallelize: {
      tslint: {
        all: 4
      }
    },
    clean: {
      tscommand: ["tscommand*.tmp.txt"]
    },
    uglify: {
      main: {
        files: {"svgtypewriter.min.js": ["svgtypewriter.js"]}
      }
    },
    "saucelabs-mocha": {
      all: {
        options: {
          urls: ["http://127.0.0.1:9999/test/tests.html"],
          testname: "SVGTypewriter Sauce Unit Tests",
          browsers: [{
            browserName: "firefox",
            platform: "linux"
          }, {
            browserName: "chrome",
            platform: "linux"
          }, {
            browserName: "internet explorer",
            version: "9",
            platform: "WIN7"
          }, {
            browserName: "safari",
            platform: "OS X 10.10",
            version: "8"
          }],
          build: process.env.TRAVIS_JOB_ID,
          "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
        }
      }
    }
  };

  var compile_task = [
    "update_ts_files",
    "update_test_ts_files",
    "ts:dev",
    "tslint",
    "concat:svgtypewriter",
    "concat:definitions",
    "sed:definitions",
    "sed:private_definitions",
    "umd",
    "concat:header",
    "sed:version_number",
    "definitions_prod",
    "test-compile",
    "clean:tscommand"
  ];


  grunt.initConfig(configJSON);
  require("load-grunt-tasks")(grunt);

  grunt.registerTask("default", "launch");
  grunt.registerTask("update_ts_files", updateTsFiles);
  grunt.registerTask("update_test_ts_files", updateTestTsFiles);
  grunt.registerTask("definitions_prod", function() {
    grunt.file.copy("build/svgtypewriter.d.ts", "svgtypewriter.d.ts");
  });

  grunt.registerTask("dev-compile", compile_task);
  grunt.registerTask("docs", "typedoc:build");
  grunt.registerTask("test-sauce", ["connect", "saucelabs-mocha"]);
  grunt.registerTask("test", [
    "dev-compile",
    "blanket_mocha",
    "parallelize:tslint",
    "jshint",
    "ts:verify_d_ts"
  ]);

  grunt.registerTask("test-compile", [
    "ts:test",
    "concat:tests"
  ]);

  var travisTests = ["test"];
  if (process.env.SAUCE_USERNAME) {
    travisTests.push("test-sauce");
  }
  grunt.registerTask("test-travis", travisTests);

  grunt.registerTask("dist-compile", [
    "release-compile",
    "uglify",
  ]);

  grunt.registerTask("default", "launch");
  grunt.registerTask("launch", ["connect", "dev-compile", "watch"]);
};
