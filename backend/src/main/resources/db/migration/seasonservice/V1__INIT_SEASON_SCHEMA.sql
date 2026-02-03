CREATE TABLE season_schema.season
(
    id         UUID NOT NULL,
    start_date date,
    end_date   date,
    CONSTRAINT pk_season PRIMARY KEY (id)
);