const cppStrategy = {
    name: "cpp",
    image: "codearena-cpp:14",

    sourceFile: "/tmp/codearena/main.cpp",

compile: [
    "g++",
    "/tmp/codearena/main.cpp",
    "-O2",
    "-std=c++17",
    "-o",
    "/tmp/program"
],

run: [
    "/tmp/program"
]
};

export default cppStrategy;