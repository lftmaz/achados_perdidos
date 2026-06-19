import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const apiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL;

export default function NovoPost() {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contato, setContato] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  
  const navigate = useNavigate();

  const handleSubmeter = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    try {
      if (!apiGatewayUrl) {
        throw new Error('Configure VITE_API_GATEWAY_URL no arquivo .env.');
      }

      setEnviando(true);
      setMensagem('');

      let imageUrl = '';

      if (arquivo) {
        const uploadResponse = await fetch(`${apiGatewayUrl}/upload-url`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Falha ao obter a URL de upload da API.');
        }

        const uploadData = await uploadResponse.json();
        const presignedUrl = uploadData.uploadUrl || uploadData.url || uploadData.signedUrl;
        imageUrl = uploadData.imageUrl || uploadData.fileUrl || uploadData.publicUrl || '';

        if (!presignedUrl) {
          throw new Error('A API não retornou a URL pré-assinada de upload.');
        }

        const putResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': arquivo.type || 'application/octet-stream',
          },
          body: arquivo,
        });

        if (!putResponse.ok) {
          throw new Error('Falha ao enviar a imagem para o S3.');
        }
      }

      const postResponse = await fetch(`${apiGatewayUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descricao,
          contato,
          imageUrl,
        }),
      });

      if (!postResponse.ok) {
        const errorBody = await postResponse.text();
        throw new Error(errorBody || 'Falha ao criar o post.');
      }

      setMensagem('Post criado com sucesso.');
      navigate('/');
      
    } catch (error) {
      console.error("Erro:", error);
      setMensagem(error.message || 'Erro ao publicar no mural.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-md">
      <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-100">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Área do administrador</p>
        <h2 className="mt-1 text-3xl font-bold text-gray-800">Registrar novo item</h2>
        <p className="mt-2 text-sm text-gray-600">Preencha os dados, anexe a imagem e publique direto no mural.</p>
        <p className="mt-2 text-xs text-gray-500">Entrou como: {user?.displayName || user?.username}</p>
      </div>
      {mensagem && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {mensagem}
        </div>
      )}
      <form onSubmit={handleSubmeter} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Título</label>
          <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-green-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Descrição</label>
          <textarea required value={descricao} onChange={e => setDescricao(e.target.value)} rows="4"
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-green-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Contato</label>
          <input type="text" required value={contato} onChange={e => setContato(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-green-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Imagem (Opcional)</label>
          <input type="file" onChange={e => setArquivo(e.target.files[0])} className="w-full rounded-md border border-gray-300 bg-white p-2" />
        </div>
        <button type="submit" disabled={enviando} className="w-full bg-green-700 text-white py-3 rounded-md font-bold hover:bg-green-800 shadow-md disabled:opacity-60">
          {enviando ? 'Publicando...' : 'Publicar no Mural'}
        </button>
      </form>
    </div>
  );
}
