import javascriptStrategy from "./strategies/javascript.js";
import pythonStrategy from "./strategies/python.js";
import cppStrategy from "./strategies/cpp.js";
import cStrategy from "./strategies/c.js";
import javaStrategy from "./strategies/java.js";
import goStrategy from "./strategies/go.js";
import rustStrategy from "./strategies/rust.js";

const languages = {
    javascript: javascriptStrategy,
    python: pythonStrategy,
    cpp: cppStrategy,
    c: cStrategy,
    java: javaStrategy,
    go: goStrategy,
    rust: rustStrategy
};

export default languages;