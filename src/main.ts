const args = process.argv.slice(2);
const example = args[0];

const examplesMap: Record<string, () => Promise<any>> = {
  "1": () => import("./example-1"),
};

if (example in examplesMap) {
  examplesMap[example]()
    .then((module) => {
      // Access the default export or specific exports
      if (module.default) {
        module.default();
      } else {
        console.log("Module loaded:", module);
      }
    })
    .catch((err: Error) => {
      console.error("Error loading module:", err);
    });
} else {
  console.log("Invalid example number. Please provide a valid number (1, 2).");
}
