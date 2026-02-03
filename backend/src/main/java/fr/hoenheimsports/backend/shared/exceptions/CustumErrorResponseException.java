package fr.hoenheimsports.backend.shared.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

@Slf4j
public class CustumErrorResponseException extends ErrorResponseException {

    public CustumErrorResponseException(HttpStatus status,ProblemDetail problemDetail) {
        log.error("Erreur : {}",problemDetail.getDetail());
        super(status,problemDetail,null);
    }
    public CustumErrorResponseException(HttpStatus status,String title, String message) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
        problemDetail.setTitle(title);
        this(status,problemDetail);
    }

    public CustumErrorResponseException(HttpStatus status, String message) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
        problemDetail.setTitle("Une erreur est survenue");
        this(status,problemDetail);
    }

    public CustumErrorResponseException( String message) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
        problemDetail.setTitle("Une erreur est survenue");
        this(status,problemDetail);
    }
}
