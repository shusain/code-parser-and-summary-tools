# TypeScript UML Diagram Generator

This repo contains a few scripts to parse and summarize TS code (primarily to then use as prompt input for LLMs):

|command | desscription|
|--------|-------------|
| `npm start -- /path/to/an/angular/app`
|<pre>DIRECTORY=~/Development/asteroids-p5-ts/ \\<br/>npm run ts-to-txt</pre>| generates a UML class diagram in DOT format from a directory of TypeScript files.
|<pre>DIRECTORY=~/Development/asteroids-p5-ts/ \\<br/>npm run generate-uml</pre>| generates a UML class diagram in DOT format from a directory of TypeScript files.

## Prerequisites

- Node.js v14 or later
- Graphviz (https://graphviz.org/)

## Installation

1. Clone this repository or download the source code.
2. Install the dependencies by running `npm install` in the project directory.

## Usage details

To generate a UML diagram, run the following command in the project directory:

```bash
DIRECTORY=~/Development/video-text-prompt npm run generate-uml
```

Replace `DIRECTORY=path` with the path to the directory containing your TypeScript files.

The command will generate an output.png file in the project directory.

## Examples

See the [examples](./examples/) for some sample output of each script

## Limitations

- The app assumes that each TypeScript file contains exactly one class.
- The app does not handle circular references between classes.

## License

This project is licensed under the MIT License. See LICENSE file for details.
