/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/cards/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PlusIcon, Edit2Icon, Trash2Icon } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface CardType {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

export default function UserCardsPage() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Vista activa: "my" | "public" | "category"
  const [view, setView] = useState<"my" | "public" | "category">("public");

  // Categorías para el select
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  // Array de cartas y estado de carga
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal de creación
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formIsPrivate, setFormIsPrivate] = useState<boolean>(false);

  // Modal de detalle / edición / confirmación
  const [detailCard, setDetailCard] = useState<CardType | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Campos para editar
  const [editName, setEditName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | "">("");
  const [editIsPrivate, setEditIsPrivate] = useState<boolean>(false);

  // 1) Cargar categorías al montar
  useEffect(() => {
    fetch(`${API_BASE}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        let raw: any[] = [];
        if (Array.isArray(json)) raw = json;
        else if (Array.isArray(json.data)) raw = json.data;
        const list: Category[] = raw.map((c) => ({
          id: c.id,
          name: c.name,
        }));
        setCategories(list);
      })
      .catch(console.error);
  }, [token]);

  // 2) Cargar cartas según vista y categoría (sin paginación)
  useEffect(() => {
    let url = "";
    if (view === "my") {
      url = `${API_BASE}/my-cards`;
    } else if (view === "public") {
      url = `${API_BASE}/public-cards`;
    } else if (view === "category") {
      if (selectedCategory === "") {
        setCards([]);
        return;
      }
      url = `${API_BASE}/cards/category/${selectedCategory}`;
    }

    if (!url) {
      setCards([]);
      return;
    }

    setLoading(true);
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        const rawCards: any[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        const list: CardType[] = rawCards.map((c: any) => ({
          id: c.id,
          name: c.name,
          image_url: c.image_url,
          category_id: c.category_id,
          user_id: c.user_id,
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));
        setCards(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [view, selectedCategory, token]);

  // Cambiar vista: limpiar categoría y cerrar modales
  const changeView = (newView: "my" | "public" | "category") => {
    setView(newView);
    setSelectedCategory("");
    setDetailCard(null);
    setEditingCard(null);
    setShowDeleteConfirm(false);
  };

  // Abrir modal de creación
  const openCreateModal = () => {
    setFormName("");
    setFormImageUrl("");
    setFormCategoryId("");
    setFormIsPrivate(false);
    setShowCreateModal(true);
  };

  // Enviar formulario de creación
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formImageUrl.trim() || formCategoryId === "") {
      alert("Todos los campos obligatorios deben rellenarse.");
      return;
    }
    let payloadUserId: number | null = null;
    if (formIsPrivate) payloadUserId = user!.id;
    else payloadUserId = null;

    const body = {
      name: formName.trim(),
      image_url: formImageUrl.trim(),
      category_id: Number(formCategoryId),
      user_id: payloadUserId,
    };

    try {
      const res = await fetch(`${API_BASE}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al crear la carta");
      }
      const json = await res.json();
      const newCard: CardType = {
        id: json.data.id,
        name: json.data.name,
        image_url: json.data.image_url,
        category_id: json.data.category_id,
        user_id: json.data.user_id,
        created_at: json.data.created_at,
        updated_at: json.data.updated_at,
      };

      // Insertar la nueva carta en el estado si estamos en "my"
      if (view === "my") {
        setCards((prev) => [newCard, ...prev]);
      }
      // Si la vista actual es “category” y la categoría coincide, agregar
      if (
        view === "category" &&
        newCard.category_id === Number(selectedCategory)
      ) {
        setCards((prev) => [newCard, ...prev]);
      }

      setShowCreateModal(false);
    } catch (err: any) {
      console.error(err);
      alert("No se pudo crear la carta: " + err.message);
    }
  };

  // Abrir detalle de una carta
  const openDetail = (card: CardType) => {
    setDetailCard(card);
    setEditingCard(null);
    setShowDeleteConfirm(false);
    // Prellenar campos para posible edición
    setEditName(card.name);
    setEditImageUrl(card.image_url);
    setEditCategoryId(card.category_id);
    setEditIsPrivate(card.user_id !== null);
  };

  // Iniciar edición desde el detalle
  const startEditing = () => {
    if (!detailCard) return;
    setEditingCard(detailCard);
  };

  // Guardar edición
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    if (!editName.trim() || !editImageUrl.trim() || editCategoryId === "") {
      alert("Todos los campos obligatorios deben rellenarse.");
      return;
    }
    let payloadUserId: number | null = null;
    if (editIsPrivate) payloadUserId = user!.id;
    else payloadUserId = null;

    const body = {
      name: editName.trim(),
      image_url: editImageUrl.trim(),
      category_id: Number(editCategoryId),
      user_id: payloadUserId,
    };

    try {
      const res = await fetch(`${API_BASE}/cards/${editingCard.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al editar la carta");
      }
      const json = await res.json();
      const updated: CardType = {
        id: json.data.id,
        name: json.data.name,
        image_url: json.data.image_url,
        category_id: json.data.category_id,
        user_id: json.data.user_id,
        created_at: json.data.created_at,
        updated_at: json.data.updated_at,
      };

      // Actualizar localmente
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setDetailCard(null);
      setEditingCard(null);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error(err);
      alert("No se pudo editar la carta: " + err.message);
    }
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Eliminar carta
  const handleDelete = async () => {
    if (!detailCard) return;
    try {
      const res = await fetch(`${API_BASE}/cards/${detailCard.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`! },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar la carta");
      }
      // Quitar de lista local
      setCards((prev) => prev.filter((c) => c.id !== detailCard.id));
      setDetailCard(null);
      setShowDeleteConfirm(false);
      setEditingCard(null);
    } catch (err: any) {
      console.error(err);
      alert("No se pudo eliminar la carta: " + err.message);
    }
  };

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

      {/* Menú de vista */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-w-xl mx-auto">
        <button
          className={`w-full px-4 py-2 rounded ${
            view === "my"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => changeView("my")}
        >
          Mis Cartas
        </button>
        <button
          className={`w-full px-4 py-2 rounded ${
            view === "public"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => changeView("public")}
        >
          Públicas
        </button>
        <button
          className={`w-full px-4 py-2 rounded ${
            view === "category"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => changeView("category")}
        >
          Por Categoría
        </button>
      </div>

      {/* Select de Categoría (solo si view === "category") */}
      {view === "category" && (
        <div className="flex justify-center mb-6">
          <select
            className="px-3 py-2 border rounded w-full max-w-xs"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          >
            <option value="">— Selecciona categoría —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Listado de cartas */}
      {loading ? (
        <p>Cargando cartas…</p>
      ) : cards.length === 0 ? (
        <p>No hay cartas para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow flex flex-col cursor-pointer hover:shadow-lg transition"
              onClick={() => openDetail(card)}
            >
              <img
                src={card.image_url}
                alt={card.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold">{card.name}</h2>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======== MODAL DE CREACIÓN DE CARTA ======== */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Crear Nueva Carta</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL de la imagen
                </label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoría
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={formCategoryId}
                  onChange={(e) =>
                    setFormCategoryId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                >
                  <option value="">— Selecciona categoría —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Visibilidad
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={formIsPrivate ? "private" : "public"}
                  onChange={(e) =>
                    setFormIsPrivate(e.target.value === "private")
                  }
                >
                  <option value="public">Pública</option>
                  <option value="private">Privada</option>
                </select>
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

      {/* ======== MODAL DE DETALLE DE CARTA ======== */}
      {detailCard && !editingCard && !showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">{detailCard.name}</h3>
              <button
                onClick={() => {
                  setDetailCard(null);
                  setShowDeleteConfirm(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <img
                src={detailCard.image_url}
                alt={detailCard.name}
                className="w-full h-64 object-cover rounded"
              />
              <p>
                <strong>Categoría: </strong>
                {
                  categories.find((cat) => cat.id === detailCard.category_id)
                    ?.name
                }
              </p>
              <p>
                <strong>Creado: </strong>
                {new Date(detailCard.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Actualizado: </strong>
                {new Date(detailCard.updated_at).toLocaleString()}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              {detailCard.user_id === user?.id && (
                <>
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <Edit2Icon className="w-5 h-5" />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    <Trash2Icon className="w-5 h-5" />
                    Eliminar
                  </button>
                </>
              )}
              <button
                onClick={() => setDetailCard(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======== MODAL DE EDICIÓN ======== */}
      {detailCard && editingCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">
              Editar Carta #{editingCard.id}
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL de la imagen
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoría
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={editCategoryId}
                  onChange={(e) =>
                    setEditCategoryId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                >
                  <option value="">— Selecciona categoría —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Visibilidad
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={editIsPrivate ? "private" : "public"}
                  onChange={(e) =>
                    setEditIsPrivate(e.target.value === "private")
                  }
                >
                  <option value="public">Pública</option>
                  <option value="private">Privada</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCard(null);
                    setDetailCard(detailCard);
                  }}
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

      {/* ======== CONFIRMACIÓN PERSONALIZADA DE ELIMINAR ======== */}
      {detailCard && showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <p className="text-lg mb-6">
              ¿Estás seguro de eliminar la carta "{detailCard.name}"?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
