const javascriptStrategy = {
    name: "javascript",

    image: "node:22-alpine",

    sourceFile: "/tmp/codearena/main.js",

    compile: null,

    run: [
        "node",
        "/tmp/codearena/main.js",
    ],

};

export default javascriptStrategy;
