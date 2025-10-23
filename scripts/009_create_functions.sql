-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET views = views + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment subscriber count
CREATE OR REPLACE FUNCTION increment_subscriber_count(channel_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE channels
  SET subscriber_count = subscriber_count + 1
  WHERE id = channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement subscriber count
CREATE OR REPLACE FUNCTION decrement_subscriber_count(channel_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE channels
  SET subscriber_count = GREATEST(subscriber_count - 1, 0)
  WHERE id = channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
