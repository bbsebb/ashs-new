# RestTestClient Testing Patterns

## Fluent Assertions Cheat Sheet

### Status Assertions

- `.expectStatus().isOk()` (200)
- `.expectStatus().isCreated()` (201)
- `.expectStatus().isNoContent()` (204)
- `.expectStatus().isBadRequest()` (400)
- `.expectStatus().isUnauthorized()` (401)
- `.expectStatus().isForbidden()` (403)
- `.expectStatus().isNotFound()` (404)
- `.expectStatus().is5xxServerError()`

### Header Assertions

- `.expectHeader().contentType(MediaType.APPLICATION_JSON)`
- `.expectHeader().valueEquals("Cache-Control", "no-cache")`

### Body Assertions (JSON Path)

Use `jsonPath` to verify specific parts of the JSON response:

```java
restTestClient.get().uri("/api/users/1")
    .exchange()
    .expectBody()
    .jsonPath("$.id").isEqualTo(1)
    .jsonPath("$.username").isEqualTo("jdoe")
    .jsonPath("$.roles").isArray()
    .jsonPath("$.roles[0]").isEqualTo("USER")
    .jsonPath("$.roles.length()").isEqualTo(2)
    .jsonPath("$.address.city").exists();
```

### Response Mapping

You can also map the response body to a class or a list:

```java
// Map to a Single Object
UserDTO user = restTestClient.get().uri("/api/users/1")
    .exchange()
    .expectBody(UserDTO.class)
    .returnResult()
    .getResponseBody();

// Map to a List
List<UserDTO> users = restTestClient.get().uri("/api/users")
    .exchange()
    .expectBodyList(UserDTO.class)
    .returnResult()
    .getResponseBody();
```

## Setup Pattern (Reminder)

Always initialize `RestTestClient` in a `@BeforeEach` method to ensure a fresh client for each test and clear code
structure.

```java
@Autowired
private MockMvc mockMvc;

private RestTestClient restTestClient;

@BeforeEach
void setUp() {
    this.restTestClient = RestTestClient.bindTo(mockMvc).build();
}
```
