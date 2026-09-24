-- Extensions used across the schema.
-- pgcrypto: gen_random_uuid() for primary keys, crypt()/gen_salt() for seed.sql.
-- btree_gist: lets the appointments exclusion constraint mix an equality
--   column (doctor_id) with a range overlap column (tstzrange) in one GiST index.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;
