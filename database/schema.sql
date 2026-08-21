-- ============================================================
-- SILVERA VERİTABANI ŞEMASI
-- Bu dosyayı Supabase panelinde SQL Editor > New Query içine
-- yapıştırıp "Run" ile çalıştır.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- USERS ----------
create table users (
  id uuid primary key default uuid_generate_v4(),
  minecraft_nick text unique not null,
  minecraft_uuid text unique,
  password_hash text not null,
  credit_balance integer not null default 0 check (credit_balance >= 0),
  role text not null default 'user' check (role in ('user','admin')),
  account_status text not null default 'active' check (account_status in ('active','banned','suspended')),
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table products (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('vip','rutbe','kit','kasa_anahtari','kredi','kozmetik','ozel')),
  name text not null,
  description text,
  benefits jsonb default '[]',
  image_url text,
  old_price numeric(10,2),
  price numeric(10,2) not null,
  credit_price integer,
  discount_percent integer default 0,
  delivery_command text,          -- örn: "lp user {PLAYER} parent set silvera_vip"
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  status text not null default 'pending' check (
    status in ('pending','awaiting_payment','paid','processing','delivered','failed','refunded')
  ),
  total_price numeric(10,2) not null,
  total_credits integer,
  payment_method text check (payment_method in ('card','credit_balance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- ORDER ITEMS ----------
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  unit_credit_price integer
);

-- ---------- PAYMENTS ----------
create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id),
  provider text not null,                 -- 'paytr', 'iyzico' vb.
  provider_payment_id text unique,        -- sağlayıcıdan gelen benzersiz işlem id (duplicate koruması)
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','success','failed','refunded')),
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now()
);

-- ---------- CREDIT TRANSACTIONS ----------
create table credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  transaction_type text not null check (
    transaction_type in ('topup','purchase','refund','bonus','admin_adjustment')
  ),
  amount integer not null,                -- pozitif = ekleme, negatif = harcama
  previous_balance integer not null,
  new_balance integer not null,
  reference_id uuid,                      -- ilgili order/payment id
  description text,
  created_at timestamptz not null default now()
);

-- ---------- DELIVERIES ----------
create table deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references order_items(id),
  user_id uuid not null references users(id),
  command text not null,
  status text not null default 'pending' check (status in ('pending','processing','delivered','failed')),
  attempts integer not null default 0,
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  -- aynı sipariş kalemi iki kez teslim edilmesin
  unique (order_item_id)
);

-- ---------- ADMIN USERS (ayrı, normal kullanıcıdan bağımsız) ----------
create table admin_users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ---------- SUPPORT TICKETS ----------
create table support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  category text not null check (
    category in ('odeme_sorunu','kredi_yuklenmedi','vip_teslim_edilmedi','hesap_sorunu','diger')
  ),
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open','answered','closed')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- AUDIT LOGS (admin silemez, sadece insert) ----------
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_type text not null check (actor_type in ('user','admin','system')),
  actor_id uuid,
  action text not null,          -- 'payment_success','credit_topup','vip_delivered', vb.
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index idx_orders_user on orders(user_id);
create index idx_credit_tx_user on credit_transactions(user_id);
create index idx_deliveries_status on deliveries(status);
create index idx_payments_provider_id on payments(provider_payment_id);

-- ============================================================
-- ATOMIC KREDİ HARCAMA FONKSİYONU
-- Bakiye kontrolü + güncelleme + log tek transaction içinde.
-- ============================================================
create or replace function spend_credits(
  p_user_id uuid,
  p_amount integer,
  p_reference_id uuid,
  p_description text
) returns void as $$
declare
  v_balance integer;
begin
  select credit_balance into v_balance from users where id = p_user_id for update;

  if v_balance < p_amount then
    raise exception 'YETERSIZ_BAKIYE';
  end if;

  update users set credit_balance = credit_balance - p_amount where id = p_user_id;

  insert into credit_transactions (
    user_id, transaction_type, amount, previous_balance, new_balance, reference_id, description
  ) values (
    p_user_id, 'purchase', -p_amount, v_balance, v_balance - p_amount, p_reference_id, p_description
  );
end;
$$ language plpgsql;

-- ============================================================
-- ATOMIC KREDİ EKLEME FONKSİYONU (yükleme / iade / bonus / admin)
-- ============================================================
create or replace function add_credits(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_reference_id uuid,
  p_description text
) returns void as $$
declare
  v_balance integer;
begin
  select credit_balance into v_balance from users where id = p_user_id for update;

  update users set credit_balance = credit_balance + p_amount where id = p_user_id;

  insert into credit_transactions (
    user_id, transaction_type, amount, previous_balance, new_balance, reference_id, description
  ) values (
    p_user_id, p_type, p_amount, v_balance, v_balance + p_amount, p_reference_id, p_description
  );
end;
$$ language plpgsql;
