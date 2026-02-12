-- Make type column nullable with default value for multi-content materials
ALTER TABLE materials ALTER COLUMN type DROP NOT NULL;
ALTER TABLE materials ALTER COLUMN type SET DEFAULT 'text';