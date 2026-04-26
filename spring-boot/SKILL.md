---
name: spring-boot
description: Expert assistant for Spring Boot development using Java 25, Spring Boot 4.0, and modern testing with RestTestClient. Use when creating controllers, services, or writing tests following the Dan Vega RestTestClient model with @BeforeEach binding.
---

# Spring Boot Development & Testing

This skill provides guidance for developing and testing Spring Boot applications using modern standards (Java 25+,
Spring Boot 4.0+).

## Core Mandates

1. **Test-Driven Development (TDD)**:
    - **Red**: Write a minimal failing test.
    - **Green**: Write the minimal code to pass the test.
    - **Refactor**: Improve code while keeping tests green.
      *Never write production code without a failing test.*
2. **Zero Null Policy**:
    - Use `@NullMarked` (JSpecify) at the package level.
    - Use `Optional<T>` for potentially empty returns.
3. **Clean Code**:
    - Use long, explicit variable names (e.g., `userAuthenticationStatus` vs `authStatus`).
    - Follow project-specific naming conventions.

## Modern Testing with RestTestClient

Always use `RestTestClient` for testing web layers, following the pattern of initializing it in a `@BeforeEach` method.

### 1. Web Slice Tests (@WebMvcTest)

Bind to `MockMvc` to test controller logic, validation, and security.

```java
@WebMvcTest(MyController.class)
class MyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
    }

    @Test
    void shouldReturnData() {
        restTestClient.get().uri("/api/data")
            .exchange()
            .expectStatus().isOk()
            .expectBody().jsonPath("$.name").isEqualTo("Example");
    }
}
```

### 2. Integration Tests (@SpringBootTest)

Bind to the `ApplicationContext` or a running server.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MyIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private RestTestClient restTestClient;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindToApplicationContext(context).build();
    }
}
```

### 3. Unit Tests (Isolated)

Bind directly to the controller instance for maximum speed.

```java
class MyControllerUnitTest {

    private RestTestClient restTestClient;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindToController(new MyController()).build();
    }
}
```

## References

- **Testing Details**: See [references/testing.md](references/testing.md) for assertions and JSON path examples.
- **Project Structure**: Follow the modular monolith layout in `backend/src/main/java`.
