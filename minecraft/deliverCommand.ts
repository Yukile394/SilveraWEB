// TODO: MINECRAFT_API_CONFIG
// Bu servis, senin Minecraft sunucunda çalışan bir eklenti/plugin'in
// sağladığı bir API'ye (RCON değil, kendi güvenli HTTP endpoint'in)
// komut gönderir. RCON şifresini asla frontend'e veya bu dosyaya
// açık şekilde yazma — sadece environment variable üzerinden oku.
export async function sendMinecraftCommand(command: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${process.env.MINECRAFT_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MINECRAFT_API_SECRET}`,
      },
      body: JSON.stringify({ command }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Sunucu hata döndü: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
