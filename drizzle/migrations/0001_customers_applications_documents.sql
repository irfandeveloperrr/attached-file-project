create or replace function public.is_office_lead(_uid uuid) returns boolean language sql stable security definer set search_path = public
as $$ select public.has_role(_uid,'admin') or public.has_role(_uid,'manager') $$;

create sequence public.customer_code_seq;
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('LM-' || lpad(nextval('public.customer_code_seq')::text, 5, '0')),
  full_name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  assigned_to uuid,
  created_by uuid not null default auth.uid(),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant usage on sequence public.customer_code_seq to authenticated;
grant select, insert, update on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;

create or replace function public.can_access_customer(_cid uuid) returns boolean language sql stable security definer set search_path = public
as $$ select public.is_office_lead(auth.uid()) or exists (select 1 from public.customers c where c.id = _cid and (c.assigned_to = auth.uid() or c.created_by = auth.uid())) $$;

create policy "customers read" on public.customers for select to authenticated
  using (public.is_office_lead(auth.uid()) or assigned_to = auth.uid() or created_by = auth.uid());
create policy "customers insert" on public.customers for insert to authenticated
  with check (created_by = auth.uid() and (public.is_office_lead(auth.uid()) or assigned_to is null or assigned_to = auth.uid()));
create policy "customers update" on public.customers for update to authenticated
  using (public.is_office_lead(auth.uid()) or assigned_to = auth.uid() or created_by = auth.uid())
  with check (public.is_office_lead(auth.uid()) or assigned_to is null or assigned_to = auth.uid());

create type public.application_status as enum ('new','documents_required','ready_for_submission','in_progress','submitted','awaiting_external','completed','rejected','returned','cancelled');
create type public.official_outcome as enum ('pending','approved','rejected');

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  service text not null,
  reference_no text,
  status public.application_status not null default 'new',
  official_outcome public.official_outcome not null default 'pending',
  assigned_to uuid,
  deadline date,
  follow_up_date date,
  required_documents text[] not null default '{}',
  notes text,
  service_fee numeric(12,2) not null default 0,
  third_party_fee numeric(12,2) not null default 0,
  office_completed_at timestamptz,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "apps read" on public.applications for select to authenticated
  using (public.can_access_customer(customer_id) or assigned_to = auth.uid());
create policy "apps insert" on public.applications for insert to authenticated
  with check (created_by = auth.uid() and public.can_access_customer(customer_id));
create policy "apps update" on public.applications for update to authenticated
  using (public.can_access_customer(customer_id) or assigned_to = auth.uid())
  with check (public.can_access_customer(customer_id) or assigned_to = auth.uid());

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id),
  from_status public.application_status,
  to_status public.application_status not null,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
grant select on public.application_status_history to authenticated;
grant all on public.application_status_history to service_role;
alter table public.application_status_history enable row level security;
create policy "history read" on public.application_status_history for select to authenticated
  using (exists (select 1 from public.applications a where a.id = application_id));

create or replace function public.track_application_status() returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.application_status_history(application_id, from_status, to_status, changed_by)
    values (new.id, case when tg_op = 'UPDATE' then old.status end, new.status, auth.uid());
    if new.status = 'completed' and new.office_completed_at is null then new.office_completed_at := now(); end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger applications_status_ins after insert on public.applications for each row execute function public.track_application_status();
create trigger applications_status_upd before update on public.applications for each row execute function public.track_application_status();

create type public.doc_verification as enum ('pending','verified','rejected');
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  application_id uuid references public.applications(id),
  category text not null,
  file_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  verification public.doc_verification not null default 'pending',
  version integer not null default 1,
  replaces_id uuid references public.documents(id),
  expires_on date,
  uploaded_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "docs read" on public.documents for select to authenticated using (public.can_access_customer(customer_id));
create policy "docs insert" on public.documents for insert to authenticated
  with check (uploaded_by = auth.uid() and public.can_access_customer(customer_id)
    and mime_type in ('application/pdf','image/jpeg','image/png') and size_bytes <= 10485760);
create policy "docs verify" on public.documents for update to authenticated using (public.is_office_lead(auth.uid()));

create table public.document_access_log (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id),
  user_id uuid not null default auth.uid(),
  action text not null check (action in ('view','download','upload')),
  created_at timestamptz not null default now()
);
grant select, insert on public.document_access_log to authenticated;
grant all on public.document_access_log to service_role;
alter table public.document_access_log enable row level security;
create policy "log insert" on public.document_access_log for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.documents d where d.id = document_id));
create policy "log read" on public.document_access_log for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "docs storage read" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and public.can_access_customer(((storage.foldername(name))[1])::uuid));
create policy "docs storage write" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.can_access_customer(((storage.foldername(name))[1])::uuid));