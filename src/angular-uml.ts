
import { ParsedPath, parse } from 'path';
import { Node, Project, ClassDeclaration, SyntaxKind, PropertyDeclaration, MethodDeclaration } from 'ts-morph';
import { promises as fs, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { exec } from 'child_process';
const open = (await import('open')).default;

const project = new Project();
const args = process.argv.slice(2);
const angularAppPath = args[0];

if (!angularAppPath) {
  console.error('Please provide the path to the Angular application as an input argument.');
  process.exit(1);
}

const parsedPath: ParsedPath = parse(angularAppPath);
const dotfilePath = `${parsedPath.dir}/${parsedPath.name}.dot`;

const sourceFiles = globSync(`${angularAppPath}/**/*.ts`)
  .filter((path) => !path.includes('node_modules') && !path.includes('test.ts'));

project.addSourceFilesAtPaths(sourceFiles);

const components = project.getSourceFiles().flatMap((file) =>
  file.getClasses().filter((cls) => cls.getDecorator('Component'))
);

const modules = project.getSourceFiles().flatMap((file) =>
  file.getClasses().filter((cls) => cls.getDecorator('NgModule'))
);

const getComponentName = (component: Node) => component.getSymbol()?.getName() || '';

const sanitizeLabel = (str: string) => {
  return str
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/</g, '\\<')
    .replace(/>/g, '\\>');
};
const generateMemberLabel = (member: PropertyDeclaration | MethodDeclaration) => {
  const accessModifier = member.getFirstModifierByKind(SyntaxKind.PrivateKeyword)
    ? '-'
    : member.getFirstModifierByKind(SyntaxKind.ProtectedKeyword)
      ? '#'
      : '+';
  const name = member.getName();
  const type = sanitizeLabel(member.getType().getText());
  const typeName = type.split('.').pop()!; // get the type name after the last dot

  return `${accessModifier}${name}: ${typeName}`;
};


const extractImports = (members: (PropertyDeclaration | MethodDeclaration)[]) => {
  const importSet = new Set<string>();
  members.forEach((member) => {
    const typeText = member.getType().getText();
    const importMatches = typeText.match(/import\("[^"]+"\)/g) || [];
    importMatches.forEach((importMatch) => importSet.add(sanitizeLabel(importMatch)));
  });
  return Array.from(importSet);
};

const generateComponentLabel = (component: ClassDeclaration) => {
  const componentName = getComponentName(component);

  const properties = component
    .getProperties()
    .filter(
      (property) => !property.getDecorator('Input') && !property.getDecorator('Output')
    );

  const methods = component.getMethods();

  const allMembers = [...properties, ...methods];
  const imports = extractImports(allMembers);
  const propertiesLabel = properties.map(generateMemberLabel).join('\\l') + '\\l';
  const methodsLabel = methods.map(generateMemberLabel).join('\\l') + '\\l';
  const importsLabel = imports.join('\\l') + '\\l';

  return `${componentName}${importsLabel ? `\\n${importsLabel}` : ''}${propertiesLabel ? `\\n|${propertiesLabel}` : ''
    }${methodsLabel ? `\\n|${methodsLabel}` : ''}`;
};

const dotfileLines: string[] = [
  'digraph G {',
  '    node [shape=record fontname=Arial];',
  ...components.map((component) => `${getComponentName(component)} [label="{${generateComponentLabel(component)}}"];`),
  ...modules.flatMap((module) => {
    const decorator = module.getDecorator('NgModule');
    if (!decorator) return [];

    const moduleMetadata = decorator.getArguments()[0];
    if (!Node.isObjectLiteralExpression(moduleMetadata)) return [];

    const declarationsProperty = moduleMetadata.getProperty('declarations');
    if (!declarationsProperty || !Node.isPropertyAssignment(declarationsProperty)) return [];

    const declarations = declarationsProperty.getInitializer();
    if (!Node.isArrayLiteralExpression(declarations)) return [];

    const componentNames = declarations.getElements().map(getComponentName);
    const moduleName = getComponentName(module);

    return componentNames.map((componentName) => `${moduleName} -> ${componentName};`);
  }),
  '}'
];



const runGraphvizAndOpenImage = (
  dotfilePath: string,
  outputDirectory: string,
  outputFormats: string[] = ['png', 'pdf', 'svg']
) => {
  outputFormats.forEach((format) => {
    const outputFilePath = `${outputDirectory}/output.${format}`;
    const command = `dot -T${format} -o "${outputFilePath}" "${dotfilePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while running Graphviz: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Graphviz error: ${stderr}`);
        return;
      }
      console.log(`Generated ${format} file: ${outputFilePath}`);
      if (format === 'png') {
        open(outputFilePath).catch((err) => {
          console.error(`Error while opening the image: ${err.message}`);
        });
      }
    });
  });
};

writeFileSync(dotfilePath, dotfileLines.join('\n'), 'utf-8');
console.log(`UML diagram dotfile generated: ${dotfilePath}`);
runGraphvizAndOpenImage(dotfilePath, angularAppPath);
