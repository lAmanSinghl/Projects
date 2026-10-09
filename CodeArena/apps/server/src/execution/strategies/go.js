const goStrategy = {
    name: "go",
    image: "golang:1.25-alpine",

    sourceFile: "/tmp/codearena/main.go",

    compile: [
        "go",
        "build",
        "-o",
        "/tmp/program",
        "/tmp/codearena/main.go"
    ],

    run: [
        "/tmp/program"
    ]
};

export default goStrategy;