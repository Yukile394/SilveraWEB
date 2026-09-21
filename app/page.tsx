import IpCopyButton from './ip-copy-button';
import OnlineCount from './components/OnlineCount';
import SocialLinks from './components/SocialLinks';
import { createAdminClient } from '@/lib/supabase';
import { SERVER_IP } from '@/lib/site';

// Bağış listeleri 60 saniyede bir yenilenir.
export const revalidate = 60;

interface DonorRow {
  total_price: number | string;
  created_at: string;
  users: { minecraft_nick: string } | { minecraft_nick: string }[] | null;
}

interface Donor {
  nick: string;
  amount: number;
}

interface DonorData {
  topAll: Donor | null;
  topMonth: Donor | null;
  recent: Donor[];
}

function nickOf(row: DonorRow): string | null {
  const u = Array.isArray(row.users) ? row.users[0] : row.users;
  return u?.minecraft_nick ?? null;
}

function pickTop(totals: Map<string, number>): Donor | null {
  let best: Donor | null = null;
  for (const [nick, amount] of Array.from(totals.entries())) {
    if (best === null || amount > best.amount) best = { nick, amount };
  }
  return best;
}

// Sadece kartla yapılmış, ödemesi tamamlanmış siparişler bağış sayılır.
async function getDonors(): Promise<DonorData> {
  const empty: DonorData = { topAll: null, topMonth: null, recent: [] };
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from('orders')
      .select('total_price, created_at, users(minecraft_nick)')
      .eq('payment_method', 'card')
      .in('status', ['paid', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error || !data) return empty;

    const rows = data as unknown as DonorRow[];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const all = new Map<string, number>();
    const month = new Map<string, number>();
    const recent: Donor[] = [];

    for (const row of rows) {
      const nick = nickOf(row);
      const amount = Number(row.total_price);
      if (!nick || !Number.isFinite(amount)) continue;

      all.set(nick, (all.get(nick) ?? 0) + amount);
      if (new Date(row.created_at).getTime() >= monthStart) {
        month.set(nick, (month.get(nick) ?? 0) + amount);
      }
      if (recent.length < 5) recent.push({ nick, amount });
    }

    return { topAll: pickTop(all), topMonth: pickTop(month), recent };
  } catch {
    return empty;
  }
}

function money(n: number): string {
  return `${n.toLocaleString('tr-TR')} ₺`;
}

function DonorCard({ donor, sub }: { donor: Donor | null; sub: 'total' | 'month' }) {
  if (!donor) {
    return <div className="donor-card donor-empty">Henüz bağış yapılmadı.</div>;
  }
  return (
    <div className="donor-card">
      <div className="donor-avatar">
        <img
          src={`https://mc-heads.net/avatar/${encodeURIComponent(donor.nick)}/64`}
          alt=""
          width={56}
          height={56}
        />
        <span className="donor-medal">1</span>
      </div>
      <div className="donor-body">
        <span className="donor-label">KULLANICI ADI</span>
        <strong className="donor-nick">{donor.nick}</strong>
        {sub === 'total' ? (
          <span className="donor-amount">{money(donor.amount)}</span>
        ) : (
          <span className="donor-month">
            Bu ay toplam <b>{money(donor.amount)}</b>
            <br />
            <b>bağışta bulundunuz.</b>
          </span>
        )}
      </div>
      <svg className="donor-heart" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 20.5s-8-4.9-8-10.7A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.7-8 10.7z" />
      </svg>
    </div>
  );
}

export default async function HomePage() {
  const donors = await getDonors();

  return (
    <main>
      <section className="shell hero">
        <div>
          <OnlineCount />
          <h1>
            Envanterini <em>Silvera Network</em>&apos;te güçlendir.
          </h1>
          <p className="hero-sub">
            Rütbelerden kitlere, kasa anahtarından krediye kadar her şey burada — satın al,
            oyunda saniyeler içinde teslim al.
          </p>
          <div className="hero-actions">
            <div className="ip-box">
              <span className="ip-box-label">Sunucu IP</span>
              <IpCopyButton ip={SERVER_IP} />
            </div>
            <a href="/magaza" className="btn btn-primary">
              Mağazaya Git
            </a>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <img src="/logo-mavi.png" alt="" className="hero-art-logo" />
        </div>
      </section>

      <div className="page home-sections">
        <h2 className="page-h2">Blog</h2>
        <div className="notice notice-err">
          <span aria-hidden="true">✕</span> Hiçbir kayıt bulunamadı!
        </div>

        <div className="donor-head">
          <h3>En iyi donör</h3>
          <span>Toplam süre</span>
        </div>
        <DonorCard donor={donors.topAll} sub="total" />

        <div className="donor-head">
          <h3>En iyi donör</h3>
          <span>Bu ay</span>
        </div>
        <DonorCard donor={donors.topMonth} sub="month" />

        <h3 className="page-h3">Son bağışlar</h3>
        <div className="donor-table">
          <div className="donor-table-head">
            <span>KULLANICI ADI</span>
            <span>MİKTAR</span>
          </div>
          {donors.recent.length === 0 ? (
            <div className="donor-table-row donor-table-empty">Henüz bağış yok.</div>
          ) : (
            donors.recent.map((d, i) => (
              <div className="donor-table-row" key={`${d.nick}-${i}`}>
                <span>{d.nick}</span>
                <span>{money(d.amount)}</span>
              </div>
            ))
          )}
        </div>

        <h3 className="page-h3">Sosyal medya</h3>
        <SocialLinks />
      </div>
    </main>
  );
}
