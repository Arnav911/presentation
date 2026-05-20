import Babel from "@babel/standalone";
import fs from "fs";
const code = fs.readFileSync("/tmp/template.tsx", "utf-8");
try {
  Babel.transform(code, {
    presets: [
      ["react", { runtime: "classic" }],
      ["typescript", { isTSX: true, allExtensions: true }],
    ],
    sourceType: "script",
  });
  console.log("Success");
} catch(e) {
  console.error(e.message);
}
