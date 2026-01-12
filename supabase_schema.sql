-- Create the listings table
create table listings (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  price text not null,
  phone text not null,
  location text,       -- ADDED: Location field
  visual_style text,   -- ADDED: Visual Style field
  photo_url text,
  views integer default 0,
  shares integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table listings enable row level security;

-- Policy 2: Enable Read for Public (anyone can view)
create policy "Enable read for public" on listings 
for select 
using (true);

-- Create the events table (Analytics)
create table events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null, -- 'qr_scan', 'view', 'contact_click'
  listing_id uuid references listings(id),
  slug text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on events
alter table events enable row level security;

-- Policy 3: Allow anonymous insertion of events
create policy "Enable insert for public" on events
for insert
with check (true);

