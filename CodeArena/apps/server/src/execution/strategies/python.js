const pythonStrategy = {
    name: "python",

    image: "python:3.13-alpine",

    sourceFile: "/tmp/codearena/main.py",

    compile: null,

    run: [
        "python",
        "/tmp/codearena/main.py",
    ],

};

export default pythonStrategy;
