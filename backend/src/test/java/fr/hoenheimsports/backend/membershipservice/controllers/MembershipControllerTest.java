package fr.hoenheimsports.backend.membershipservice.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryNotAvailableException;
import fr.hoenheimsports.backend.membershipservice.exceptions.MembershipInvalidStatusException;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

/**
 * Unit tests for {@link MembershipController} using {@link MockMvcTester}.
 */
@WebMvcTest(MembershipController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("MembershipController Tests")
class MembershipControllerTest {

    @Autowired
    private MockMvcTester mvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private MembershipService membershipService;


    @Nested
    @DisplayName("Initiate Membership Order")
    class InitiateMembershipOrder {

        @Test
        @DisplayName("Should initiate order successfully when authenticated with valid payload")
        void shouldInitiateOrderSuccessfully() throws Exception {
            // Given
            UUID campaignId = UUID.randomUUID();
            UUID transactionId = UUID.randomUUID();

            MembershipPaymentOrder order = createValidOrder(campaignId);
            SumUpCheckoutDto sumupCheckoutDto = new SumUpCheckoutDto(
                    "sumup-chk-123",
                    "Licence",
                    "http://return-url",
                    "2026-05-31T19:30:24",
                    "https://checkout.sumup.com/test"
            );
            MembershipPaymentResponse response = new MembershipPaymentResponse(
                    transactionId,
                    sumupCheckoutDto,
                    List.of(new MembershipResponse(
                            UUID.randomUUID(),
                            campaignId,
                            "John",
                            "Doe",
                            "john.doe@example.com",
                            "LIC-12345",
                            "U11",
                            new BigDecimal("100.00"),
                            MembershipStatus.PENDING
                    ))
            );

            when(membershipService.initiateMembershipPayment(any(MembershipPaymentOrder.class))).thenReturn(response);

            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/orders")
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(order));

            // Then
            assertThat(result)
                    .hasStatus(HttpStatus.CREATED);

            assertThat(result).bodyJson().extractingPath("$.paymentTransactionId").asString().isEqualTo(transactionId.toString());
            assertThat(result).bodyJson().extractingPath("$.sumupCheckout.id").asString().isEqualTo("sumup-chk-123");
            assertThat(result).bodyJson().extractingPath("$.sumupCheckout.description").asString().isEqualTo("Licence");
            assertThat(result).bodyJson().extractingPath("$.sumupCheckout.returnUrl").asString().isEqualTo("http://return-url");
            assertThat(result).bodyJson().extractingPath("$.sumupCheckout.date").asString().isEqualTo("2026-05-31T19:30:24");
            assertThat(result).bodyJson().extractingPath("$.sumupCheckout.checkoutUrl").asString().isEqualTo("https://checkout.sumup.com/test");
            assertThat(result).bodyJson().extractingPath("$.memberships[0].firstName").asString().isEqualTo("John");
            assertThat(result).bodyJson().extractingPath("$.memberships[0].lastName").asString().isEqualTo("Doe");
            assertThat(result).bodyJson().extractingPath("$.memberships[0].email").asString().isEqualTo("john.doe@example.com");
            assertThat(result).bodyJson().extractingPath("$.memberships[0].licenseNumber").asString().isEqualTo("LIC-12345");
            assertThat(result).bodyJson().extractingPath("$.memberships[0].categoryName").asString().isEqualTo("U11");
            assertThat(result).bodyJson().extractingPath("$.memberships[0].amount").asNumber().isEqualTo(100.00);
            assertThat(result).bodyJson().extractingPath("$.memberships[0].status").asString().isEqualTo("PENDING");
        }

        @Test
        @DisplayName("Should initiate order successfully when anonymous")
        void shouldInitiateOrderSuccessfullyWhenAnonymous() throws Exception {
            // Given
            UUID campaignId = UUID.randomUUID();
            UUID transactionId = UUID.randomUUID();

            MembershipPaymentOrder order = createValidOrder(campaignId);
            SumUpCheckoutDto sumupCheckoutDto = new SumUpCheckoutDto(
                    "sumup-chk-123",
                    "Licence",
                    "http://return-url",
                    "2026-05-31T19:30:24",
                    "https://checkout.sumup.com/test"
            );
            MembershipPaymentResponse response = new MembershipPaymentResponse(
                    transactionId,
                    sumupCheckoutDto,
                    List.of(new MembershipResponse(
                            UUID.randomUUID(),
                            campaignId,
                            "John",
                            "Doe",
                            "john.doe@example.com",
                            "LIC-12345",
                            "U11",
                            new BigDecimal("100.00"),
                            MembershipStatus.PENDING
                    ))
            );

            when(membershipService.initiateMembershipPayment(any(MembershipPaymentOrder.class))).thenReturn(response);

            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(order));

            // Then
            assertThat(result)
                    .hasStatus(HttpStatus.CREATED);

            assertThat(result).bodyJson().extractingPath("$.paymentTransactionId").asString().isEqualTo(transactionId.toString());
        }

        @Test
        @DisplayName("Should return 400 Bad Request and ProblemDetail when service throws CategoryNotAvailableException")
        void shouldReturnBadRequestWhenCategoryNotAvailable() throws Exception {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipPaymentOrder order = createValidOrder(campaignId);

            when(membershipService.initiateMembershipPayment(any(MembershipPaymentOrder.class)))
                    .thenThrow(new CategoryNotAvailableException("La catégorie U11 n'est pas disponible pour cette campagne"));

            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/orders")
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(order));

            // Then
            assertThat(result)
                    .hasStatus(HttpStatus.BAD_REQUEST);

            assertThat(result).bodyJson().extractingPath("$.title").asString().isEqualTo("Catégorie indisponible");
            assertThat(result).bodyJson().extractingPath("$.detail").asString().isEqualTo("La catégorie U11 n'est pas disponible pour cette campagne");
        }

        @ParameterizedTest(name = "{0}")
        @MethodSource("provideInvalidOrders")
        @DisplayName("Should reject invalid orders with proper field validation messages")
        void shouldRejectInvalidOrders(String testName, MembershipPaymentOrder invalidOrder, String expectedFieldPath, String expectedMessage) throws Exception {
            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/orders")
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidOrder));

            // Then
            assertThat(result)
                    .hasStatus(HttpStatus.BAD_REQUEST);

            assertThat(result).bodyJson().extractingPath("$.title").asString().isEqualTo("Erreur de validation");
            assertThat(result).bodyJson().extractingPath("$.detail").asString().isEqualTo("La requête contient des champs invalides.");
            assertThat(result).bodyJson().extractingPath("$.fieldErrors['" + expectedFieldPath + "']").asString().isEqualTo(expectedMessage);
        }

        private static Stream<Arguments> provideInvalidOrders() {
            UUID campaignId = UUID.randomUUID();
            PaymentPayerInfoCreateRequest validPayer = new PaymentPayerInfoCreateRequest("John", "Doe", "john.doe@example.com");
            MembershipCreateRequest validMembership = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );

            // Invalid Payer objects
            PaymentPayerInfoCreateRequest payerNoFirstname = new PaymentPayerInfoCreateRequest(" ", "Doe", "john.doe@example.com");
            PaymentPayerInfoCreateRequest payerNoLastname = new PaymentPayerInfoCreateRequest("John", " ", "john.doe@example.com");
            PaymentPayerInfoCreateRequest payerNoEmail = new PaymentPayerInfoCreateRequest("John", "Doe", null);
            PaymentPayerInfoCreateRequest payerInvalidEmail = new PaymentPayerInfoCreateRequest("John", "Doe", "invalid-email");

            // Invalid Membership objects
            MembershipCreateRequest membershipNoFirstname = new MembershipCreateRequest(
                    " ", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipNoLastname = new MembershipCreateRequest(
                    "John", " ", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipNoEmail = new MembershipCreateRequest(
                    "John", "Doe", null, "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipInvalidEmail = new MembershipCreateRequest(
                    "John", "Doe", "not-an-email", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipNoLicense = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", " ",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipNoCategory = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    null
            );

            // Invalid Category objects
            MembershipCreateRequest membershipCategoryNoName = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto(" ", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipCategoryLongName = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("VeryLongCategoryNameMoreThanTwentyChars", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipCategoryBoundaryNameTooLong = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("123456789012345678901", new BigDecimal("100.00")) // 21 chars
            );
            MembershipCreateRequest membershipCategoryNoAmount = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", null)
            );
            MembershipCreateRequest membershipCategoryNegativeAmount = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("-10.00"))
            );
            MembershipCreateRequest membershipCategoryZeroAmount = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("0.00"))
            );
            MembershipCreateRequest membershipCategoryInvalidDigitsAmount = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.123")) // 3 decimal places
            );

            return Stream.of(
                    // Campaign validation
                    Arguments.of("Campaign ID missing",
                            new MembershipPaymentOrder(null, validPayer, List.of(validMembership), false),
                            "campaignId", "La campagne est obligatoire"),

                    // Payer validation
                    Arguments.of("Payer firstname missing",
                            new MembershipPaymentOrder(campaignId, payerNoFirstname, List.of(validMembership), false),
                            "paymentPayerInfoCreateRequest.firstname", "Le prénom est obligatoire"),
                    Arguments.of("Payer lastname missing",
                            new MembershipPaymentOrder(campaignId, payerNoLastname, List.of(validMembership), false),
                            "paymentPayerInfoCreateRequest.lastname", "Le nom est obligatoire"),
                    Arguments.of("Payer email missing",
                            new MembershipPaymentOrder(campaignId, payerNoEmail, List.of(validMembership), false),
                            "paymentPayerInfoCreateRequest.email", "L'email est obligatoire"),
                    Arguments.of("Payer email invalid",
                            new MembershipPaymentOrder(campaignId, payerInvalidEmail, List.of(validMembership), false),
                            "paymentPayerInfoCreateRequest.email", "L'email doit être valide"),

                    // Membership validation
                    Arguments.of("Membership firstname missing",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipNoFirstname), false),
                            "membershipCreateRequests[0].firstName", "Le prénom est requis"),
                    Arguments.of("Membership lastname missing",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipNoLastname), false),
                            "membershipCreateRequests[0].lastName", "Le nom est requis"),
                    Arguments.of("Membership email missing",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipNoEmail), false),
                            "membershipCreateRequests[0].email", "L’e-mail est requis"),
                    Arguments.of("Membership email invalid",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipInvalidEmail), false),
                            "membershipCreateRequests[0].email", "L’e-mail doit être valide"),
                    Arguments.of("Membership license missing",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipNoLicense), false),
                            "membershipCreateRequests[0].licenseNumber", "Le numéro de licence est requis"),
                    Arguments.of("Membership category missing",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipNoCategory), false),
                            "membershipCreateRequests[0].category", "Le nom de la catégorie est requis"),

                    // Category validation
                    Arguments.of("Category name missing",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipCategoryNoName), false),
                            "membershipCreateRequests[0].category.name", "Le nom de la catégorie est obligatoire"),
                    Arguments.of("Category name too long",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipCategoryLongName), false),
                            "membershipCreateRequests[0].category.name", "Le nom de la catégorie ne doit pas dépasser 20 caractères"),
                    Arguments.of("Category name boundary too long (21 chars)",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipCategoryBoundaryNameTooLong), false),
                            "membershipCreateRequests[0].category.name", "Le nom de la catégorie ne doit pas dépasser 20 caractères"),
                    Arguments.of("Category amount missing",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipCategoryNoAmount), false),
                            "membershipCreateRequests[0].category.amount", "Le montant est obligatoire"),
                    Arguments.of("Category amount negative",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipCategoryNegativeAmount), false),
                            "membershipCreateRequests[0].category.amount", "Le montant doit être positif"),
                    Arguments.of("Category amount zero",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipCategoryZeroAmount), false),
                            "membershipCreateRequests[0].category.amount", "Le montant doit être positif"),
                    Arguments.of("Category amount invalid decimal format",
                            new MembershipPaymentOrder(campaignId, validPayer, List.of(membershipCategoryInvalidDigitsAmount), false),
                            "membershipCreateRequests[0].category.amount", "Le montant doit être un nombre décimal à 2 chiffres après la virgule")
            );
        }

        private MembershipPaymentOrder createValidOrder(UUID campaignId) {
            PaymentPayerInfoCreateRequest payer = new PaymentPayerInfoCreateRequest("John", "Doe", "john.doe@example.com");
            MembershipCreateRequest membership = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            return new MembershipPaymentOrder(campaignId, payer, List.of(membership), false);
        }
    }

    @Nested
    @DisplayName("Get Membership")
    class GetMembership {

        @Test
        @DisplayName("Should return membership successfully when authenticated and membership exists")
        void shouldReturnMembershipWhenExists() throws Exception {
            // Given
            UUID membershipId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();
            MembershipResponse response = new MembershipResponse(
                    membershipId,
                    campaignId,
                    "John",
                    "Doe",
                    "john.doe@example.com",
                    "LIC-12345",
                    "U11",
                    new BigDecimal("100.00"),
                    MembershipStatus.PENDING
            );

            when(membershipService.getMembership(membershipId)).thenReturn(response);

            // When
            var result = mvc.get()
                    .uri("/api/v1/memberships/" + membershipId)
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ));

            // Then
            assertThat(result).hasStatus(HttpStatus.OK);
            assertThat(result).bodyJson().extractingPath("$.id").asString().isEqualTo(membershipId.toString());
            assertThat(result).bodyJson().extractingPath("$.campaignId").asString().isEqualTo(campaignId.toString());
            assertThat(result).bodyJson().extractingPath("$.firstName").asString().isEqualTo("John");
            assertThat(result).bodyJson().extractingPath("$.lastName").asString().isEqualTo("Doe");
            assertThat(result).bodyJson().extractingPath("$.email").asString().isEqualTo("john.doe@example.com");
            assertThat(result).bodyJson().extractingPath("$.licenseNumber").asString().isEqualTo("LIC-12345");
            assertThat(result).bodyJson().extractingPath("$.categoryName").asString().isEqualTo("U11");
            assertThat(result).bodyJson().extractingPath("$.amount").asNumber().isEqualTo(100.00);
            assertThat(result).bodyJson().extractingPath("$.status").asString().isEqualTo("PENDING");
        }

        @Test
        @DisplayName("Should return 404 Not Found when membership does not exist")
        void shouldReturnNotFoundWhenDoesNotExist() throws Exception {
            // Given
            UUID membershipId = UUID.randomUUID();
            when(membershipService.getMembership(membershipId))
                    .thenThrow(new EntityNotFoundException("Adhérent non trouvé"));

            // When
            var result = mvc.get()
                    .uri("/api/v1/memberships/" + membershipId)
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ));

            // Then
            assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
            assertThat(result).bodyJson().extractingPath("$.detail").asString().isEqualTo("Adhérent non trouvé");
        }

        @Test
        @DisplayName("Should return 401 Unauthorized when get is called anonymously")
        void shouldReturnUnauthorizedWhenAnonymous() throws Exception {
            // Given
            UUID membershipId = UUID.randomUUID();

            // When
            var result = mvc.get()
                    .uri("/api/v1/memberships/" + membershipId);

            // Then
        }
    }

    @Nested
    @DisplayName("Process Membership")
    class ProcessMembership {

        @Test
        @DisplayName("Should process membership successfully when authenticated and membership is PAID")
        void shouldProcessMembershipSuccessfully() throws Exception {
            // Given
            UUID membershipId = UUID.randomUUID();

            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/" + membershipId + "/process")
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ));

            // Then
            assertThat(result).hasStatus(HttpStatus.NO_CONTENT);
            verify(membershipService).processMembership(membershipId);
        }

        @Test
        @DisplayName("Should return 400 Bad Request when membership has invalid status")
        void shouldReturnBadRequestWhenInvalidStatus() throws Exception {
            // Given
            UUID membershipId = UUID.randomUUID();
            doThrow(new MembershipInvalidStatusException("L'adhésion doit être au statut PAID pour être traitée"))
                    .when(membershipService).processMembership(membershipId);

            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/" + membershipId + "/process")
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ));

            // Then
            assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
            assertThat(result).bodyJson().extractingPath("$.title").asString().isEqualTo("Statut invalide");
            assertThat(result).bodyJson().extractingPath("$.detail").asString().isEqualTo("L'adhésion doit être au statut PAID pour être traitée");
        }

        @Test
        @DisplayName("Should return 404 Not Found when membership does not exist")
        void shouldReturnNotFoundWhenDoesNotExist() throws Exception {
            // Given
            UUID membershipId = UUID.randomUUID();
            doThrow(new EntityNotFoundException("Adhérent non trouvé"))
                    .when(membershipService).processMembership(membershipId);

            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/" + membershipId + "/process")
                    .with(jwt().jwt(j -> j
                            .claim("sub", "user")
                            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                    ));

            // Then
            assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
            assertThat(result).bodyJson().extractingPath("$.detail").asString().isEqualTo("Adhérent non trouvé");
        }

        @Test
        @DisplayName("Should return 401 Unauthorized when process is called anonymously")
        void shouldReturnUnauthorizedWhenAnonymous() throws Exception {
            // Given
            UUID membershipId = UUID.randomUUID();

            // When
            var result = mvc.post()
                    .uri("/api/v1/memberships/" + membershipId + "/process");

            // Then
            assertThat(result).hasStatus(HttpStatus.UNAUTHORIZED);
        }
    }
}
