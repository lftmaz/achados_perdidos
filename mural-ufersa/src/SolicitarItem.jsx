import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import emailjs from '@emailjs/browser';

const apiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL;

export default function SolicitarItem() {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contato, setContato] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmeter = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    try {
      setEnviando(true);
      setMensagem('');

      let imageUrl = 'Nenhuma imagem enviada';

      // Passo 1: Upload da imagem para a AWS S3 (Se houver arquivo e API configurada)
      if (arquivo && apiGatewayUrl) {
        try {
            const uploadResponse = await fetch(`${apiGatewayUrl}/upload-url`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            });

            if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            const presignedUrl = uploadData.uploadUrl || uploadData.url || uploadData.signedUrl;
            imageUrl = uploadData.imageUrl || uploadData.fileUrl || uploadData.publicUrl || '';

            await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': arquivo.type || 'application/octet-stream' },
                body: arquivo,
            });
            }
        } catch (uploadError) {
            console.warn("Aviso: Falha no upload da imagem, enviando formulário sem imagem.", uploadError);
        }
      }

      // Passo 2: Envio do E-mail direto pelo Frontend com EmailJS
      const templateParams = {
        titulo: titulo,
        descricao: descricao,
        contato: contato,
        alunoNome: user.displayName || 'Aluno UFERSA',
        alunoEmail: user.email || user.username,
        imageUrl: imageUrl,
        adminEmail: 'thyago.costa@alunos.ufersa.edu.br' // Caso queira usar dinamicamente no template
      };

      // Disparo do EmailJS com as suas chaves!
      await emailjs.send(
        'service_wbdhu6c',     // Seu Service ID
        'template_mrn20wt',    // Seu Template ID
        templateParams,
        'zJ0j7AcG_XjRTpSrd'    // Sua Public Key
      );

      setSucesso(true);
      setMensagem('Solicitação enviada! A administração foi notificada por e-mail.');
      
      // Retorna para o mural após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error("Erro:", error);
      setMensagem(error.message || 'Erro ao enviar o e-mail de solicitação.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-md">
      <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
        <h2 className="text-3xl font-bold text-blue-900">Reportar Objeto Perdido</h2>
        <p className="mt-2 text-sm text-gray-600">
          Perdeu alguma coisa no campus? Preencha os dados abaixo. Sua solicitação será enviada para a administração.
        </p>
      </div>

      {mensagem && (
        <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${sucesso ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {mensagem}
        </div>
      )}

      {!sucesso && (
        <form onSubmit={handleSubmeter} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">O que você perdeu? (Título)</label>
            <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Garrafa térmica azul, Caderno de Cálculo..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Detalhes e local provável da perda</label>
            <textarea required value={descricao} onChange={e => setDescricao(e.target.value)} rows="4"
              placeholder="Descreva o objeto, marcas de uso, onde foi visto por último (Ex: Prédio de TI, Sala 3)..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Seu Contato (Telefone/WhatsApp)</label>
            <input type="text" required value={contato} onChange={e => setContato(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Imagem de referência (Opcional)</label>
            <p className="text-xs text-gray-500 mb-1">Tem alguma foto igual ao objeto perdido? Anexe aqui.</p>
            <input type="file" accept="image/*" onChange={e => setArquivo(e.target.files[0])} className="w-full rounded-md border border-gray-300 bg-white p-2" />
          </div>
          <button type="submit" disabled={enviando} className="w-full bg-blue-900 text-white py-3 rounded-md font-bold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-60 mt-4">
            {enviando ? 'Enviando e-mail...' : 'Enviar Solicitação'}
          </button>
        </form>
      )}
    </div>
  );
}