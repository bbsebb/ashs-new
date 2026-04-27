package fr.hoenheimsports.backend.shared.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        log.error("Erreur de validation", ex);

        ProblemDetail problem = ProblemDetail.forStatus(status);
        problem.setTitle("Erreur de validation");
        problem.setDetail("La requête contient des champs invalides.");
        problem.setType(URI.create("https://example.invalid/problems/validation")); // optionnel (mets ton URI à toi)

        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Erreur de validation",
                        (existing, replacement) -> existing
                ));

        Map<String, String> globalErrors = ex.getBindingResult()
                .getGlobalErrors()
                .stream()
                .collect(Collectors.toMap(
                        ObjectError::getObjectName,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Erreur de validation",
                        (existing, replacement) -> existing
                ));

        problem.setProperty("fieldErrors", fieldErrors);
        problem.setProperty("globalErrors", globalErrors);

        return ResponseEntity.status(status).headers(headers).body(problem);
    }



    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ProblemDetail> handleRuntimeException(RuntimeException ex, WebRequest request) {
        log.error("Erreur technique lors du traitement de la demande", ex);
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setTitle("Erreur technique");
        problem.setDetail("Une erreur technique est survenue lors du traitement de votre demande.");
        problem.setType(URI.create("https://example.invalid/problems/internal-error")); // optionnel

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleAllExceptions(Exception ex, WebRequest request) {
        log.error("Erreur inattendue", ex);

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setTitle("Erreur inattendue");
        problem.setDetail("Une erreur inattendue s'est produite sur le serveur.");
        problem.setType(URI.create("https://example.invalid/problems/unexpected")); // optionnel

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
