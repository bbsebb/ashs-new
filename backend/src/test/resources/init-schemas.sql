CREATE SCHEMA IF NOT EXISTS hall_schema;
CREATE SCHEMA IF NOT EXISTS staff_schema;
CREATE SCHEMA IF NOT EXISTS team_schema;
CREATE SCHEMA IF NOT EXISTS season_schema;
CREATE SCHEMA IF NOT EXISTS flyway_schema;
CREATE SCHEMA IF NOT EXISTS modulith_schema;
CREATE SCHEMA IF NOT EXISTS membership_schema;

CREATE TABLE IF NOT EXISTS modulith_schema.event_publication
(
    id                     UUID                     NOT NULL,
    listener_id            TEXT                     NOT NULL,
    event_type             TEXT                     NOT NULL,
    serialized_event       TEXT                     NOT NULL,
    publication_date       TIMESTAMP WITH TIME ZONE NOT NULL,
    completion_date        TIMESTAMP WITH TIME ZONE,
    status                 VARCHAR(255)             NOT NULL,
    completion_attempts    INTEGER                  NOT NULL,
    last_resubmission_date TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_event_publication_status ON modulith_schema.event_publication (status);
