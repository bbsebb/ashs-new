CREATE TABLE team_schema.age_group
(
    id             UUID    NOT NULL,
    age_limit      INTEGER NOT NULL,
    is_upper_limit BOOLEAN NOT NULL,
    CONSTRAINT pk_age_group PRIMARY KEY (id)
);

CREATE TABLE team_schema.team
(
    id           UUID         NOT NULL,
    season_id    UUID         NOT NULL,
    gender       VARCHAR(255) NOT NULL,
    name         INTEGER      NOT NULL,
    age_group_id UUID         NOT NULL,
    CONSTRAINT pk_team PRIMARY KEY (id)
);

CREATE TABLE team_schema.team_staff
(
    id       UUID         NOT NULL,
    role     VARCHAR(255) NOT NULL,
    team_id  UUID         NOT NULL,
    staff_id UUID         NOT NULL,
    CONSTRAINT pk_team_staff PRIMARY KEY (id)
);

CREATE TABLE team_schema.training_session
(
    id          UUID                   NOT NULL,
    hall_id     UUID                   NOT NULL,
    day_of_week VARCHAR(255)           NOT NULL,
    team_id     UUID                   NOT NULL,
    start_time  time WITHOUT TIME ZONE NOT NULL,
    end_time    time WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_training_session PRIMARY KEY (id)
);

ALTER TABLE team_schema.team
    ADD CONSTRAINT FK_TEAM_ON_AGE_GROUP FOREIGN KEY (age_group_id) REFERENCES team_schema.age_group (id);

ALTER TABLE team_schema.team_staff
    ADD CONSTRAINT FK_TEAM_STAFF_ON_TEAM FOREIGN KEY (team_id) REFERENCES team_schema.team (id);

ALTER TABLE team_schema.training_session
    ADD CONSTRAINT FK_TRAINING_SESSION_ON_TEAM FOREIGN KEY (team_id) REFERENCES team_schema.team (id);