CREATE TABLE hall_schema.hall
(
    id             UUID         NOT NULL,
    name           VARCHAR(50)  NOT NULL,
    street_address VARCHAR(100) NOT NULL,
    city           VARCHAR(50)  NOT NULL,
    postal_code    VARCHAR(20),
    country        VARCHAR(50)  NOT NULL,
    CONSTRAINT pk_hall PRIMARY KEY (id)
);