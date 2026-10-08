-- Additive, server-bound free-play intent. Existing normal login tokens stay null.
ALTER TABLE login_tokens ADD COLUMN game_id TEXT CHECK (game_id IS NULL OR game_id IN ('port-lucky','mop-galaxy'));
