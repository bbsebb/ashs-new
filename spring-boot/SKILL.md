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
The minimum level of binding required is `RestTestClient.bindTo(mockMvc)` to ensure security and web layers are properly
tested together.

### 1. Web Slice Tests (@WebMvcTest)

Bind to `MockMvc` to test controller logic, validation, and security in a single class. Use `@Nested` to organize tests
and `@MockitoBean` for mocks.

#### Security Mocking

Do **not** exclude security configuration. Instead, mock the `JwtDecoder` and simulate authentication by adding an
`Authorization: Bearer token` header.

```java
@WebMvcTest(MyController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class MyControllerTest {

    @Autowired
    private MockMvc mockMvc;

   @MockitoBean
   private JwtDecoder jwtDecoder;

   private RestTestClient restTestClient; // anonymous
   private RestTestClient authRestTestClient; // authenticated

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
       this.authRestTestClient = RestTestClient.bindTo(mockMvc)
               .defaultHeader("Authorization", "Bearer token")
               .build();

       Jwt jwt = Jwt.withTokenValue("token")
               .header("alg", "none")
               .claim("sub", "user")
               .claim("realm_access", Map.of("roles", List.of("ADMIN")))
               .issuedAt(Instant.now())
               .expiresAt(Instant.now().plusSeconds(3600))
               .build();

       when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }
}
```

#### Exhaustive Exception Handling Testing

When testing error scenarios (e.g., entity not found, validation error):

1. **Status & Body**: Verify the HTTP status **and** the response body (standard `ProblemDetail`).
2. **Error Message**: Verify that the `detail` field in the `ProblemDetail` matches the message thrown by the service or
   the validation error.
3. **Validation Errors**: For 400 Bad Request, verify the `fieldErrors` map in the `ProblemDetail`.

```java

@Test
void shouldReturn404_WhenEntityNotFound() {
   String errorMessage = "Item not found";
   when(service.getById(any())).thenThrow(new EntityNotFoundException(errorMessage));

   restTestClient.get().uri("/api/v1/items/{id}", UUID.randomUUID())
           .exchange()
           .expectStatus().isNotFound()
           .expectBody()
           .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
           .jsonPath("$.detail").isEqualTo(errorMessage);
}
```

#### Exhaustive Creation & Update Testing

For endpoints creating or updating resources (POST/PUT):

1. **Field-by-Field Verification**: Verify **every single field** of the response DTO via `jsonPath` to ensure the
   mapping is correct.
2. **Security**: Test both authenticated (success) and anonymous (401) access.
3. **Validation**: Use `@ParameterizedTest` to test all validation constraints. The parameters should include a `Map<String, String>` of **expected failing fields and their exact messages**.
4. **Exhaustive Loop**: Systematically use a **classic for-each loop** (not `Map.forEach`) over the map entries to verify each message via `jsonPath`. This ensures every assertion is strictly evaluated by the test runner.

```java
@ParameterizedTest
@MethodSource("invalidRequests")
void shouldReturn400AndSpecificFieldErrors_WhenInvalid(ItemRequest request, Map<String, String> expectedErrors) {
    var bodySpec = restTestClient.post().uri("/api/v1/items")
            .body(request)
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.fieldErrors.size()").isEqualTo(expectedErrors.size());

    for (var entry : expectedErrors.entrySet()) {
        bodySpec.jsonPath("$.fieldErrors['" + entry.getKey() + "']").isEqualTo(entry.getValue());
    }
}
```

#### Exhaustive Collection Testing
```

#### Exhaustive Collection Testing

For endpoints returning lists (GET all):

1. **Empty list**: Verify 200 OK and length 0.
2. **Single element**: Verify 200 OK, length 1, and **all fields** via `jsonPath`.
3. **Multiple elements**: Verify 200 OK, length 2, and identify objects via `jsonPath`.
4. **Load/Performance**: Mock a list of 100 elements and use `assertTimeout(Duration.ofMillis(500), ...)` to verify
   performance.

```java

@Test
void shouldReturn200AndListWithOneItem_WhenOneExists() {
   ItemResponse response = new ItemResponse(UUID.randomUUID(), "Name", "Desc");
   when(service.getAll()).thenReturn(List.of(response));

   restTestClient.get().uri("/api/v1/items")
            .exchange()
            .expectStatus().isOk()
           .expectBody()
           .jsonPath("$.length()").isEqualTo(1)
           .jsonPath("$[0].name").isEqualTo("Name")
           .jsonPath("$[0].description").isEqualTo("Desc");
}
```

### 2. Integration Tests (@SpringBootTest)

Bind to the `ApplicationContext` to test the full stack including security.

```java

@SpringBootTest
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

Pure unit tests (JUnit 6 + Mockito) are reserved **exclusively for pure functions** or business logic without any Spring
context. For controllers, always use the `WebMvcTest` approach above.

#### Handling Nullability Warnings in Tests

Since the project uses JSpecify `@NullMarked`, passing `null` to mandatory fields in tests may trigger IntelliJ
warnings.

- **Preferred**: Use a real empty object if possible (e.g., `Collections.emptyList()`).
- **If needed**: Use `@SuppressWarnings("DataFlowIssue")` at the method or class level to ignore these warnings in test
  code.

## References

#### Exhaustive Repository Testing (@DataJpaTest)

For repository tests:

1. **CRUD Operations**: Test `save`, `findById`, `findAll`, `delete`, and `existsById`.
2. **Field-by-Field Verification**: After saving or fetching, verify **every single attribute** of the entity using
   AssertJ.
3. **Custom Queries**: Test every custom method defined in the interface with various scenarios (0, 1, multiple
   results).
4. **Data Integrity**: Verify that database constraints (unique, not null, check constraints) are enforced by flushing
   the `EntityManager` or using `saveAndFlush`.

```java

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class MyRepositoryTest {
   @Autowired
   private MyRepository repository;

   @Test
   void shouldSaveAndVerifyAllFields() {
      MyEntity entity = new MyEntity();
      entity.setName("Test");
      entity.setCount(10);

      MyEntity saved = repository.saveAndFlush(entity);

      assertThat(saved.getId()).isNotNull();
      assertThat(saved.getName()).isEqualTo("Test");
      assertThat(saved.getCount()).isEqualTo(10);
    }
}
```

## References

- **Testing Details**: See [references/testing.md](references/testing.md) for assertions and JSON path examples.
- **Project Structure**: Follow the modular monolith layout in `backend/src/main/java`.
