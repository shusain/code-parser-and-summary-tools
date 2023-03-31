# Java Code Analyzer

Java Code Analyzer is a command-line application that generates a Markdown summary of Java classes, methods, and properties in a GitHub repository.

## Features

- Analyze Java files in a given GitHub repository.
- Generate a Markdown summary of classes, methods, properties, and enum values.
- Summarize class and method signatures, including return types and parameter types.
- Output the summary to a specified file.

## Prerequisites

- JDK 17
- Gradle

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/JavaCodeAnalyzer.git
cd JavaCodeAnalyzer
```

2. Create a .env file in the project's root directory and add your GitHub personal access token:

```ini
# Save this in a file app/java/src/main/resources/.env
GITHUB_TOKEN=your_github_token
```
Replace your_github_token with your personal access token from GitHub.

### Usage
Build the project:

```bash
./gradlew build
```

Run the application with Gradle, passing the GitHub repository URL and the output file path as arguments:

```bash
./gradlew run --args='user/repository output.md'
```

Alternative if you'd like can supply the GH token as a third arg and will use that instead of the .env file

```bash
./gradlew run --args='shusain/DungeonGame dungeon-game.md YOUR_TOKEN_GOES_HERE'
```

This command will generate a Markdown summary of the Java code in the specified repository and write it to the output.md file.

### Example Output

[See full example output](./app/dungeon-game.md)

---
package DungeonGame

import
  - lombok.Data;
  - lombok.NoArgsConstructor;

@Data  
@NoArgsConstructor  
+ class Enemy
  - int maxEnemyHealth
  - int enemyAttackDamage
  - int health
  - EnemyEnum type
  + void setHealth(int health)
  + void die()
