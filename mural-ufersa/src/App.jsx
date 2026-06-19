import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Mural from './Mural';
import NovoPost from './NovoPost';
import Login from './Login';
import SolicitarItem from './SolicitarItem'; // Importamos o novo componente

function AppRoutes() {
  const { user, isAdmin, logout, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Carregando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <nav className="bg-blue-900 text-white p-4 shadow-lg border-b-4 border-blue-700 transition-all">
          <div className="container mx-auto flex justify-between items-center relative min-h-[48px]">
            
            <div className="flex items-center">
              <img 
                src="/image.png" 
                alt="Logo UFERSA" 
                className="h-25 w-auto rounded-full p-1"
              />
            </div>

            <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl font-bold tracking-wide w-max text-center pointer-events-none">
              Achados e Perdidos
            </h1>

            <div className="flex items-center gap-4 z-10">
              <Link to="/" className="hover:text-blue-200 transition-colors font-medium">Mural</Link>
              {user ? (
                <>
                  {/* Se for Admin, mostra botão de publicar no mural. Se for Aluno, mostra botão de Solicitar */}
                  {isAdmin ? (
                    <Link to="/novo" className="bg-white text-blue-900 px-4 py-2 rounded-md font-bold shadow hover:bg-gray-100 transition-transform hover:scale-105">
                      Anunciar Item
                    </Link>
                  ) : (
                    <Link to="/solicitar" className="bg-white text-blue-900 px-4 py-2 rounded-md font-bold shadow hover:bg-gray-100 transition-transform hover:scale-105">
                      Reportar Perda
                    </Link>
                  )}
                  <button onClick={logout} className="text-sm bg-red-600 px-4 py-2 rounded-md shadow hover:bg-red-700 transition-colors">
                    Sair ({(user.displayName || user.username).split('@')[0]})
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-blue-700 text-white border border-blue-500 px-5 py-2 rounded-md font-bold shadow hover:bg-blue-600 transition-all">
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 mt-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={user ? <Mural /> : <Navigate to="/login" replace />} />
            <Route path="/novo" element={user && isAdmin ? <NovoPost /> : <Navigate to="/login" replace />} />
            {/* Rota liberada para qualquer usuário logado */}
            <Route path="/solicitar" element={user ? <SolicitarItem /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}