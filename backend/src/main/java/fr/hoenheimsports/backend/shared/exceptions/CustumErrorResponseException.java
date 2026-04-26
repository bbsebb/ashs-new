package fr.hoenheimsports.backend.shared.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/**
 * Custom base exception for generating standardized error responses using Spring's ProblemDetail.
 */
@Slf4j
public class CustumErrorResponseException extends ErrorResponseException {

    /**
     * Constructs a new exception with a pre-configured ProblemDetail.
     *
     * @param status        the HTTP status code
     * @param problemDetail the detailed problem information
     */
    public CustumErrorResponseException(HttpStatus status,ProblemDetail problemDetail) {
        log.error("Erreur : {}",problemDetail.getDetail());
        super(status,problemDetail,null);
    }

    /**
     * Constructs a new exception with a title and message.
     *
     * @param status the HTTP status code
     * @param title the title of the error
     * @param message the detail message
     */
    public CustumErrorResponseException(HttpStatus status,String title, String message) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
        problemDetail.setTitle(title);
        this(status,problemDetail);
    }

    /**
     * Constructs a new exception with a specific status and message.
     *
     * @param status the HTTP status code
     * @param message the detail message
     */
    public CustumErrorResponseException(HttpStatus status, String message) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
        problemDetail.setTitle("Une erreur est survenue");
        this(status,problemDetail);
    }

    /**
     * Constructs a new exception with a default BAD_REQUEST status.
     *
     * @param message the detail message
     */
    public CustumErrorResponseException( String message) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
        problemDetail.setTitle("Une erreur est survenue");
        this(status,problemDetail);
    }
}
