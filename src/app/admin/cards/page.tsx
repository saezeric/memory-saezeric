/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/cards/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PlusIcon } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface UserSimple {
  id: number;
  name: string;
}

interface CardType {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  user_id: number | null;
  user?: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

export default function CardsManagement() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Vista activa: "all" (solo admin) | "my" | "public" | "category"
  const [view, setView] = useState<"all" | "my" | "public" | "category">(
    user?.role === "admin" ? "all" : "public"
  );

  // Listado de categorías para poblar el select
  const [categories, setCategories] = useState<Category[]>([]);

  // Para elegir la categoría en "Por Categoría"
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  // Array de cartas a mostrar (según la vista, categoría y paginación)
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- Paginación ----
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // ---- Modal de creación ----
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formIsPrivate, setFormIsPrivate] = useState<boolean>(false);

  // ---- Modal de detalle y edición ----
  const [detailCard, setDetailCard] = useState<CardType | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  // ---- Campos de edición ----
  const [editName, setEditName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | "">("");
  const [editIsPrivate, setEditIsPrivate] = useState<boolean>(false);
  const [editOwnerId, setEditOwnerId] = useState<number | "">("");

  // ---- Confirmación de eliminación ----
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ---- Listado de usuarios (sólo para admin, al editar) ----
  const [allUsers, setAllUsers] = useState<UserSimple[]>([]);

  // ---- 1) Cargar categorías al montar ----
  useEffect(() => {
    fetch(`${API_BASE}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        let raw: any[] = [];
        if (Array.isArray(json)) {
          raw = json;
        } else if (Array.isArray(json.data)) {
          raw = json.data;
        }
        const list: Category[] = raw.map((c) => ({
          id: c.id,
          name: c.name,
        }));
        setCategories(list);
      })
      .catch(console.error);
  }, [token]);

  // ---- Si soy admin, cargar todos los usuarios para el select de dueños (edición) ----
  useEffect(() => {
    if (user?.role !== "admin") return;
    fetch(`${API_BASE}/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        if (!Array.isArray(json.data)) return;
        const list: UserSimple[] = json.data.map((u: any) => ({
          id: u.id,
          name: u.name,
        }));
        setAllUsers(list);
      })
      .catch(console.error);
  }, [token, user]);

  // ---- 2) Cargar cartas cada vez que cambie "view", "selectedCategory" o "page" ----
  useEffect(() => {
    let url = "";
    if (view === "all") {
      url = `${API_BASE}/cards?page=${page}&per_page=12`;
    } else if (view === "my") {
      url = `${API_BASE}/my-cards?page=${page}&per_page=12`;
    } else if (view === "public") {
      url = `${API_BASE}/public-cards?page=${page}&per_page=12`;
    } else if (view === "category") {
      if (selectedCategory === "") {
        setCards([]);
        setMeta(null);
        return;
      }
      url = `${API_BASE}/cards/category/${selectedCategory}?page=${page}&per_page=12`;
    }

    if (!url) {
      setCards([]);
      setMeta(null);
      return;
    }

    setLoading(true);
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        let rawCards: any[] = [];
        let rawMeta: PaginationMeta | null = null;

        if (json.data && Array.isArray(json.data)) {
          rawCards = json.data;
          if (json.meta) {
            rawMeta = {
              current_page: json.meta.current_page,
              last_page: json.meta.last_page,
              per_page: json.meta.per_page,
              total: json.meta.total,
            };
          }
        } else if (Array.isArray(json)) {
          rawCards = json;
          rawMeta = {
            current_page: 1,
            last_page: 1,
            per_page: rawCards.length,
            total: rawCards.length,
          };
        }

        const list: CardType[] = rawCards.map((c: any) => ({
          id: c.id,
          name: c.name,
          image_url: c.image_url,
          category_id: c.category_id,
          user_id: c.user_id,
          user: c.user ? { id: c.user.id, name: c.user.name } : null,
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));

        setCards(list);
        setMeta(rawMeta);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [view, selectedCategory, page, token]);

  // ---- Control de cambio de vista: reiniciar página a 1 y limpiar categorías ----
  const changeView = (newView: "all" | "my" | "public" | "category") => {
    setView(newView);
    setSelectedCategory("");
    setPage(1);
  };

  // ---- Función para abrir el modal de creación ----
  const openCreateModal = () => {
    setFormName("");
    setFormImageUrl("");
    setFormCategoryId("");
    setFormIsPrivate(false);
    setShowCreateModal(true);
  };

  // ---- Función para enviar el formulario de creación ----
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formImageUrl.trim() || formCategoryId === "") {
      alert("Todos los campos obligatorios deben rellenarse.");
      return;
    }
    let payloadUserId: number | null = null;
    if (formIsPrivate) {
      payloadUserId = user!.id;
    } else {
      payloadUserId = null;
    }

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
      setShowCreateModal(false);
      setPage(1);
    } catch (err: any) {
      console.error(err);
      alert("No se pudo crear la carta: " + err.message);
    }
  };

  // ---- Función para abrir detalle de una carta ----
  const openDetail = (card: CardType) => {
    setDetailCard(card);
    setEditingCard(null);
    setShowDeleteConfirm(false);
    // Inicializar campos de edición cuando se abra detalle
    setEditName(card.name);
    setEditImageUrl(card.image_url);
    setEditCategoryId(card.category_id);
    setEditIsPrivate(card.user_id !== null);
    setEditOwnerId(card.user_id ?? "");
  };

  // ---- Función para cerrar cualquier modal ----
  const closeAllModals = () => {
    setShowCreateModal(false);
    setDetailCard(null);
    setEditingCard(null);
    setShowDeleteConfirm(false);
  };

  // ---- Función para iniciar edición dentro del detalle ----
  const startEditing = () => {
    if (!detailCard) return;
    setEditingCard(detailCard);
  };

  // ---- Función para guardar edición ----
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    if (!editName.trim() || !editImageUrl.trim() || editCategoryId === "") {
      alert("Todos los campos obligatorios deben rellenarse.");
      return;
    }

    let payloadUserId: number | null = null;
    if (editIsPrivate) {
      if (user?.role === "admin") {
        if (editOwnerId === "") {
          alert("Debes seleccionar un dueño para la carta privada.");
          return;
        }
        payloadUserId = Number(editOwnerId);
      } else {
        payloadUserId = user!.id;
      }
    } else {
      payloadUserId = null;
    }

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
      // Actualizar lista localmente
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id
            ? {
                ...c,
                name: body.name,
                image_url: body.image_url,
                category_id: body.category_id,
                user_id: body.user_id,
                user:
                  body.user_id !== null
                    ? {
                        id: body.user_id,
                        name:
                          allUsers.find((u) => u.id === body.user_id)?.name ||
                          "",
                      }
                    : null,
              }
            : c
        )
      );
      closeAllModals();
    } catch (err: any) {
      console.error(err);
      alert("No se pudo editar la carta: " + err.message);
    }
  };

  // ---- Función para confirmar eliminación ----
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  // ---- Función para eliminar carta ----
  const handleDelete = async () => {
    if (!detailCard) return;
    try {
      const res = await fetch(`${API_BASE}/cards/${detailCard.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar la carta");
      }
      // Quitar de la lista local
      setCards((prev) => prev.filter((c) => c.id !== detailCard.id));
      closeAllModals();
    } catch (err: any) {
      console.error(err);
      alert("No se pudo eliminar la carta: " + err.message);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Título y botón “Nueva Carta” alineados */}
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

      {/* ----- BOTONES DE VISTA (responsive: 2 cols en móvil, 4 cols en tablet+) ----- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {user?.role === "admin" && (
          <button
            className={`w-full px-4 py-2 rounded ${
              view === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
            onClick={() => changeView("all")}
          >
            Todas
          </button>
        )}

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

      {/* ----- SELECT DE CATEGORÍAS (solo si view === "category") ----- */}
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

      {/* ----- LISTADO DE CARTAS (GRID: 1-col móvil, 2-cols tablet, 4-cols en lg+) ----- */}
      {loading ? (
        <p>Cargando cartas…</p>
      ) : cards.length === 0 ? (
        <p>No hay cartas para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {card.user_id && card.user && (
                  <p className="text-sm text-gray-500 mt-1">
                    Dueño: {card.user.name}
                  </p>
                )}
                {view === "all" && card.user_id === null && (
                  <p className="text-sm text-gray-500 mt-1">Sin dueño</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----- PAGINACIÓN simple ----- */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.current_page === 1}
            className={`px-3 py-1 rounded ${
              meta.current_page === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Anterior
          </button>
          <span>
            Página {meta.current_page} de {meta.last_page}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={meta.current_page === meta.last_page}
            className={`px-3 py-1 rounded ${
              meta.current_page === meta.last_page
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* ======== MODAL DE CREACIÓN DE CARTA ======== */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Crear Nueva Carta</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Nombre */}
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

              {/* URL de imagen */}
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

              {/* Categoría */}
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

              {/* Visibilidad */}
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

              {/* Ya no mostramos el selector de dueño en creación */}

              {/* Botones Cancelar / Guardar */}
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

      {/* ======== MODAL DE DETALLE / EDICIÓN ======== */}
      {detailCard && !editingCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">{detailCard.name}</h3>
              <button
                onClick={closeAllModals}
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
              {detailCard.user_id && detailCard.user && (
                <p>
                  <strong>Dueño: </strong>
                  {detailCard.user.name}
                </p>
              )}
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
              {(user?.role === "admin" || detailCard.user_id === user?.id) && (
                <>
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </>
              )}
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

      {/* ======== MODAL DE EDICIÓN ======== */}
      {detailCard && editingCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">
              Editar Carta #{editingCard.id}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Nombre */}
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

              {/* URL de imagen */}
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

              {/* Categoría */}
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

              {/* Visibilidad */}
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

              {/* Si es privado y soy admin: elegir dueño */}
              {editIsPrivate && user?.role === "admin" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dueño (solo Admin)
                  </label>
                  <select
                    className="w-full border px-3 py-2 rounded"
                    value={editOwnerId}
                    onChange={(e) =>
                      setEditOwnerId(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    required
                  >
                    <option value="">— Selecciona dueño —</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* En usuarios normales, si es privado: el dueño es yo */}
              {editIsPrivate && user?.role !== "admin" && (
                <p className="text-sm text-gray-500">
                  La carta se asignará a tu usuario (Privada).
                </p>
              )}

              {/* Botones Cancelar / Guardar */}
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => openDetail(detailCard!)}
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
