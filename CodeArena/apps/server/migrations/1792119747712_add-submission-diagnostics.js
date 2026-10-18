export const up = (pgm) => {
  pgm.addColumn("submissions", {
    error_output: {
      type: "text",
    },
    exit_code: {
      type: "integer",
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn("submissions", ["error_output", "exit_code"]);
};