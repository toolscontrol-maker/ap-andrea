-- ==============================================================================
-- test_rls_scenarios.sql
-- Verification scenarios for Row Level Security (RLS) policies.
-- ==============================================================================

-- Test Scenario 1: Couple Isolation
-- Expectation: User A in Couple 1 cannot select or modify rows where couple_id = Couple 2.

-- Test Scenario 2: Unrevealed Surprise Privacy
-- Expectation: Partner B cannot select secret_title or secret_location from event_surprises
-- until revealed = TRUE.

-- Test Scenario 3: Maximum 2 Members per Couple
-- Expectation: Attempting to insert a 3rd active member in couple_members raises an exception.
