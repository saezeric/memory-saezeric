/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Trash2Icon, EyeIcon, Edit2Icon, PlusIcon } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

export default function UsersManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & state
  const [viewing, setViewing] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);

  // Form fields & errors
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    confirm: "",
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Load users
  const fetchUsers = () => {
    if (!token) return setLoading(false);
    setLoading(true);
    fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setUsers(j.data as User[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(fetchUsers, [token]);

  if (!user || user.role !== "admin") return null;

  const openCreate = () => {
    setModalError(null);
    setCreating(true);
    setEditing(null);
    setForm({ name: "", email: "", role: "user", password: "", confirm: "" });
  };

  const openEdit = (u: User) => {
    setModalError(null);
    setEditing(u);
    setCreating(false);
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      password: "",
      confirm: "",
    });
  };

  const onView = (u: User) => setViewing(u);
  const onRequestDelete = (u: User) => setToDelete(u);

  // Delete user
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`${API_BASE}/users/${toDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`! },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
      setToDelete(null);
    } catch (e: any) {
      setModalError(e.message || "Error al eliminar");
    }
  };

  // Save (create or edit)
  const save = async () => {
    setSaving(true);
    setModalError(null);
    try {
      let res: Response;
      if (creating) {
        // registration endpoint
        const body = {
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.confirm,
          role: form.role,
        };
        res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // update existing
        const body: Partial<User> = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        res = await fetch(`${API_BASE}/users/${editing!.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`!,
          },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al guardar");
      }
      await fetchUsers();
      setEditing(null);
      setCreating(false);
    } catch (e: any) {
      setModalError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <PlusIcon className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <p>Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">{u.name}</h2>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="mt-1 inline-block bg-blue-100 dark:bg-blue-900 text-xs px-2 py-1 rounded">
                  {u.role}
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => onView(u)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  aria-label="Ver"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openEdit(u)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  aria-label="Editar"
                >
                  <Edit2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onRequestDelete(u)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  aria-label="Eliminar"
                >
                  <Trash2Icon className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* VIEW MODAL */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Usuario #{viewing.id}</h2>
            <p>
              <strong>Nombre:</strong> {viewing.name}
            </p>
            <p>
              <strong>Email:</strong> {viewing.email}
            </p>
            <p>
              <strong>Rol:</strong> {viewing.role}
            </p>
            <button
              onClick={() => setViewing(null)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {(editing || creating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {creating ? "Crear Usuario" : `Editar Usuario #${editing!.id}`}
            </h2>
            {modalError && (
              <div className="mb-4 text-red-600">{modalError}</div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                </select>
              </div>
              {creating && (
                <>
                  <div>
                    <label className="block text-sm mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, confirm: e.target.value }))
                      }
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setCreating(false);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4">
              ¿Eliminar usuario “{toDelete.name}”?
            </h2>
            {modalError && (
              <div className="mb-4 text-red-600">{modalError}</div>
            )}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setToDelete(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
