import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [menuAberto, setMenuAberto] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* CABEÇALHO */}
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Painel de Controle</h1>

                {/* Menu normal em telas grandes */}
                <nav className="hidden md:flex">
                    <Link to="/dashboard" className="px-3 hover:underline">Início</Link>
                    <Link to="/compras" className="px-3 hover:underline">Compras</Link>
                    <Link to="/feiras" className="px-3 hover:underline">Feiras</Link>
                    <Link to="/estoque" className="px-3 hover:underline">Estoque</Link>
                    <Link to="/financeiro" className="px-3 hover:underline">Financeiro</Link>
                    <Link to="/credito" className="px-3 hover:underline">Fiados</Link>
                    <button onClick={handleLogout} className="ml-3 bg-red-500 px-3 py-1 rounded-md hover:bg-red-600">
                        Sair
                    </button>
                </nav>

                {/* Ícone do menu hambúrguer para telas menores */}
                <button 
                    className="md:hidden text-2xl"
                    onClick={() => setMenuAberto(!menuAberto)}
                >
                    ☰
                </button>
            </header>

            {/* Menu responsivo dropdown */}
            {menuAberto && (
                <div className="md:hidden flex flex-col bg-blue-700 p-4 space-y-3">
                    <Link to="/dashboard" className="hover:underline">Início</Link>
                    <Link to="/compras" className="hover:underline">Compras</Link>
                    <Link to="/feiras" className="hover:underline">Feiras</Link>
                    <Link to="/estoque" className="hover:underline">Estoque</Link>
                    <Link to="/financeiro" className="hover:underline">Financeiro</Link>
                    <Link to="/credito" className="hover:underline">Fiados</Link>
                    <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600">
                        Sair
                    </button>
                </div>
            )}

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-grow p-6">{children}</main>

            {/* RODAPÉ */}
            <footer className="bg-gray-800 text-white text-center p-3 text-sm">
                © {new Date().getFullYear()} Criado por <b>Erique Melo</b>. Todos os direitos reservados.
            </footer>
        </div>
    );
};

export default Layout;
