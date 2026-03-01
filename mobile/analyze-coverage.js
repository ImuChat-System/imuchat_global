const data = require("./coverage/coverage-final.json");
const files = Object.entries(data)
  .map(([path, info]) => {
    const stmts = Object.values(info.s);
    return {
      path: path.replace(/.*\/mobile\//, ""),
      total: stmts.length,
      uncov: stmts.filter((c) => c === 0).length,
    };
  })
  .filter(
    (f) => !/e2e|__test|__mock|\.test\.|\.spec\./.test(f.path) && f.uncov > 0,
  )
  .sort((a, b) => b.uncov - a.uncov);

let totalUncov = 0;
files.forEach((f) => {
  totalUncov += f.uncov;
});
console.log("Total uncovered (excl e2e):", totalUncov);
console.log("---");

const byFolder = {};
files.forEach((f) => {
  const folder = f.path.split("/")[0];
  if (!byFolder[folder]) byFolder[folder] = { total: 0, uncov: 0 };
  byFolder[folder].total += f.total;
  byFolder[folder].uncov += f.uncov;
});
Object.entries(byFolder)
  .sort((a, b) => b[1].uncov - a[1].uncov)
  .forEach(([folder, v]) =>
    console.log(
      v.uncov.toString().padStart(5) +
        "/" +
        v.total.toString().padStart(5) +
        " " +
        folder,
    ),
  );

console.log("\n--- Top 20 files ---");
files
  .slice(0, 20)
  .forEach((f) =>
    console.log(
      f.uncov.toString().padStart(4) +
        "/" +
        f.total.toString().padStart(4) +
        " " +
        f.path,
    ),
  );
