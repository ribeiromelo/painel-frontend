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

    // Atualiza token se estiver expirado
    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
            console.error("Sem refresh token, redirecionando para login.");
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
                console.error("Erro ao renovar token. Redirecionando para login.");
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

    // Carregar compras pendentes da API
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
                console.warn("Token expirado, tentando renovar...");
                accessToken = await refreshAccessToken();
                if (!accessToken) return;
                return fetchCompras(); // Chama novamente a função com o novo token
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                // Filtrar apenas os pendentes para exibição na tabela
                setCompras(data.filter((compra) => compra.status === "pendente"));
            } else {
                console.error("Erro: API retornou um valor inesperado!", data);
                setCompras([]);
            }
        } catch (err) {
            console.error("Erro ao carregar compras:", err);
        }
    };

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
            setCompras([...compras, data]);
        })
        .catch((err) => console.error("Erro ao adicionar compra:", err));

        setFornecedor("");
        setValor("");
        setDataPagamento("");
        setMetodoPagamento("dinheiro");
    };

    // Atualizar status da compra e remover da lista se for "pago"
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
        .then(() => {
            // Remove da lista se o status for alterado para "pago"
            setCompras(compras.filter((compra) => compra.id !== id));
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
                    <h2 className="text-xl font-semibold mb-4">Compras Pendentes</h2>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Fornecedor</th>
                                <th className="p-2">Valor</th>
                                <th className="p-2">Data Pagamento</th>
                                <th className="p-2">Método</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comprasPaginadas.map((compra) => (
                                <tr key={compra.id}>
                                    <td>{compra.fornecedor}</td>
                                    <td>R$ {compra.valor}</td>
                                    <td>{compra.data_pagamento}</td>
                                    <td>{compra.metodo_pagamento}</td>
                                    <td>
                                        <span className="px-2 py-1 rounded text-white bg-red-500">Pendente</span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleUpdateStatus(compra.id, "pago")} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                            Marcar como Pago
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Compras;
