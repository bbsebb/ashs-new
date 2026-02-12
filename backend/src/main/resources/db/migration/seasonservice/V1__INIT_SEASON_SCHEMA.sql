CREATE TABLE season_schema.season
(
    id         UUID         NOT NULL,
    start_date date         NOT NULL,
    end_date   date         NOT NULL,
    name       VARCHAR(255) NOT NULL,
    CONSTRAINT pk_season PRIMARY KEY (id)
);