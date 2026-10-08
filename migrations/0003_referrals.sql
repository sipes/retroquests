-- Detached referral provenance has no email, session or external customer data.
ALTER TABLE users ADD COLUMN referral_eligible INTEGER NOT NULL DEFAULT 0;
CREATE TABLE referral_links (
 id TEXT PRIMARY KEY, owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
 game TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER,
 UNIQUE(owner_id,game)
);
CREATE TABLE referral_attributions (
 registration_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 link_id TEXT NOT NULL REFERENCES referral_links(id), created_at INTEGER NOT NULL
);
CREATE TABLE referral_coupons (
 id TEXT PRIMARY KEY, owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
 registration_id TEXT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
 link_id TEXT NOT NULL REFERENCES referral_links(id), issued_at INTEGER NOT NULL,
 redeemed_at INTEGER, game TEXT, claim_key TEXT
);
CREATE INDEX idx_referral_coupons_owner ON referral_coupons(owner_id);
