
DROP POLICY "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe with valid email"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (email IS NOT NULL AND email ~ '^[^@]+@[^@]+\.[^@]+$');
