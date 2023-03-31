package sh.code.analyzer;

import org.kohsuke.github.*;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.NodeList;
import com.github.javaparser.ast.body.*;
import com.github.javaparser.ast.expr.AnnotationExpr;
import com.github.javaparser.JavaParser;
import com.github.javaparser.StaticJavaParser;

import io.github.cdimascio.dotenv.Dotenv;

public class App {
    public static void main(String[] args) throws IOException {
        if (args.length < 2) {
            System.out.println("Usage: java-code-analyzer <GitHub repository URL> <output file>");
            System.exit(1);
        }

        String gitHubToken;
        if(args.length == 3) {
            gitHubToken = args[2];
        } else {
            Dotenv dotenv = Dotenv.configure()
            .directory("src/main/resources")
            .load();

            // Retrieve the GitHub token from the .env file
            gitHubToken = dotenv.get("GITHUB_TOKEN");
        }
        
        if (gitHubToken == null || gitHubToken.isBlank()) {
            System.err.println("Error: GITHUB_TOKEN not found in the .env file or supplied as third argument.");
            System.exit(1);
        }
        // Authenticate with the provided GitHub token
        GitHub github = new GitHubBuilder().withOAuthToken(gitHubToken).build();
        GHRepository repository = github.getRepository(args[0]);

        // List all .java files recursively
        List<GHContent> javaFiles = new ArrayList<>();
        listJavaFiles(repository, "/", javaFiles);

        // Analyze and generate the summary for each .java file
        List<String> summaries = new ArrayList<>();
        for (GHContent javaFile : javaFiles) {
            String javaCode = new String(javaFile.read().readAllBytes());
            String summary = analyzeJavaCode(javaCode);
            summaries.add(summary);
        }

        String repoName = "# " + repository.getFullName() + "\n\n";
        String repoDesc = "## " + repository.getDescription() + "\n\n";
        // Generate the final markdown summary
        String markdown = repoName + repoDesc + String.join("\n\n---\n\n", summaries);
        
        // Write the summary to the output file
        try (FileWriter fileWriter = new FileWriter(args[1])) {
            fileWriter.write(markdown);
        } catch (IOException e) {
            System.err.println("Error writing to the output file: " + e.getMessage());
        }
        
        System.out.println(markdown);
    }

    private static void listJavaFiles(GHRepository repository, String path, List<GHContent> javaFiles) throws IOException {
        List<GHContent> contents = repository.getDirectoryContent(path);
        for (GHContent content : contents) {
            if (content.isFile() && content.getName().endsWith(".java")) {
                javaFiles.add(content);
            } else if (content.isDirectory()) {
                listJavaFiles(repository, content.getPath(), javaFiles);
            }
        }
    }
    protected static String analyzeJavaCode(String javaCode) {
        CompilationUnit cu = StaticJavaParser.parse(javaCode);
        StringBuilder markdown = new StringBuilder();
    
        for (TypeDeclaration<?> type : cu.getTypes()) {
            
            markdown.append(type.toString().split("\\{")[0].trim()).append("  \n");
            
            if (type.isEnumDeclaration()) {
                // Add enum values if the type is an enum
                NodeList<EnumConstantDeclaration> enumConstants = type.asEnumDeclaration().getEntries();
                markdown.append("  Enum values:\n");
                for (EnumConstantDeclaration enumConstant : enumConstants) {
                    markdown.append("  - ").append(enumConstant.getNameAsString()).append("\n");
                }
            }
    
            // Add annotations for classes
            // for (AnnotationExpr annotation : type.getAnnotations()) {
            //     markdown.append("  ").append(annotation.toString()).append("\n");
            // }
            

            
            for (BodyDeclaration<?> member : type.getMembers()) {
                if (member instanceof FieldDeclaration) {
                    FieldDeclaration field = (FieldDeclaration) member;
                    for (VariableDeclarator variable : field.getVariables()) {
                        markdown.append("  - ").append(variable.getTypeAsString())
                                .append(" ").append(variable.getNameAsString()).append("  \n");
                    }
                } else if (member instanceof MethodDeclaration) {
                    MethodDeclaration method = (MethodDeclaration) member;
    
                    // Add annotations for methods
                    for (AnnotationExpr annotation : method.getAnnotations()) {
                        markdown.append("  ").append(annotation.toString()).append("  \n");
                    }
    
                    markdown.append("  + ").append(method.getDeclarationAsString(false, true, true)).append("  \n");
                }
            }
        }
    
        return markdown.toString();
    }
    
    

}
