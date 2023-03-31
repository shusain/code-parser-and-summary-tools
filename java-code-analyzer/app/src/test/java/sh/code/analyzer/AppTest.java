package sh.code.analyzer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kohsuke.github.GHContent;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class AppTest {

    @Mock
    private GitHub github;

    @Mock
    private GHRepository repository;

    @Mock
    private GHContent javaFile;

    @InjectMocks
    private App javaCodeAnalyzer;

    @BeforeEach
    void setUp() throws IOException {
        // when(github.getRepository(any())).thenReturn(repository);
    }

    @Test
    void testAnalyzeJavaCode() throws IOException {
        String sampleJavaCode = "public class SampleClass {\n" +
                "    public void sampleMethod() {}\n" +
                "}";

        // when(repository.getDirectoryContent(eq("/"), eq(".java"))).thenReturn(Collections.singletonList(javaFile));
        // when(javaFile.read()).thenReturn(inputStreamFromString(sampleJavaCode));

        String markdownSummary = App.analyzeJavaCode(sampleJavaCode);

        assertTrue(markdownSummary.contains("+ class SampleClass"));
        assertTrue(markdownSummary.contains("+ void sampleMethod()"));
    }

    // private InputStream inputStreamFromString(String string) {
    //     return new ByteArrayInputStream(string.getBytes(StandardCharsets.UTF_8));
    // }
}
