import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/transformer.ts",
  output: {
    dir: "./dist",
    format: "esm",
  },
  external: [
    "path",
    "fs-extra",
    "rollup",
    "sharp",
    "md5",
    "query-string",
    "color",
  ],
  plugins: [typescript({ module: "ESNext" })],
};
