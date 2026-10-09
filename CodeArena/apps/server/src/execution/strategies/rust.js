const rustStrategy = {
    name: "rust",
    image: "rust:1.90-alpine",

    sourceFile: "/tmp/codearena/main.rs",

    compile: [
        "rustc",
        "/tmp/codearena/main.rs",
        "-O",
        "-o",
        "/tmp/program"
    ],

    run: [
        "/tmp/program"
    ]
};

export default rustStrategy;