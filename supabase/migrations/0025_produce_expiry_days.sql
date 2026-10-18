-- Default shelf life for produce: when a 'produce' item is bought into the
-- pantry without an expiry, expires_at = today + this many days. 0 turns it off.

alter table households
  add column produce_expiry_days integer not null default 7
  check (produce_expiry_days between 0 and 365);
