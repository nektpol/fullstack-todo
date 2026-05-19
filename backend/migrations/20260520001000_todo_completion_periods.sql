ALTER TABLE todo_completions
ADD COLUMN IF NOT EXISTS period_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS period_type TEXT;

UPDATE todo_completions
SET period_start = DATE_TRUNC('day', completed_at),
    period_type = COALESCE(period_type, 'daily')
WHERE period_start IS NULL;

ALTER TABLE todo_completions
ALTER COLUMN period_start SET NOT NULL,
ALTER COLUMN period_type SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_todo_completions_todo_period
ON todo_completions (todo_id, period_start);

CREATE INDEX IF NOT EXISTS idx_todo_completions_todo_completed_at
ON todo_completions (todo_id, completed_at DESC);
