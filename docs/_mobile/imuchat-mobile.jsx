import { useState } from "react";

const tabs = [
  { id: "home", label: "Home", icon: "⊞" },
  { id: "chats", label: "Chats", icon: "💬" },
  { id: "social", label: "Social", icon: "◎" },
  { id: "watch", label: "Watch", icon: "▶" },
  { id: "store", label: "Store", icon: "⊠" },
  { id: "profile", label: "Profile", icon: "◉" },
];

// ─── HOME ────────────────────────────────────────────────────────────────────
function HomeTab() {
  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto" style={{ background: "#0a0a0f" }}>
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#1a1a2e", border: "1px solid #2a2a4a" }}>
          <span style={{ color: "#5555aa" }}>🔍</span>
          <span style={{ color: "#5555aa", fontSize: 13 }}>Rechercher dans ImuChat…</span>
        </div>
      </div>

      {/* Quick Access Icons */}
      <div className="px-4 py-2">
        <p style={{ color: "#888", fontSize: 11, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Accès rapide</p>
        <div className="flex justify-between">
          {[
            { icon: "💸", label: "Paiement" },
            { icon: "🎟", label: "Billets" },
            { icon: "🛵", label: "Livraison" },
            { icon: "✈️", label: "Voyage" },
            { icon: "🏥", label: "Santé" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: "#1a1a2e", fontSize: 20 }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 10, color: "#aaa" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="mx-4 my-2 rounded-2xl overflow-hidden relative" style={{ height: 120, background: "linear-gradient(135deg, #6c3bff 0%, #ff3b8f 100%)" }}>
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          <p style={{ color: "white", fontWeight: 700, fontSize: 16 }}>ImuPay actif 🎉</p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>Envoyez de l'argent instantanément</p>
          <div className="mt-2 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", width: "fit-content" }}>
            <span style={{ color: "white", fontSize: 11 }}>Essayer →</span>
          </div>
        </div>
        <div style={{ position: "absolute", right: 16, bottom: 16, fontSize: 48, opacity: 0.3 }}>💳</div>
      </div>

      {/* Stories / contacts actifs */}
      <div className="px-4 py-2">
        <p style={{ color: "#888", fontSize: 11, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Amis actifs</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {["Amara", "Kofi", "Yasmine", "David", "Lena", "Issa"].map((name, i) => (
            <div key={name} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative">
                <div className="rounded-full flex items-center justify-center" style={{ width: 46, height: 46, background: `hsl(${i * 55}, 60%, 40%)`, fontSize: 18 }}>
                  {name[0]}
                </div>
                <div className="absolute rounded-full" style={{ width: 12, height: 12, background: "#22ee88", border: "2px solid #0a0a0f", bottom: 0, right: 0 }} />
              </div>
              <span style={{ fontSize: 10, color: "#aaa" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed suggestions */}
      <div className="px-4 py-2">
        <p style={{ color: "#888", fontSize: 11, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Pour vous</p>
        {[
          { user: "Amara K.", time: "2 min", content: "Nouveau post dans Social 📸", type: "social" },
          { user: "ImuStore", time: "1h", content: "Flash sale -30% sur l'électronique ⚡", type: "store" },
          { user: "ImuWatch", time: "3h", content: "Trending: Le match d'hier soir 🏆", type: "watch" },
        ].map((item) => (
          <div key={item.user} className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{ background: "#141428" }}>
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: "#2a2a4a", fontSize: 16 }}>
              {item.user[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 12, color: "#ccc", fontWeight: 600 }}>{item.user}</span>
                <span style={{ fontSize: 10, color: "#555" }}>{item.time}</span>
              </div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHATS ───────────────────────────────────────────────────────────────────
function ChatsTab() {
  const convos = [
    { name: "Amara K.", msg: "On se voit demain? 😊", time: "14:32", unread: 3, online: true },
    { name: "Groupe Famille 🏠", msg: "Maman: N'oubliez pas ce soir!", time: "13:10", unread: 7, online: false },
    { name: "Kofi D.", msg: "Tu as vu le match? 🔥", time: "11:45", unread: 0, online: true },
    { name: "Yasmine L.", msg: "📸 Photo", time: "hier", unread: 0, online: false },
    { name: "Collègues Work", msg: "David: Réunion à 15h", time: "lun", unread: 2, online: false },
    { name: "ImuBot 🤖", msg: "Votre colis est arrivé!", time: "dim", unread: 1, online: true },
  ];
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "#0a0a0f" }}>
      {/* Tabs interne */}
      <div className="flex gap-0 px-4 pt-4 pb-2">
        {["Tous", "Non lus", "Groupes", "Bots"].map((t, i) => (
          <div key={t} className="px-3 py-1 rounded-full mr-2" style={{ background: i === 0 ? "#6c3bff" : "#1a1a2e", fontSize: 12, color: i === 0 ? "white" : "#888" }}>
            {t}
          </div>
        ))}
      </div>
      {convos.map((c) => (
        <div key={c.name} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid #111120" }}>
          <div className="relative flex-shrink-0">
            <div className="rounded-full flex items-center justify-center" style={{ width: 46, height: 46, background: "#1a1a3e", fontSize: 18 }}>
              {c.name[0]}
            </div>
            {c.online && <div className="absolute rounded-full" style={{ width: 11, height: 11, background: "#22ee88", border: "2px solid #0a0a0f", bottom: 0, right: 0 }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <span style={{ fontSize: 14, color: "#eee", fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: c.unread > 0 ? "#6c3bff" : "#444" }}>{c.time}</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{c.msg}</span>
              {c.unread > 0 && (
                <span className="rounded-full flex items-center justify-center" style={{ minWidth: 18, height: 18, background: "#6c3bff", fontSize: 10, color: "white", padding: "0 4px" }}>{c.unread}</span>
              )}
            </div>
          </div>
        </div>
      ))}
      {/* FAB */}
      <div className="absolute" style={{ bottom: 72, right: 16, width: 48, height: 48, background: "#6c3bff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 20px rgba(108,59,255,0.5)" }}>✏️</div>
    </div>
  );
}

// ─── SOCIAL ──────────────────────────────────────────────────────────────────
function SocialTab() {
  const posts = [
    { user: "Amara K.", handle: "@amara_k", time: "2h", content: "Belle journée au bord de la mer 🌊☀️ Rien de tel pour se ressourcer!", likes: 142, comments: 18, img: true, color: "#1a3a5c" },
    { user: "Kofi D.", handle: "@kofidev", time: "5h", content: "Mon nouveau projet open source est live! Lien dans la bio 🚀", likes: 89, comments: 34, img: false, color: null },
    { user: "Yasmine L.", handle: "@yaz_lux", time: "8h", content: "Premier essai du nouveau filtre ImuLens 👁️✨ Incroyable!", likes: 310, comments: 52, img: true, color: "#3a1a4a" },
  ];
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "#0a0a0f" }}>
      {/* Story row */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="rounded-full flex items-center justify-center" style={{ width: 54, height: 54, background: "#1a1a2e", border: "2px dashed #6c3bff", fontSize: 22 }}>+</div>
            <span style={{ fontSize: 10, color: "#888" }}>Votre story</span>
          </div>
          {["Amara", "Kofi", "Issa", "Lena", "David", "Bot"].map((n, i) => (
            <div key={n} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="rounded-full flex items-center justify-center" style={{ width: 54, height: 54, background: `hsl(${i * 55}, 60%, 35%)`, border: "2px solid #6c3bff", fontSize: 20 }}>{n[0]}</div>
              <span style={{ fontSize: 10, color: "#888" }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Posts */}
      {posts.map((p) => (
        <div key={p.user} className="mb-1" style={{ borderBottom: "1px solid #111120" }}>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: "#1a1a3e", fontSize: 15 }}>{p.user[0]}</div>
            <div>
              <p style={{ fontSize: 13, color: "#ddd", fontWeight: 600 }}>{p.user}</p>
              <p style={{ fontSize: 11, color: "#555" }}>{p.handle} · {p.time}</p>
            </div>
            <span style={{ marginLeft: "auto", color: "#444", fontSize: 18 }}>⋯</span>
          </div>
          {p.img && <div className="mx-0" style={{ height: 180, background: `linear-gradient(135deg, ${p.color} 0%, #0a0a0f 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: 0.85 }}>🌄</div>}
          <div className="px-4 py-2">
            <p style={{ fontSize: 13, color: "#ccc" }}>{p.content}</p>
            <div className="flex gap-5 mt-3">
              <span style={{ fontSize: 13, color: "#666" }}>❤️ {p.likes}</span>
              <span style={{ fontSize: 13, color: "#666" }}>💬 {p.comments}</span>
              <span style={{ fontSize: 13, color: "#666" }}>🔁 Partager</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── WATCH ───────────────────────────────────────────────────────────────────
function WatchTab() {
  const videos = [
    { title: "Top 10 buts de la semaine ⚽", channel: "ImuSport", views: "1.2M", dur: "12:34", color: "#1a3a1a" },
    { title: "Recette: Thiéboudienne en 20 min 🍛", channel: "ImuCook", views: "340K", dur: "22:10", color: "#3a2a1a" },
    { title: "Les 5 tendances tech 2025 🤖", channel: "ImuTech", views: "890K", dur: "8:45", color: "#1a1a3a" },
    { title: "Vlog: Abidjan by night 🌃", channel: "YazLux", views: "210K", dur: "18:22", color: "#3a1a3a" },
  ];
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "#0a0a0f" }}>
      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto">
        {["🔥 Trending", "⚽ Sport", "🎵 Musique", "🍳 Cuisine", "🎮 Gaming", "📰 Actu"].map((cat, i) => (
          <span key={cat} className="flex-shrink-0 px-3 py-1 rounded-full text-xs" style={{ background: i === 0 ? "#ff3b8f" : "#1a1a2e", color: i === 0 ? "white" : "#888" }}>{cat}</span>
        ))}
      </div>
      <div className="px-4 grid grid-cols-2 gap-3 pb-4">
        {videos.map((v) => (
          <div key={v.title} className="rounded-xl overflow-hidden" style={{ background: "#141428" }}>
            <div className="flex items-center justify-center relative" style={{ height: 85, background: `linear-gradient(135deg, ${v.color} 0%, #0a0a0f 100%)` }}>
              <span style={{ fontSize: 32, opacity: 0.8 }}>▶</span>
              <span className="absolute bottom-1 right-2" style={{ fontSize: 10, color: "white", background: "rgba(0,0,0,0.7)", padding: "1px 4px", borderRadius: 3 }}>{v.dur}</span>
            </div>
            <div className="p-2">
              <p style={{ fontSize: 11, color: "#ddd", fontWeight: 600, lineHeight: 1.3 }}>{v.title}</p>
              <p style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{v.channel} · {v.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STORE ───────────────────────────────────────────────────────────────────
function StoreTab() {
  const products = [
    { name: "Écouteurs Sans Fil Pro", price: "29 900 F", old: "45 000 F", emoji: "🎧", tag: "-30%" },
    { name: "Sneakers Urban Flow", price: "18 500 F", old: null, emoji: "👟", tag: "Nouveau" },
    { name: "Sac cuir vegan", price: "12 000 F", old: "15 000 F", emoji: "👜", tag: "-20%" },
    { name: "Montre connectée X2", price: "55 000 F", old: null, emoji: "⌚", tag: "Top vente" },
  ];
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "#0a0a0f" }}>
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#1a1a2e", border: "1px solid #2a2a4a" }}>
          <span style={{ color: "#5555aa" }}>🔍</span>
          <span style={{ color: "#5555aa", fontSize: 13 }}>Chercher un produit…</span>
          <span className="ml-auto" style={{ color: "#6c3bff", fontSize: 13 }}>🎛</span>
        </div>
      </div>
      {/* Categories */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
        {["Tous", "Mode", "Tech", "Maison", "Beauté", "Alimentaire"].map((cat, i) => (
          <span key={cat} className="flex-shrink-0 px-3 py-1 rounded-full text-xs" style={{ background: i === 0 ? "#6c3bff" : "#1a1a2e", color: i === 0 ? "white" : "#888" }}>{cat}</span>
        ))}
      </div>
      {/* Flash banner */}
      <div className="mx-4 mb-3 px-4 py-2 rounded-xl flex items-center gap-3" style={{ background: "linear-gradient(90deg, #ff3b8f22 0%, #6c3bff22 100%)", border: "1px solid #ff3b8f44" }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div>
          <p style={{ fontSize: 12, color: "#ff3b8f", fontWeight: 700 }}>Flash Sale — 2h restantes</p>
          <p style={{ fontSize: 11, color: "#888" }}>Jusqu'à -50% sur la tech</p>
        </div>
      </div>
      {/* Products grid */}
      <div className="px-4 grid grid-cols-2 gap-3 pb-4">
        {products.map((p) => (
          <div key={p.name} className="rounded-xl overflow-hidden" style={{ background: "#141428" }}>
            <div className="flex items-center justify-center relative" style={{ height: 90, background: "#1a1a2e", fontSize: 40 }}>
              {p.emoji}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full" style={{ background: p.tag.startsWith("-") ? "#ff3b8f" : "#6c3bff", fontSize: 9, color: "white" }}>{p.tag}</span>
            </div>
            <div className="p-2">
              <p style={{ fontSize: 11, color: "#ddd", fontWeight: 600 }}>{p.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ fontSize: 12, color: "#6c3bff", fontWeight: 700 }}>{p.price}</span>
                {p.old && <span style={{ fontSize: 10, color: "#444", textDecoration: "line-through" }}>{p.old}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileTab() {
  const sections = [
    { title: "Compte & Sécurité", items: ["Modifier le profil", "Mot de passe", "Authentification 2FA", "Appareils connectés"] },
    { title: "ImuPay & Finances", items: ["Portefeuille ImuPay", "Historique des transactions", "Cartes liées", "Recharger"] },
    { title: "Confidentialité", items: ["Qui peut me voir", "Blocages & restrictions", "Données & permissions"] },
    { title: "Apparence", items: ["Thème sombre / clair", "Taille des polices", "Langue"] },
    { title: "Aide & Support", items: ["FAQ", "Signaler un problème", "À propos d'ImuChat"] },
  ];
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "#0a0a0f" }}>
      {/* Avatar & infos */}
      <div className="flex flex-col items-center py-5" style={{ background: "linear-gradient(180deg, #0d0d1f 0%, #0a0a0f 100%)" }}>
        <div className="relative mb-2">
          <div className="rounded-full flex items-center justify-center" style={{ width: 72, height: 72, background: "linear-gradient(135deg, #6c3bff, #ff3b8f)", fontSize: 30 }}>U</div>
          <div className="absolute rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: "#6c3bff", border: "2px solid #0a0a0f", bottom: 0, right: 0, fontSize: 12 }}>✏️</div>
        </div>
        <p style={{ color: "white", fontWeight: 700, fontSize: 17 }}>Utilisateur ImuChat</p>
        <p style={{ color: "#888", fontSize: 12 }}>@user_imuchat · Abidjan 🇨🇮</p>
        {/* Stats */}
        <div className="flex gap-8 mt-3">
          {[["248", "Amis"], ["1.4K", "Abonnés"], ["89", "Posts"]].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center">
              <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{val}</span>
              <span style={{ color: "#666", fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
        {/* ImuPay Badge */}
        <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: "#1a1a2e", border: "1px solid #2a2a4a" }}>
          <span style={{ fontSize: 14 }}>💳</span>
          <span style={{ fontSize: 12, color: "#aaa" }}>ImuPay — <span style={{ color: "#22ee88", fontWeight: 700 }}>Actif</span></span>
        </div>
      </div>
      {/* Settings sections */}
      <div className="px-4 py-2">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-4">
            <p style={{ color: "#555", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{sec.title}</p>
            <div className="rounded-xl overflow-hidden" style={{ background: "#141428" }}>
              {sec.items.map((item, i) => (
                <div key={item} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < sec.items.length - 1 ? "1px solid #1a1a2e" : "none" }}>
                  <span style={{ fontSize: 13, color: "#ccc" }}>{item}</span>
                  <span style={{ color: "#444", fontSize: 14 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-2 mb-6 flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: "#1a0a0a", border: "1px solid #3a1a1a" }}>
          <span style={{ fontSize: 16 }}>🚪</span>
          <span style={{ color: "#ff4444", fontSize: 14 }}>Déconnexion</span>
        </div>
      </div>
    </div>
  );
}

const tabContent = {
  home: <HomeTab />,
  chats: <ChatsTab />,
  social: <SocialTab />,
  watch: <WatchTab />,
  store: <StoreTab />,
  profile: <ProfileTab />,
};

export default function ImuChatMobile() {
  const [active, setActive] = useState("home");

  const headerTitles = {
    home: { title: "ImuChat", sub: "Bonjour 👋" },
    chats: { title: "Messages", sub: "12 non lus" },
    social: { title: "Social", sub: "Fil d'actualité" },
    watch: { title: "Watch", sub: "Trending aujourd'hui" },
    store: { title: "Store", sub: "Flash Sale active ⚡" },
    profile: { title: "Mon profil", sub: "Paramètres & compte" },
  };

  const h = headerTitles[active];

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#05050d", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Phone shell */}
      <div className="relative flex flex-col overflow-hidden"
        style={{ width: 360, height: 740, background: "#0a0a0f", borderRadius: 44, boxShadow: "0 0 0 8px #1a1a2e, 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(108,59,255,0.15)" }}>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ width: 120, height: 28, background: "#0a0a0f", borderRadius: "0 0 20px 20px" }} />

        {/* Status bar */}
        <div className="flex justify-between px-8 pt-3 pb-1 z-10" style={{ fontSize: 11, color: "#666" }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 1 }}>●●●●  WiFi  🔋</span>
        </div>

        {/* App Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #111120" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", lineHeight: 1 }}>
              <span style={{ background: "linear-gradient(90deg, #6c3bff, #ff3b8f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Imu</span>
              <span style={{ color: "white" }}>Chat</span>
            </h1>
            <p style={{ fontSize: 11, color: "#555", marginTop: 1 }}>{h.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: "#1a1a2e", fontSize: 16 }}>🔔</div>
            <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: "linear-gradient(135deg, #6c3bff, #ff3b8f)", fontSize: 15 }}>U</div>
          </div>
        </div>

        {/* Tab label */}
        <div className="px-5 py-1.5" style={{ background: "#0d0d1a" }}>
          <span style={{ fontSize: 12, color: "#6c3bff", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{h.title}</span>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {tabContent[active]}
        </div>

        {/* Bottom Tab Bar */}
        <div className="flex justify-around items-center px-2 pt-2 pb-3 relative z-10"
          style={{ background: "#0d0d1a", borderTop: "1px solid #1a1a2e" }}>
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
                style={{
                  background: isActive ? "rgba(108,59,255,0.15)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  minWidth: 48,
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, filter: isActive ? "none" : "grayscale(1) brightness(0.4)" }}>
                  {tab.icon}
                </span>
                <span style={{
                  fontSize: 9,
                  color: isActive ? "#6c3bff" : "#444",
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: 0.3,
                }}>
                  {tab.label}
                </span>
                {isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#6c3bff", marginTop: 1 }} />}
              </button>
            );
          })}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2" style={{ background: "#0d0d1a" }}>
          <div style={{ width: 120, height: 4, background: "#2a2a4a", borderRadius: 2 }} />
        </div>
      </div>

      {/* Legend panel */}
      <div className="ml-8 flex flex-col gap-2" style={{ maxWidth: 200 }}>
        <p style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Onglets</p>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-left"
            style={{
              background: active === tab.id ? "rgba(108,59,255,0.2)" : "#111118",
              border: `1px solid ${active === tab.id ? "#6c3bff" : "#1a1a2e"}`,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ fontSize: 13, color: active === tab.id ? "#9988ff" : "#666", fontWeight: active === tab.id ? 700 : 400 }}>{tab.label}</span>
          </button>
        ))}
        <p style={{ color: "#333", fontSize: 10, marginTop: 8 }}>← Cliquez pour naviguer</p>
      </div>
    </div>
  );
}
