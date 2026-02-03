package fr.hoenheimsports.backend;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

public class ArchitectureTests {
    ApplicationModules modules = ApplicationModules.of(BackendApplication.class);

    @Test
    void verifyModularity() {
        // Vérifie les cycles et l'encapsulation (public vs internal)
        modules.verify();
        modules.forEach(IO::println);
    }

    @Test
    void createDocumentation() {
        // Génère les diagrammes C4 et UML dans target/spring-modulith-docs
        new Documenter(modules)
                .writeModuleCanvases()
                .writeModulesAsPlantUml()
                .writeIndividualModulesAsPlantUml();
    }
}
