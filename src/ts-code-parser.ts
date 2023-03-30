import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as graphviz from 'graphviz';

const ignoreList = ['.git', 'node_modules']; // files/folders to ignore

const getClasses = (fileContent: string) => {
    const classRegex = /export\s+class\s+(\w+)/g;
    const classes: string[] = [];

    let match;
    while ((match = classRegex.exec(fileContent))) {
        classes.push(match[1]);
    }

    return classes;
};

const getPropertiesAndMethods = (classContent: string) => {
    const propertyRegex = /(\w+)\s*:\s*(\w+);/;
    const methodRegex = /(\w+)\s*\((.*)\)\s*:\s*(\w+)/;

    const properties: string[] = [];
    const methods: string[] = [];

    const lines = classContent.split('\n');
    for (const line of lines) {
        const propertyMatch = line.match(propertyRegex);
        if (propertyMatch) {
            properties.push(`${propertyMatch[1]}: ${propertyMatch[2]}`);
            continue;
        }

        const methodMatch = line.match(methodRegex);
        if (methodMatch) {
            const methodName = methodMatch[1];
            const parameters = methodMatch[2].split(',').map((p) => p.trim());
            const returnType = methodMatch[3];
            const methodString = `${methodName}(${parameters.join(', ')}): ${returnType}`;
            methods.push(methodString);
        }
    }

    return { properties, methods };
};

interface FileData {
  classes: string[];
  references: string[];
}
const processFiles = (filePaths: string[]) => {
    const fileData: { [key: string]: FileData } = {};

    // Pass 1: Extract class names and references from files
    for (const filePath of filePaths) {
        const source = fs.readFileSync(filePath, 'utf-8');

        // Extract class names
        const classNames = source.match(/export\s+class\s+([^\s{]+)/g) ?? [];

        // Extract references to other classes
        const classReferences = source.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g) ?? [];

        // Extract imported classes
        const importedClasses = (source.match(/import\s*{[^}]*}\s*from\s*['"]([^'"]*)['"]/g) ?? [])
            .flatMap((importStatement) => {
                return importStatement
                    .replace(/import\s*{/, '')
                    .replace(/}\s*from\s*['"][^'"]*['"]/, '')
                    .split(',')
                    .map((className) => className.trim());
            });

        // Add file data to fileData object
        fileData[filePath] = {
            classes: classNames.map((name) => name.replace(/export\s+class\s+/, '')),
            references: [...classReferences.map((ref) => ref.split('.')[0]), ...importedClasses],
        };
    }

    // Pass 2: Build graph and add edges based on references
    const graph = graphviz.digraph('G');

    // Add nodes to graph
    for (const [, fileDatum] of Object.entries(fileData)) {
        for (const className of fileDatum.classes) {
            graph.addNode(className);
        }
    }

    // Add edges based on references
    for (const [, importingFileData] of Object.entries(fileData)) {
        for (const className of importingFileData.classes) {
            const referencingFileData = Object.values(fileData).find((data) =>
                data.references.includes(className)
            );
            if (referencingFileData) {
                const referencingFilePath = Object.keys(fileData).find(
                    (key) => fileData[key] === referencingFileData
                );
                if (referencingFilePath) {
                    const referencingFileName = path.basename(referencingFilePath, '.ts');
                    graph.addEdge(referencingFileName, className);
                }
            }
        }
    }

    return graph.to_dot();
};


const generateUML = (srcPath: string, outputFilePath: string) => {
    const graph = graphviz.digraph('G');
    graph.set('rankdir', 'TB');

    const filePattern = path.join(srcPath, '**/*.ts');
    const files = glob.sync(filePattern, {
        ignore: ignoreList.map((item) => path.join(srcPath, item)),
    });

    const dotString = processFiles(files);
    fs.writeFileSync(outputFilePath, dotString);
};


const srcPath = process.argv[2];
const outputFilePath = './output.dot';

if (!srcPath) {
    console.error('Source directory path is missing. Usage: node uml-generator.js <src-path>');
    process.exit(1);
}

generateUML(srcPath, outputFilePath);

