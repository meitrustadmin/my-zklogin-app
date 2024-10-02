

CREATE TABLE IF NOT EXISTS auth_recovery (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    identifier TEXT NOT NULL,
    iss TEXT NOT NULL,
    aud TEXT NOT NULL,
    key_claim_name TEXT NOT NULL,
    key_claim_value TEXT NOT NULL,
    wallet TEXT NOT NULL,
    multisig_address TEXT NOT NULL,
    index INTEGER NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    UNIQUE(identifier, status)
);