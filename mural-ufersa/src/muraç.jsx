import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import awsConfig from '../aws-config';

export default function Mural() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPosts();
  }, []);

  const carregarPosts = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      const response = await fetch(`${awsConfig.API.REST.MuralAPI.endpoint}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Carregando itens do mural...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.length === 0 ? (
        <div className="col-span-full bg-white p-10 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">Nenhum item registrado no mural no momento.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.postId} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {post.imageUrl && (
              <img src={post.imageUrl} alt={post.titulo} className="w-full h-56 object-cover" />
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-gray-800">{post.titulo}</h2>
                <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
                  post.tipo === 'Achado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {post.tipo}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.descricao}</p>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Contato para devolução:</p>
                <p className="text-sm text-gray-600">{post.contato}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}