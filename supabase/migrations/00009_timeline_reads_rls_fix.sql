-- timeline_reads の RLS を操作別に分け、family_id チェックを追加
DROP POLICY "timeline_reads_own" ON timeline_reads;

CREATE POLICY "timeline_reads_select" ON timeline_reads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "timeline_reads_insert" ON timeline_reads
  FOR INSERT WITH CHECK (user_id = auth.uid() AND family_id = get_user_family_id());

CREATE POLICY "timeline_reads_update" ON timeline_reads
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "timeline_reads_delete" ON timeline_reads
  FOR DELETE USING (user_id = auth.uid());
