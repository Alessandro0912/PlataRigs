create extension if not exists "uuid-ossp";

create table lager (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  kategorie text,
  anzahl integer default 1,
  preis numeric,
  lieferant text,
  hinzugefuegt_am timestamp default now()
);

create table pcs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  teile json not null,
  gesamtpreis numeric,
  created_at timestamp default now()
);
