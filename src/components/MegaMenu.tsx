"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const pillBase = "rounded-full px-4 py-2 border transition";
const pillOrange = `${pillBase} bg-orange-500 border-orange-500 text-white hover:bg-orange-600`;
const pillGreen = `${pillBase} bg-green-600 border-green-600 text-white hover:bg-green-700`;
const pillRed = `${pillBase} bg-red-600 border-red-600 text-white hover:bg-red-700`;
const pillGhost = `${pillBase} hover:bg-gray-50`;

type Prof = { id: number; name: string };
type Class = { id: number; name: string; profId: number };

interface MegaMenuProps {
  user: {
    role: "anon" | "prof" | "admin";
    prof?: { id: number; name: string };
    admin?: { id: number; name: string };
  };
}

export function MegaMenu({ user }: MegaMenuProps) {
  const [profs, setProfs] = useState<Prof[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedProf, setSelectedProf] = useState<number | "">("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showProfDropdown, setShowProfDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/public/profs")
      .then(r => r.json())
      .then(setProfs);
  }, []);

  useEffect(() => {
    if (selectedProf) {
      fetch(`/api/public/classes?profId=${selectedProf}`)
        .then(r => r.json())
        .then(setClasses);
    } else {
      setClasses([]);
    }
  }, [selectedProf]);

  const handleStudentProfSelect = (profId: number) => {
    setSelectedProf(profId);
  };

  const handleStudentClassSelect = (classId: number) => {
    window.location.href = `/student-view?profId=${selectedProf}&classId=${classId}`;
  };

  const handleProfClassSelect = (classId: number) => {
    window.location.href = `/student-view?classId=${classId}`;
  };

  const handleAdminProfSelect = (profId: number) => {
    setSelectedProf(profId);
  };

  const handleAdminClassSelect = (classId: number) => {
    window.location.href = `/student-view?profId=${selectedProf}&classId=${classId}`;
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {/* Vue Élève - Always visible */}
        <div className="relative">
          <button
            className={`${pillOrange} font-semibold`}
            onMouseEnter={() => setShowStudentDropdown(true)}
            onMouseLeave={() => setShowStudentDropdown(false)}
          >
            Vue Élève
          </button>
          {showStudentDropdown && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-64"
              onMouseEnter={() => setShowStudentDropdown(true)}
              onMouseLeave={() => setShowStudentDropdown(false)}
            >
              <div className="p-3">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Choisir un professeur :</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={selectedProf}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStudentProfSelect(Number(e.target.value))}
                  >
                    <option value="">— Sélectionner —</option>
                    {profs.map((p: Prof) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {selectedProf && classes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Choisir une classe :</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStudentClassSelect(Number(e.target.value))}
                    >
                      <option value="">— Sélectionner —</option>
                      {classes.map((c: Class) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vue Professeur */}
        {user.role === "prof" && (
          <div className="relative">
            <button
              className={pillGreen}
              onMouseEnter={() => setShowProfDropdown(true)}
              onMouseLeave={() => setShowProfDropdown(false)}
            >
              Vue Élève
            </button>
            {showProfDropdown && (
              <div
                className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-64"
                onMouseEnter={() => setShowProfDropdown(true)}
                onMouseLeave={() => setShowProfDropdown(false)}
              >
                <div className="p-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mes classes :</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProfClassSelect(Number(e.target.value))}
                    >
                      <option value="">— Sélectionner une classe —</option>
                      {classes.map((c: Class) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vue Administrateur */}
        {user.role === "admin" && (
          <>
            {/* Gérer Compte Admin (par défaut) */}
            <Link href="/admin" className={`${pillGhost} hover:bg-gray-200 active:bg-gray-300 transition-colors`}>
              Gérer Compte Admin
            </Link>
            
            {/* Vue Élève avec dropdown de tous les profs */}
            <div className="relative">
              <button
                className={`${pillBase} bg-blue-500 border-blue-500 text-white hover:bg-blue-600`}
                onMouseEnter={() => setShowAdminDropdown(true)}
                onMouseLeave={() => setShowAdminDropdown(false)}
              >
                Vue Élève
              </button>
              {showAdminDropdown && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-64"
                  onMouseEnter={() => setShowAdminDropdown(true)}
                  onMouseLeave={() => setShowAdminDropdown(false)}
                >
                  <div className="p-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tous les professeurs :</label>
                      <select
                        className="w-full border rounded px-2 py-1 text-sm mb-2"
                        value={selectedProf}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAdminProfSelect(Number(e.target.value))}
                      >
                        <option value="">— Sélectionner un prof —</option>
                        {profs.map((p: Prof) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {selectedProf && classes.length > 0 && (
                        <select
                          className="w-full border rounded px-2 py-1 text-sm"
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAdminClassSelect(Number(e.target.value))}
                        >
                          <option value="">— Sélectionner une classe —</option>
                          {classes.map((c: Class) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Connexion / Inscription (public) */}
        {user.role === "anon" && (
          <Link href="/login" className={`${pillGreen} hover:bg-green-700 active:bg-green-800 transition-colors`}>
            Connexion / Inscription
          </Link>
        )}
        
        {/* Déconnexion */}
        {user.role !== "anon" && (
          <form action="/api/auth/logout" method="post">
            <button className={`${pillRed} hover:bg-red-700 active:bg-red-800 transition-colors`} title="Se déconnecter">
              Déconnexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
