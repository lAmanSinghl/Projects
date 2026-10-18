const javaStrategy = {
    name: "java",

    image: "codearena-java:21",

    sourceFile: "/tmp/codearena/Main.java",

    compile: [
        "javac",
        "-cp",
        "/opt/codearena/lib/*",
        "-d",
        "/tmp",
        "/tmp/codearena/Main.java",
    ],

    run: [
        "java",
        "-cp",
        "/tmp:/opt/codearena/lib/*",
        "Main",
    ],

};

export default javaStrategy;
