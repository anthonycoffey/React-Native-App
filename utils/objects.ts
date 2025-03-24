export function prettyPrint(variable: any) {
  console.log(JSON.stringify(variable, null, 2));
  return JSON.stringify(variable, null, 2);
}