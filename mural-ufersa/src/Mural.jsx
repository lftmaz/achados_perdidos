import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const apiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL;

export default function Mural() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    titulo: "",
    descricao: "",
    contato: "",
    imageUrl: "",
  });

  useEffect(() => {
    carregarPosts();
  }, []);

  const carregarPosts = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!apiGatewayUrl) {
        throw new Error("Configure VITE_API_GATEWAY_URL no arquivo .env.");
      }

      const response = await fetch(`${apiGatewayUrl}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar posts da API Gateway.");
      }

      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-10">
        Carregando itens do mural...
      </p>
    );

  return (
    <div className="space-y-6">
      {isAdmin && (
        <section className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Painel do administrador
              </p>
              <h2 className="text-2xl font-bold text-green-950">
                Atalhos rápidos para gerenciar o mural
              </h2>
              <p className="mt-1 text-sm text-green-800">
                Você está logado como {user?.displayName || user?.username}. Use
                estas ações para publicar e atualizar com menos cliques.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/novo"
                className="rounded-md bg-green-700 px-5 py-3 font-bold text-white shadow hover:bg-green-800"
              >
                Novo post
              </Link>
              <button
                type="button"
                onClick={carregarPosts}
                className="rounded-md border border-green-700 px-5 py-3 font-bold text-green-700 hover:bg-green-100"
              >
                Atualizar mural
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <div className="col-span-full rounded-lg border border-gray-200 bg-white p-10 text-center shadow">
            <p className="text-lg text-gray-500">
              Nenhum item registrado no mural no momento.
            </p>
            {isAdmin && (
              <p className="mt-2 text-sm text-gray-400">
                Use o painel do administrador acima para publicar o primeiro
                item.
              </p>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.postId}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md hover:shadow-lg cursor-pointer transition-shadow"
              onClick={() => {
                setSelectedPost(post);
                setEditForm({
                  titulo: post.titulo || "",
                  descricao: post.descricao || "",
                  contato: post.contato || "",
                  imageUrl: post.imageUrl || "",
                });
                setIsEditing(false);
                setIsModalOpen(true);
              }}
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.titulo}
                  className="h-56 w-full object-cover shrink-0"
                />
              )}
              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-800">
                  {post.titulo}
                </h2>
                {/* Alterado para line-clamp-3 ao invés de slice manual */}
                <p className="mb-4 text-gray-600 line-clamp-3 mt-2 flex-grow">
                  {post.descricao}
                </p>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 mt-auto">
                  <p className="text-sm font-semibold text-gray-700">
                    Contato:{" "}
                    <span className="font-normal text-gray-600">
                      {post.contato}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de visualização / edição de post */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b pb-3 mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Editar publicação" : selectedPost.titulo}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    value={editForm.titulo}
                    onChange={(e) =>
                      setEditForm({ ...editForm, titulo: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    value={editForm.descricao}
                    onChange={(e) =>
                      setEditForm({ ...editForm, descricao: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contato
                  </label>
                  <input
                    value={editForm.contato}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contato: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={async () => {
                      if (!selectedPost?.postId) {
                        alert("Erro: ID do post inválido ou ausente.");
                        return;
                      }

                      try {
                        const token = localStorage.getItem("accessToken");
                        const payload = {
                          postId: selectedPost.postId,
                          titulo: editForm.titulo,
                          descricao: editForm.descricao,
                          contato: editForm.contato,
                          imageUrl: editForm.imageUrl,
                        };

                        let res = await fetch(
                          `${apiGatewayUrl}/posts/${selectedPost.postId}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(payload),
                          },
                        );

                        if (res && res.status === 404) {
                          res = await fetch(`${apiGatewayUrl}/posts`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(payload),
                          });
                        }

                        if (!res || !res.ok) {
                          throw new Error(`Falha ao atualizar publicação`);
                        }

                        await carregarPosts();
                        setIsModalOpen(false);
                      } catch (err) {
                        console.error("Erro ao editar post:", err);
                        alert(
                          `Erro ao salvar alterações: Verifique o console para mais detalhes.`,
                        );
                      }
                    }}
                    className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  {selectedPost.imageUrl ? (
                    <div className="flex h-64 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-2 shadow-sm">
                      <img
                        src={selectedPost.imageUrl}
                        alt={selectedPost.titulo}
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="h-64 w-full rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col max-h-[60vh]">
                  {/* Adicionado scroll vertical caso a descrição seja muito extensa */}
                  <div className="overflow-y-auto pr-2 flex-grow">
                    <p className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                      {selectedPost.descricao}
                    </p>
                  </div>

                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      Contato para devolução:
                    </p>
                    <p className="text-md text-gray-700">
                      {selectedPost.contato}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="rounded bg-yellow-500 px-4 py-2 font-semibold text-white hover:bg-yellow-600 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              !confirm(
                                "Tem certeza que deseja excluir esta publicação?",
                              )
                            )
                              return;
                            try {
                              const token = localStorage.getItem("accessToken");
                              const res = await fetch(
                                `${apiGatewayUrl}/posts/${selectedPost.postId}`,
                                {
                                  method: "DELETE",
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              );
                              if (!res.ok)
                                throw new Error("Falha ao excluir publicação");
                              await carregarPosts();
                              setIsModalOpen(false);
                            } catch (err) {
                              console.error("Erro ao excluir publicação:", err);
                            }
                          }}
                          className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors ml-auto"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
