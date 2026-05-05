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

CREATE TABLE membership_schema.memberships (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    license_number VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    sumup_checkout_id VARCHAR(255),
    CONSTRAINT fk_memberships_campaign FOREIGN KEY (campaign_id) REFERENCES membership_schema.campaigns(id)
);
