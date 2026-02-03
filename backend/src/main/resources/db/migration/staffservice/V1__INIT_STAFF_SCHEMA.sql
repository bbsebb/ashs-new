CREATE TABLE staff_schema.staff
(
    id         UUID        NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    email      VARCHAR(255),
    phone      VARCHAR(255),
    CONSTRAINT pk_staff PRIMARY KEY (id)
);