/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/user/categories/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Trash2Icon, Edit2Icon, EyeIcon, PlusIcon } from "lucide-react";

interface CategoryType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  cards: any[];
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

export default function UserCategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Redirigir si no está logueado
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");

  const [detailCategory, setDetailCategory] = useState<CategoryType | null>(
    null
  );

  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null
  );
  const [editName, setEditName] = useState("");

  const [deletingCategory, setDeletingCategory] = useState<CategoryType | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (Array.isArray(json)) {
        setCategories(json);
      } else if (Array.isArray(json.data)) {
        setCategories(json.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewName("");
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al crear categoría");
      }
      setShowCreateModal(false);
      fetchCategories();
    } catch (err: any) {
      alert("No se pudo crear la categoría: " + err.message);
    }
  };

  const openDetail = (cat: CategoryType) => {
    setDetailCategory(cat);
    setEditingCategory(null);
    setDeletingCategory(null);
    setShowDeleteConfirm(false);
  };

  const closeAllModals = () => {
    setShowCreateModal(false);
    setDetailCategory(null);
    setEditingCategory(null);
    setDeletingCategory(null);
    setShowDeleteConfirm(false);
  };

  const openEdit = (cat: CategoryType) => {
    setEditingCategory(cat);
    setDetailCategory(null);
    setDeletingCategory(null);
    setShowDeleteConfirm(false);
    setEditName(cat.name);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editName.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al editar categoría");
      }
      closeAllModals();
      fetchCategories();
    } catch (err: any) {
      alert("No se pudo editar la categoría: " + err.message);
    }
  };

  const openDeleteConfirm = (cat: CategoryType) => {
    setDeletingCategory(cat);
    setDetailCategory(null);
    setEditingCategory(null);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      const res = await fetch(`${API_BASE}/categories/${deletingCategory.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`! },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar categoría");
      }
      closeAllModals();
      fetchCategories();
    } catch (err: any) {
      alert("No se pudo eliminar la categoría: " + err.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Título + Botón “Nueva Carta” */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Cartas</h1>
        {user && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Carta
          </button>
        )}
      </div>

      {loading ? (
        <p>Cargando categorías…</p>
      ) : categories.length === 0 ? (
        <p>No hay categorías para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">{cat.name}</h2>
                <p className="text-sm text-gray-500 mt-1">ID: {cat.id}</p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => openDetail(cat)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label={`Ver detalles de ${cat.name}`}
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openEdit(cat)}
                  className="text-yellow-500 hover:text-yellow-700"
                  aria-label={`Editar ${cat.name}`}
                >
                  <Edit2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openDeleteConfirm(cat)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Eliminar ${cat.name}`}
                >
                  <Trash2Icon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Crear Nueva Categoría</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailCategory && !editingCategory && !showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">{detailCategory.name}</h3>
              <button
                onClick={closeAllModals}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <p>
                <strong>ID:</strong> {detailCategory.id}
              </p>
              <p>
                <strong>Creado:</strong>{" "}
                {new Date(detailCategory.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Actualizado:</strong>{" "}
                {new Date(detailCategory.updated_at).toLocaleString()}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">
              Editar Categoría #{editingCategory.id}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <p className="text-lg mb-6">
              ¿Estás seguro de eliminar la categoría "{deletingCategory.name}"?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingCategory(null);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
