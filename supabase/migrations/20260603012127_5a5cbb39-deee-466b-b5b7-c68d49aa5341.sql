
-- 1. Lock down trigger function (only used internally by triggers)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2. Prevent duplicate / enumeration flood on newsletter_subscribers
DELETE FROM public.newsletter_subscribers a
USING public.newsletter_subscribers b
WHERE a.ctid < b.ctid AND lower(a.email) = lower(b.email);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_unique
  ON public.newsletter_subscribers (lower(email));

-- 3. Defense-in-depth: explicit restrictive policy preventing non-admins from
-- inserting into user_roles. The existing "Admins can manage roles" ALL policy
-- already enforces this via WITH CHECK, but a restrictive policy makes it
-- explicit and resilient to future permissive policy additions.
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
