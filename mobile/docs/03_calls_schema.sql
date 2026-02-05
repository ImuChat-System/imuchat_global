-- Call Events Table
CREATE TABLE IF NOT EXISTS call_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  callee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  call_type TEXT CHECK (call_type IN ('audio', 'video')) NOT NULL,
  status TEXT CHECK (status IN ('ringing', 'accepted', 'rejected', 'ended', 'missed')) NOT NULL DEFAULT 'ringing',
  stream_call_id TEXT, -- Stream Video call ID
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_call_events_caller ON call_events(caller_id);
CREATE INDEX idx_call_events_callee ON call_events(callee_id);
CREATE INDEX idx_call_events_status ON call_events(status);
CREATE INDEX idx_call_events_created_at ON call_events(created_at DESC);

-- RLS Policies
ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;

-- Users can view calls they're involved in
CREATE POLICY "Users can view their own calls"
  ON call_events
  FOR SELECT
  USING (
    auth.uid() = caller_id OR auth.uid() = callee_id
  );

-- Users can insert calls they initiate
CREATE POLICY "Users can create calls"
  ON call_events
  FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

-- Users can update calls they're involved in
CREATE POLICY "Users can update their calls"
  ON call_events
  FOR UPDATE
  USING (
    auth.uid() = caller_id OR auth.uid() = callee_id
  );

-- Function to automatically set ended_at timestamp
CREATE OR REPLACE FUNCTION update_call_ended_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('ended', 'rejected', 'missed') AND OLD.status NOT IN ('ended', 'rejected', 'missed') THEN
    NEW.ended_at = NOW();
  END IF;
  
  IF NEW.status = 'accepted' AND OLD.status = 'ringing' THEN
    NEW.answered_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_call_ended_at
  BEFORE UPDATE ON call_events
  FOR EACH ROW
  EXECUTE FUNCTION update_call_ended_at();

-- Grant permissions
GRANT ALL ON call_events TO authenticated;
GRANT USAGE ON SEQUENCE call_events_id_seq TO authenticated;
