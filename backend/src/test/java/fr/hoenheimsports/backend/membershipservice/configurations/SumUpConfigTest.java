package fr.hoenheimsports.backend.membershipservice.configurations;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("SumUpConfig Interceptor Retry Tests")
class SumUpConfigTest {

    private final SumUpConfig sumUpConfig = new SumUpConfig();
    private final ClientHttpRequestInterceptor interceptor = sumUpConfig.sumUpRetryInterceptor();

    private HttpRequest createMockRequest() {
        HttpRequest request = mock(HttpRequest.class);
        when(request.getHeaders()).thenReturn(new org.springframework.http.HttpHeaders());
        when(request.getMethod()).thenReturn(org.springframework.http.HttpMethod.POST);
        try {
            when(request.getURI()).thenReturn(new java.net.URI("https://api.sumup.com"));
        } catch (Exception e) {
            // Ignore
        }
        return request;
    }

    private ClientHttpResponse createMockResponse(HttpStatus status) throws IOException {
        ClientHttpResponse response = mock(ClientHttpResponse.class);
        when(response.getStatusCode()).thenReturn(status);
        when(response.getHeaders()).thenReturn(new org.springframework.http.HttpHeaders());
        return response;
    }

    @Test
    @DisplayName("Should succeed on the second attempt when the first attempt throws an IOException")
    void shouldSucceedOnSecondAttempt_WhenFirstThrowsIOException() throws Exception {
        // Given
        HttpRequest request = createMockRequest();
        byte[] body = new byte[0];
        ClientHttpRequestExecution execution = mock(ClientHttpRequestExecution.class);
        ClientHttpResponse mockResponse = createMockResponse(HttpStatus.OK);

        when(execution.execute(any(), any()))
                .thenThrow(new IOException("Timeout or connection reset"))
                .thenReturn(mockResponse);

        // When
        ClientHttpResponse response = interceptor.intercept(request, body, execution);

        // Then
        assertThat(response).isNotNull();
        verify(execution, times(2)).execute(any(), any());
    }

    @Test
    @DisplayName("Should succeed on the second attempt when the first attempt returns a 500 error code")
    void shouldSucceedOnSecondAttempt_WhenFirstReturns5xxError() throws Exception {
        // Given
        HttpRequest request = createMockRequest();
        byte[] body = new byte[0];
        ClientHttpRequestExecution execution = mock(ClientHttpRequestExecution.class);
        ClientHttpResponse errorResponse = createMockResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        ClientHttpResponse okResponse = createMockResponse(HttpStatus.OK);

        when(execution.execute(any(), any()))
                .thenReturn(errorResponse)
                .thenReturn(okResponse);

        // When
        ClientHttpResponse response = interceptor.intercept(request, body, execution);

        // Then
        assertThat(response).isNotNull();
        verify(execution, times(2)).execute(any(), any());
    }

    @Test
    @DisplayName("Should throw exception when all 3 attempts fail")
    void shouldThrowExceptionWhenAllAttemptsFail() throws Exception {
        // Given
        HttpRequest request = createMockRequest();
        byte[] body = new byte[0];
        ClientHttpRequestExecution execution = mock(ClientHttpRequestExecution.class);

        when(execution.execute(any(), any())).thenThrow(new IOException("Connection error"));

        // When & Then
        assertThatThrownBy(() -> interceptor.intercept(request, body, execution))
                .isInstanceOf(IOException.class)
                .hasMessageContaining("Connection error");

        verify(execution, times(3)).execute(any(), any());
    }
}
