export function logNestedObjects(variable: any, depth = 0) {
    const indent = '  '.repeat(depth); // Adjust the indentation level

    if (typeof variable === 'object' && variable !== null) {
        console.log(indent + '{');
        for (const key in variable) {
            console.log(indent + `  ${key}:`);
            logNestedObjects(variable[key], depth + 2); // Recursively log nested objects
        }
        console.log(indent + '}');
    } else {
        console.log(indent + variable);
    }
}