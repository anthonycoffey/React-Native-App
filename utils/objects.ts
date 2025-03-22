export function logNestedObjects(variable: any, depth = 0) {
  const indent = "  ".repeat(depth); // Adjust the indentation level

  if (typeof variable === "object" && variable !== null) {
    console.log(indent + "{");
    for (const key in variable) {
      console.log(indent + `  ${key}:`);
      logNestedObjects(variable[key], depth + 2); // Recursively log nested objects
    }
    console.log(indent + "}");
  } else {
    console.log(indent + variable);
  }
}

export function prettyPrint(variable: any) {
  console.log(JSON.stringify(variable, null, 2));
  return JSON.stringify(variable, null, 2);
}