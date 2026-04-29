package fr.hoenheimsports.backend;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition;
import com.tngtech.archunit.library.GeneralCodingRules;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

import static com.tngtech.archunit.base.DescribedPredicate.not;
import static com.tngtech.archunit.core.domain.JavaClass.Predicates.simpleNameEndingWith;

public class ArchitectureTests {

    private final ApplicationModules modules = ApplicationModules.of(BackendApplication.class);
    private static JavaClasses importedClasses;

    @BeforeAll
    static void setup() {
        importedClasses = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("fr.hoenheimsports.backend");
    }

    @Test
    void verifyModularity() {
        // Vérifie les cycles et l'encapsulation (public vs internal)
        modules.verify();
    }

    @Test
    void createDocumentation() {
        // Génère les diagrammes C4 et UML dans target/spring-modulith-docs
        new Documenter(modules)
                .writeModuleCanvases()
                .writeModulesAsPlantUml()
                .writeIndividualModulesAsPlantUml();
    }

    @Test
    void noFieldInjection() {
        // Version simplifiée : aucun champ ne doit être annoté par @Autowired.
        // On exclut les classes MapStruct (Impl).
        ArchRuleDefinition.noFields()
                .that().areAnnotatedWith(Autowired.class)
                .should().beAnnotatedWith(Autowired.class)
                .allowEmptyShould(true)
                .check(importedClasses.that(not(simpleNameEndingWith("Impl"))));
    }

    @Test
    void noStandardStreams() {
        GeneralCodingRules.NO_CLASSES_SHOULD_ACCESS_STANDARD_STREAMS
                .check(importedClasses);
    }

    @Test
    void servicesShouldBeAnnotated() {
        ArchRuleDefinition.classes()
                .that().haveSimpleNameEndingWith("Service")
                .and().areNotInterfaces()
                .should().beAnnotatedWith(Service.class)
                .check(importedClasses);
    }

    @Test
    void controllersShouldBeAnnotated() {
        ArchRuleDefinition.classes()
                .that().haveSimpleNameEndingWith("Controller")
                .and().areNotInterfaces()
                .should().beAnnotatedWith(RestController.class)
                .check(importedClasses);
    }
}
