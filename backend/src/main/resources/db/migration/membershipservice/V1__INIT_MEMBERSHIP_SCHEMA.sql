CREATE TABLE membership_schema.campaigns (
    id UUID PRIMARY KEY,
    season_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE membership_schema.campaign_categories (
    campaign_id UUID NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    PRIMARY KEY (campaign_id, category_name),
    CONSTRAINT fk_campaign_categories_campaign FOREIGN KEY (campaign_id) REFERENCES membership_schema.campaigns(id)
);

CREATE TABLE membership_schema.payment_transaction
(
    id                UUID           NOT NULL,
    campaign_id       UUID           NOT NULL,
    status            VARCHAR(255)   NOT NULL,
    amount            NUMERIC(19, 2) NOT NULL,
    payer_first_name  VARCHAR(255)   NOT NULL,
    payer_last_name   VARCHAR(255)   NOT NULL,
    payer_email       VARCHAR(255)   NOT NULL,
    sumup_checkout_id VARCHAR(255),
    CONSTRAINT pk_payment_transaction PRIMARY KEY (id)
);

CREATE TABLE membership_schema.memberships (
                                               id                     UUID         NOT NULL,
    campaign_id UUID NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
                                               email                  VARCHAR(255),
    license_number VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
                                               status                 VARCHAR(255) NOT NULL,
                                               payment_transaction_id UUID         NOT NULL,
                                               CONSTRAINT pk_memberships PRIMARY KEY (id),
                                               CONSTRAINT fk_memberships_campaign FOREIGN KEY (campaign_id) REFERENCES membership_schema.campaigns (id),
                                               CONSTRAINT fk_memberships_payment_transaction FOREIGN KEY (payment_transaction_id) REFERENCES membership_schema.payment_transaction (id)
);
