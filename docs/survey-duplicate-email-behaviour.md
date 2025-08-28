Duplicate email behaviour for survey_submissions

- Each submission creates a new row in `survey_responses` with a fresh `id`.
- We intentionally do not upsert by `email` to preserve longitudinal responses.
- Analytics or CRM can consider the latest submission by `created_at` per `email` if deduplication is needed.
- This approach is the simplest and avoids race conditions. It also enables tracking change over time.

