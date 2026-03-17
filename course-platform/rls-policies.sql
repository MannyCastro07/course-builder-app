-- Políticas RLS para sections
DROP POLICY IF EXISTS "sections_select_policy" ON sections;
DROP POLICY IF EXISTS "sections_insert_policy" ON sections;
DROP POLICY IF EXISTS "sections_update_policy" ON sections;
DROP POLICY IF EXISTS "sections_delete_policy" ON sections;

CREATE POLICY "sections_select_policy" ON sections FOR SELECT USING (true);
CREATE POLICY "sections_insert_policy" ON sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sections_update_policy" ON sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sections_delete_policy" ON sections FOR DELETE TO authenticated USING (true);

-- Políticas RLS para lessons
DROP POLICY IF EXISTS "lessons_select_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_insert_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_update_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_delete_policy" ON lessons;

CREATE POLICY "lessons_select_policy" ON lessons FOR SELECT USING (true);
CREATE POLICY "lessons_insert_policy" ON lessons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lessons_update_policy" ON lessons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "lessons_delete_policy" ON lessons FOR DELETE TO authenticated USING (true);
