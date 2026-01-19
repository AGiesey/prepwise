-- Create checkpoints table for LangGraph PostgresSaver
-- This table stores conversation state and history for the unified LangGraph architecture
CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT NOT NULL DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  parent_checkpoint_id TEXT,
  checkpoint JSONB NOT NULL,
  metadata JSONB,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS checkpoints_thread_id_idx 
ON checkpoints(thread_id);

CREATE INDEX IF NOT EXISTS checkpoints_parent_checkpoint_id_idx 
ON checkpoints(parent_checkpoint_id);
