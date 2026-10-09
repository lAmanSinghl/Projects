const javaStrategy = {
    name: "java",
    image: "eclipse-temurin:21",

    sourceFile: "/tmp/codearena/Main.java",

    compile: [
        "javac",
        "-d",
        "/tmp",
        "/tmp/codearena/Main.java"
    ],

    run: [
        "java",
        "-cp",
        "/tmp",
        "Main"
    ]
};

export default javaStrategy;