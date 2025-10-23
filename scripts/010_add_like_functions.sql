-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET likes = likes + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement video likes
CREATE OR REPLACE FUNCTION decrement_video_likes(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
