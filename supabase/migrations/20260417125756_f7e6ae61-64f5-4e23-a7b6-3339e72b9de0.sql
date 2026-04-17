-- Map legacy employer types to the new taxonomy
UPDATE public.employers SET employer_type = 'law-firm'              WHERE employer_type = 'law-firm';
UPDATE public.employers SET employer_type = 'legal-tech-company'    WHERE employer_type IN ('legal-tech', 'legaltech');
UPDATE public.employers SET employer_type = 'in-house'              WHERE employer_type IN ('corporate', 'in-house-legal');
UPDATE public.employers SET employer_type = 'consulting-firm'       WHERE employer_type IN ('consulting');
UPDATE public.employers SET employer_type = 'professional-services' WHERE employer_type IN ('professional-services-firm');
UPDATE public.employers SET employer_type = 'alsp'                  WHERE employer_type IN ('alsp');
-- Anything we didn't map (e.g., 'government' or unexpected values): leave untouched.