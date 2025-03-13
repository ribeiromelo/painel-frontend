import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API_BASE_URL from "../config";

const Compras = () => {
    const [compras, setCompras] = useState([]);
    const [fornecedor, setFornecedor] = useState("");
    const [valor, setValor] = useState("");
    const [dataPagamento, setDataPagamento] = useState("");
    const [metodoPagamento, setMetodoPagamento] = useState("dinheiro");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const registrosPorPagina = 20;

    // Obtém os tokens armazenados
    let accessToken = localStorage.getItem("access_token");
    let refreshToken = localStorage.getItem("refresh_token");

    // Atualiza o token caso esteja expirado
    const refreshAccessToken = async () => {
        if (!refreshToken) {
            console.error("Erro: Nenhum refresh token encontrado. Redirecionando para login.");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
            return null;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!res.ok) {
                console.error("Erro ao atualizar token. Redirecionando para login.");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
                return null;
            }

            const data = await res.json();
            localStorage.setItem("access_token", data.access);
            return data.access;
        } catch (err) {
            console.error("Erro ao tentar atualizar token:", err);
            return null;
        }
    };

    // Carregar compras da API
    const fetchCompras = async () => {
        if (!accessToken) {
            accessToken = await refreshAccessToken();
            if (!accessToken) return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/compras/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            if (res.status === 401) {
                console.warn("Token expirado, tentando atualizar...");
                accessToken = await refreshAccessToken();
                if (!accessToken) return;
                return fetchCompras(); // Chama novamente a função com o novo token
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setCompras(data);
            } else {
                console.error("Erro: API retornou um valor inesperado!", data);
                setCompras([]);
            }
        } catch (err) {
            console.error("Erro ao carregar compras:", err);
        }
    };

    // Carregar compras ao entrar na página
    useEffect(() => {
        fetchCompras();
    }, []);

    const handleAddCompra = async () => {
        if (!fornecedor || !valor || !dataPagamento) {
            alert("Preencha todos os campos!");
            return;
        }

        const novaCompra = {
            fornecedor,
            valor,
            data_pagamento: dataPagamento,
            metodo_pagamento: metodoPagamento,
            status: "pendente",
        };

        if (!accessToken) {
            accessToken = await refreshAccessToken();
            if (!accessToken) return;
        }

        fetch(`${API_BASE_URL}/api/compras/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(novaCompra),
        })
        .then((res) => res.json())
        .then((data) => {
            setCompras((prevCompras) => [...prevCompras, data]);
        })
        .catch((err) => console.error("Erro ao adicionar compra:", err));

        setFornecedor("");
        setValor("");
        setDataPagamento("");
        setMetodoPagamento("dinheiro");
    };

    // Atualizar status da compra
    const handleUpdateStatus = async (id, novoStatus) => {
        if (!accessToken) {
            accessToken = await refreshAccessToken();
            if (!accessToken) return;
        }

        fetch(`${API_BASE_URL}/api/compras/${id}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ status: novoStatus }),
        })
        .then((res) => res.json())
        .then((data) => {
            setCompras((prevCompras) =>
                prevCompras.map((compra) =>
                    compra.id === id ? { ...compra, status: novoStatus } : compra
                )
            );
        })
        .catch((err) => console.error("Erro ao atualizar status:", err));
    };

    // Paginação
    const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const comprasPaginadas = compras.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(compras.length / registrosPorPagina);

    return (
        <Layout>
            <div className="flex flex-col items-center p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro de Compras</h1>

                {/* Formulário de Cadastro */}
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                    <h2 className="text-xl font-semibold mb-4">Nova Compra</h2>
                    <input type="text" placeholder="Fornecedor" className="w-full p-2 border rounded mb-3" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} />
                    <input type="number" placeholder="Valor (R$)" className="w-full p-2 border rounded mb-3" value={valor} onChange={(e) => setValor(e.target.value)} />
                    <input type="date" className="w-full p-2 border rounded mb-3" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} />

                    <label className="block text-gray-700">Método de Pagamento:</label>
                    <select className="w-full p-2 border rounded mb-3" value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
                        <option value="cheque">Cheque</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="credito">Crédito</option>
                    </select>

                    <button onClick={handleAddCompra} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Adicionar Compra</button>
                </div>

                {/* Exibição dos registros */}
                <div className="mt-8 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Compras Registradas</h2>
                    {compras.length === 0 ? (
                        <p className="text-gray-500 text-center">Nenhuma compra registrada.</p>
                    ) : (
                        <ul>
                            {compras.map((compra) => (
                                <li key={compra.id}>
                                    {compra.fornecedor} - R$ {compra.valor} - {compra.data_pagamento} - {compra.status}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Compras;
