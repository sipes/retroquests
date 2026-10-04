-- Forward-only migration: preserve financial records with enforced foreign keys.
CREATE TABLE purchases_v2 (
 id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
 sku TEXT NOT NULL, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL,
 status TEXT NOT NULL, payment_intent TEXT, created_at INTEGER NOT NULL, paid_at INTEGER
);
INSERT INTO purchases_v2 SELECT * FROM purchases;
DROP TABLE purchases;
ALTER TABLE purchases_v2 RENAME TO purchases;
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_pi ON purchases(payment_intent);
CREATE TABLE entitlement_contributions (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 sku TEXT NOT NULL, source_id TEXT NOT NULL, source TEXT NOT NULL,
 purchase_id TEXT REFERENCES purchases(id), granted_at INTEGER NOT NULL, revoked_at INTEGER,
 PRIMARY KEY(user_id,sku,source_id)
);
INSERT INTO entitlement_contributions SELECT user_id,sku,'admin','admin',NULL,granted_at,NULL FROM entitlements WHERE source='admin';
INSERT INTO entitlement_contributions SELECT p.user_id,p.sku,p.id,'stripe',p.id,e.granted_at,NULL
 FROM purchases p JOIN entitlements e ON e.user_id=p.user_id AND e.sku=p.sku WHERE e.source='stripe' AND p.status='paid';
CREATE TABLE access_revocations (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, sku TEXT NOT NULL,
 revoked_at INTEGER NOT NULL, PRIMARY KEY(user_id,sku)
);
DROP TABLE entitlements;
CREATE VIEW entitlements AS SELECT c.user_id,c.sku,MIN(c.granted_at) granted_at,GROUP_CONCAT(DISTINCT c.source) source
 FROM entitlement_contributions c WHERE c.revoked_at IS NULL
 AND NOT EXISTS(SELECT 1 FROM access_revocations r WHERE r.user_id=c.user_id AND r.sku=c.sku)
 AND (c.sku!='port-lucky-walkthrough' OR EXISTS(SELECT 1 FROM entitlement_contributions g WHERE g.user_id=c.user_id AND g.sku='port-lucky' AND g.revoked_at IS NULL AND NOT EXISTS(SELECT 1 FROM access_revocations r WHERE r.user_id=g.user_id AND r.sku=g.sku)))
 GROUP BY c.user_id,c.sku;
CREATE TABLE payment_terminals(payment_intent TEXT PRIMARY KEY, status TEXT NOT NULL, updated_at INTEGER NOT NULL);
ALTER TABLE stripe_events ADD COLUMN claim_key TEXT;
ALTER TABLE stripe_events ADD COLUMN processed_at INTEGER;
ALTER TABLE saves ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE saves ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE login_tokens ADD COLUMN consumed_session TEXT;
CREATE TABLE abuse_limits(scope TEXT NOT NULL, subject_hash TEXT NOT NULL, window_start INTEGER NOT NULL, hits INTEGER NOT NULL, PRIMARY KEY(scope,subject_hash,window_start));
CREATE TABLE admin_audit(id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT NOT NULL, target_id TEXT NOT NULL, action TEXT NOT NULL, sku TEXT, created_at INTEGER NOT NULL);
CREATE TABLE receipt_outbox(purchase_id TEXT PRIMARY KEY REFERENCES purchases(id), status TEXT NOT NULL, updated_at INTEGER NOT NULL);
