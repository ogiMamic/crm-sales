-- Kreiranje Customers tabele
CREATE TABLE "public"."Customers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user_id" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    PRIMARY KEY ("id")
);

-- Omogućavanje Row Level Security za Customers tabelu
ALTER TABLE "public"."Customers" ENABLE ROW LEVEL SECURITY;

-- Kreiranje RLS politike za Customers tabelu
CREATE POLICY "Allow authenticated users to manage their own customers"
ON "public"."Customers"
AS PERMISSIVE
FOR ALL
TO public
USING (auth.jwt() ->> 'user_id' = user_id::text)
WITH CHECK (auth.jwt() ->> 'user_id' = user_id::text);