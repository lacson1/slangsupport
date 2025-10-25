# Add database initialization script
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON "search_history"("userId");
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON "search_history"("timestamp");
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON "favorites"("userId");
CREATE INDEX IF NOT EXISTS idx_favorites_saved_at ON "favorites"("savedAt");
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON "quiz_scores"("userId");
CREATE INDEX IF NOT EXISTS idx_quiz_scores_date ON "quiz_scores"("date");

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_search_history_term_fts ON "search_history" USING gin(to_tsvector('english', "term"));
CREATE INDEX IF NOT EXISTS idx_favorites_term_fts ON "favorites" USING gin(to_tsvector('english', "term"));
