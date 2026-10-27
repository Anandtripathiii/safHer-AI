-- Run once in the Supabase SQL editor.
do $$
declare t text;
begin
  foreach t in array array['contacts','journeys','sos_events','safe_places','community_reports'] loop
    execute format('create table if not exists %I (device_id text not null, id text not null, data jsonb not null, updated_at timestamptz not null default now(), primary key (device_id, id))', t);
    execute format('alter table %I enable row level security', t);
    -- Demo policy: anon key can read/write. Tighten once real auth exists.
    execute format('drop policy if exists anon_all on %I', t);
    execute format('create policy anon_all on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;
