import ts from "typescript";
import fs from "fs";
import path from "path";
import Ignore, { Ignore as IgnoreType } from "ignore";

const createIgnore = Ignore.default;

/**
 * Checks whether a file or folder should be ignored based on the ignore rules.
 *
 * @param ignoreRules - The ignore rules object.
 * @param fullPath - The full path of the file or folder.
 * @returns True if the file or folder should be ignored, false otherwise.
 */
function shouldIgnore(ignoreRules: IgnoreType, fullPath: string, basePath: string): boolean {
  const relativePath = path.relative(basePath, fullPath);

  if (relativePath.indexOf(".git") != -1) {
    return true;
  }

  return ignoreRules.ignores(relativePath);
}

/**
 * Parses a TypeScript file and returns a string representation of the class declarations.
 *
 * @param filePath - The path of the TypeScript file to parse.
 * @returns A string representation of the class declarations in the file.
 */
function parseFile(filePath: string): string {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf-8"),
    ts.ScriptTarget.Latest,
    true
  );

  let output = "";
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      output += parseClassDeclaration(node);
    }
  });

  return output;
}

/**
 * Parses a class declaration node and returns a string representation of its properties and methods.
 *
 * @param node - The class declaration node to parse.
 * @returns A string representation of the class declaration's properties and methods.
 */
function parseClassDeclaration(node: ts.ClassDeclaration): string {
  let className = node.name!.text;
  let output = `Class: ${className}\n`;

  ts.forEachChild(node, (member) => {
    if (ts.isPropertyDeclaration(member) && member.name) {
      output += parsePropertyDeclaration(member);
    } else if (ts.isMethodDeclaration(member) && member.name) {
      output += parseMethodDeclaration(member);
    }
  });

  output += "\n";
  return output;
}

/**
 * Parses a property declaration node and returns a string representation of the property.
 *
 * @param node - The property declaration node to parse.
 * @returns A string representation of the property.
 */
function parsePropertyDeclaration(node: ts.PropertyDeclaration): string {
  let propertyName = node.name.getText();
  // let propertyKind = node.type ? ts.SyntaxKind[node.type.kind] : "any";
  let propertyType = node.type ? node.type.getText() : "any";

  return `  Property: ${propertyName} : ${propertyType}\n`;
}

/**
 * Parses a method declaration node and returns a string representation of the method.
 *
 * @param node - The method declaration node to parse.
 * @returns A string representation of the method.
 */

function parseMethodDeclaration(node: ts.MethodDeclaration): string {
  let methodName = node.name.getText();
  let parameterList = node.parameters
    .map((param) => {
      let paramName = param.name.getText();
      let paramType = param.type ? param.type.getText() : "any";
      return `${paramName} : ${paramType}`;
    })
    .join(", ");
  let returnType = node.type ? node.type.getText() : "any";
  return `  Method: ${methodName}(${parameterList}) : ${returnType}\n`;
}


/**
 * Recursively processes a folder and parses all TypeScript files within it.
 *
 * @param folderPath - The path of the folder to process.
 * @param outputFilePath - The path of the output file to write the parsed output to.
 * @param ignoreRules - The ignore rules object.
 */
function processFolder(folderPath: string, outputFilePath: string, ignoreRules: IgnoreType): void {
  // Get the list of files and folders in the folder
  const files = fs.readdirSync(folderPath);

  // Loop through each file/folder in the folder
  for (const file of files) {
    // Get the full path of the file/folder
    const fullPath = path.join(folderPath, file);

    // If the file/folder should be ignored, skip it
    if (shouldIgnore(ignoreRules, fullPath, folderPath)) {
      continue;
    }

    // Get the stats for the file/folder
    const stat = fs.statSync(fullPath);

    // If the file/folder is a directory, recursively process it
    if (stat.isDirectory()) {
      processFolder(fullPath, outputFilePath, ignoreRules);
    // If the file is a TypeScript file, parse it and append the output to the output file
    } else if (path.extname(fullPath) === ".ts") {
      const output = parseFile(fullPath);
      fs.appendFileSync(outputFilePath, output, "utf-8");
    }
  }
}

// Get the command line arguments
const args = process.argv.slice(2);

// If there are not enough arguments, print usage instructions and exit
if (args.length < 1) {
  console.error("Usage: ts-node typescript_parser.ts <input folder> <output file>");
  process.exit(1);
}

// Get the input folder, output file, and .gitignore file path
const inputFolder = args[0];
const outputFile = args[1] || process.cwd() + "/dist/output.txt";
const gitignorePath = path.join(inputFolder, ".gitignore");

// Create an ignore rules object
const ignoreRules = createIgnore();

// If the .gitignore file exists, add its contents to the ignore rules
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
  ignoreRules.add(gitignoreContent.split(/\r?\n/));
}

// Clear the output file before appending to it
fs.writeFileSync(outputFile, "", "utf-8");

// Process the input folder and write the output to the output file
processFolder(inputFolder, outputFile, ignoreRules);

// Print a success message
console.log(`Output written to ${outputFile}`);
