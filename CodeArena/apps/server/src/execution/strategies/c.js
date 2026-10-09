const cStrategy = {
    name: "c",
    image: "gcc:14",

    sourceFile: "/tmp/codearena/main.c",

    compile: [
        "gcc",
        "/tmp/codearena/main.c",
        "-O2",
        "-std=c17",
        "-o",
        "/tmp/program"
    ],

    run: [
        "/tmp/program"
    ]
};

export default cStrategy;