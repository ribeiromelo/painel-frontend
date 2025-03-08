import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Para redirecionar o usuário

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Limpa erros anteriores

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Armazena o token no localStorage
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);

                // Redireciona para o painel
                navigate("/dashboard");
            } else {
                setError(data?.detail || "Usuário ou senha inválidos!");
            }
        } catch (error) {
            console.error("Erro na autenticação:", error);
            setError("Erro ao conectar ao servidor. Verifique sua conexão.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* LOGOMARCA */}
            <div className="mb-6">
                <img 
                    src="https://i.ibb.co/pBySDZwN/logo.png" 
                    alt="Logo da Empresa" 
                    className="w-32 h-auto"
                />
            </div>

            <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Bem-vindo ao Painel</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Usuário</label>
                        <input
                            type="text"
                            placeholder="Digite seu usuário"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Senha</label>
                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
                    >
                        Entrar
                    </button>
                </form>
                <p className="mt-4 text-gray-600 text-center">
                    Esqueceu sua senha? <a href="/esqueci-senha" className="text-blue-500 hover:underline">Recupere aqui</a>
                </p>
            </div>

            {/* COPYRIGHT */}
            <footer className="mt-6 text-gray-600 text-sm">
                © {new Date().getFullYear()} Criado por <b>Erique Melo</b>. Todos os direitos reservados.
            </footer>
        </div>
    );
};

export default Login;
