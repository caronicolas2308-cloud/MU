"use client";
import { useEffect, useState } from "react";

type Klass = { id: number; name: string };
type Prof = { id: number; name: string; classes: Klass[] };
type Settings = { id: number; maxProfs: number; maxClassesPerProf: number };

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [profs, setProfs] = useState<Prof[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [adminName, setAdminName] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/overview", { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      setProfs(j.profs || []);
      setSettings(j.settings || null);
      setAdminName(j.admin?.name || "");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function renameProf(id: number, name: string) {
    const res = await fetch(`/api/admin/profs/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (!res.ok) alert("Échec renommage prof");
    await load();
  }

  async function deleteProf(id: number) {
    if (!confirm("Supprimer ce professeur (et toutes ses classes) ?")) return;
    const res = await fetch(`/api/admin/profs/${id}`, { method: "DELETE" });
    if (!res.ok) alert("Échec suppression prof");
    await load();
  }

  async function renameClass(id: number, name: string) {
    const res = await fetch(`/api/admin/classes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (!res.ok) alert("Échec renommage classe");
    await load();
  }

  async function deleteClass(id: number) {
    if (!confirm("Supprimer cette classe ?")) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    if (!res.ok) alert("Échec suppression classe");
    await load();
  }

  async function saveSettings(patch: Partial<{maxProfs:number;maxClassesPerProf:number;signupSesame:string}>) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) alert("Échec sauvegarde paramètres");
    await load();
  }

  async function saveAdminName() {
    const res = await fetch("/api/admin/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: adminName })
    });
    if (!res.ok) alert("Échec modif nom admin");
    await load();
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Espace Admin</h1>

      {/* Paramètres admin */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-black">Profil Admin</h2>
        <div className="flex gap-2">
          <input value={adminName} onChange={(e)=>setAdminName(e.target.value)}
            className="rounded border px-3 py-2 bg-white text-black border-gray-300" placeholder="Nom admin" />
          <button onClick={saveAdminName} className="rounded px-4 py-2 bg-black text-white hover:bg-green-600 transition-colors">
            Enregistrer
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-black border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-white">Paramètres</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-white">Max profs</label>
          <input type="number" defaultValue={settings?.maxProfs ?? 10}
            onBlur={(e)=>saveSettings({ maxProfs: Number(e.currentTarget.value) })}
            className="w-24 rounded border px-3 py-2 bg-white text-black border-gray-300" />
          <label className="text-sm text-white">Max classes/prof</label>
          <input type="number" defaultValue={settings?.maxClassesPerProf ?? 10}
            onBlur={(e)=>saveSettings({ maxClassesPerProf: Number(e.currentTarget.value) })}
            className="w-28 rounded border px-3 py-2 bg-white text-black border-gray-300" />
          <input placeholder="Nouveau sésame (facultatif)"
            className="rounded border px-3 py-2 bg-white text-black border-gray-300"
            onKeyDown={async (e)=>{
              if (e.key==="Enter") {
                await saveSettings({ signupSesame: (e.target as HTMLInputElement).value });
                (e.target as HTMLInputElement).value = "";
              }
            }} />
          <button 
            onClick={async (e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input.value) {
                await saveSettings({ signupSesame: input.value });
                input.value = "";
              }
            }}
            className="rounded px-4 py-2 bg-black text-white hover:bg-green-600 transition-colors"
          >
            Valider le sésame
          </button>
          <span className="text-xs text-gray-300">Entrée pour valider le sésame</span>
        </div>
      </div>

      {/* Profs + classes */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3 text-black">Professeurs</h2>
        {profs.length === 0 ? (
          <p className="text-gray-600">Aucun professeur.</p>
        ) : (
          <ul className="grid gap-3">
            {profs.map(p => (
              <li key={p.id} className="bg-black border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    defaultValue={p.name}
                    className="rounded border px-3 py-2 bg-white text-black border-gray-300"
                    onBlur={(e)=>{ const v=e.currentTarget.value; if(v && v!==p.name) renameProf(p.id, v); }}
                  />
                  <button onClick={()=>deleteProf(p.id)} className="rounded px-3 py-2 bg-red-500 text-white hover:bg-green-600 transition-colors">
                    Supprimer ce prof
                  </button>
                </div>

                {p.classes.length>0 && (
                  <ul className="pl-4 grid gap-2">
                    {p.classes.map(c => (
                      <li key={c.id} className="flex items-center gap-2">
                        <input
                          defaultValue={c.name}
                          className="rounded border px-3 py-2 bg-white text-black border-gray-300"
                          onBlur={(e)=>{ const v=e.currentTarget.value; if(v && v!==c.name) renameClass(c.id, v); }}
                        />
                        <button onClick={()=>deleteClass(c.id)} className="rounded px-3 py-2 bg-red-500 text-white hover:bg-green-600 transition-colors">
                          Supprimer cette classe
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}