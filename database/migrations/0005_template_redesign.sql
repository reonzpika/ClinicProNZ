-- Migration: Transform templates from DSL to natural language format
-- Step 1: Add the new templateBody column
ALTER TABLE templates ADD COLUMN template_body TEXT;

-- Step 2: Create a function to convert DSL to natural language template
-- This is a simplified conversion - in production, you might want more sophisticated logic
CREATE OR REPLACE FUNCTION convert_dsl_to_template_body(dsl_data JSONB) RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    section JSONB;
    subsection JSONB;
    overall_instructions TEXT;
BEGIN
    -- Extract overall instructions if they exist
    overall_instructions := dsl_data->>'overallInstructions';
    IF overall_instructions IS NOT NULL AND length(trim(overall_instructions)) > 0 THEN
        result := result || '(' || overall_instructions || ')' || E'\n\n';
    END IF;

    -- Process sections
    FOR section IN SELECT * FROM jsonb_array_elements(dsl_data->'sections')
    LOOP
        -- Add section heading
        result := result || upper(section->>'heading') || ':' || E'\n';
        
        -- Add section prompt as placeholder
        result := result || '- [' || (section->>'prompt') || '] (only include if explicitly mentioned in transcript, contextual notes or clinical note, otherwise leave blank)' || E'\n';
        
        -- Process subsections if they exist
        IF section->'subsections' IS NOT NULL THEN
            FOR subsection IN SELECT * FROM jsonb_array_elements(section->'subsections')
            LOOP
                result := result || '- [' || (subsection->>'heading') || ': ' || (subsection->>'prompt') || '] (only include if explicitly mentioned in transcript, contextual notes or clinical note, otherwise leave blank)' || E'\n';
            END LOOP;
        END IF;
        
        result := result || E'\n';
    END LOOP;

    -- Add standard footer instructions
    result := result || '(Never come up with your own patient details, assessment, diagnosis, differential diagnosis, plan, interventions, evaluation, plan for continuing care, safety netting advice, etc - use only the transcript, contextual notes or clinical note as a reference for the information you include in your note. If any information related to a placeholder has not been explicitly mentioned in the transcript or contextual notes, you must not state the information has not been explicitly mentioned in your output, just leave the relevant placeholder or section blank.)';

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Convert existing DSL data to template_body format
UPDATE templates 
SET template_body = convert_dsl_to_template_body(dsl)
WHERE template_body IS NULL;

-- Step 4: Make template_body NOT NULL (all existing records should now have values)
ALTER TABLE templates ALTER COLUMN template_body SET NOT NULL;

-- Step 5: Drop the old dsl column
ALTER TABLE templates DROP COLUMN dsl;

-- Step 6: Clean up the conversion function
DROP FUNCTION convert_dsl_to_template_body(JSONB); 