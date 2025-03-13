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

    // Obtém o token JWT do localStorage
    const token = localStorage.getItem("access_token");

    // Carregar compras da API com autenticação
    useEffect(() => {
        if (!token) {
            console.error("Erro: Token de autenticação não encontrado.");
            return;
        }

        fetch(`${API_BASE_URL}/api/compras/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Envia o token no cabeçalho
            },
        })
        .then((res) => {
            if (res.status === 401) {
                console.error("Erro 401: Token inválido ou expirado.");
                return [];
            }
            return res.json();
        })
        .then((data) => {
            console.log("Dados recebidos da API:", data);
            if (Array.isArray(data)) {
                setCompras(data);
            } else {
                console.error("Erro: API retornou um valor inesperado!", data);
                setCompras([]);
            }
        })
        .catch((err) => {
            console.error("Erro ao carregar compras:", err);
            setCompras([]);
        });
    }, [token]);

    const handleAddCompra = () => {
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

        fetch(`${API_BASE_URL}/api/compras/`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // Enviando o token JWT
            },
            body: JSON.stringify(novaCompra),
        })
        .then((res) => res.json())
        .then((data) => setCompras([...compras, data]))
        .catch((err) => console.error("Erro ao adicionar compra:", err));

        setFornecedor("");
        setValor("");
        setDataPagamento("");
        setMetodoPagamento("dinheiro");
    };

    // Atualizar status da compra (pendente/pago)
    const handleUpdateStatus = (id, novoStatus) => {
        fetch(`${API_BASE_URL}/api/compras/${id}/`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ status: novoStatus }),
        })
        .then((res) => res.json())
        .then((data) => {
            setCompras(
                compras.map((compra) =>
                    compra.id === id ? { ...compra, status: novoStatus } : compra
                )
            );
        })
        .catch((err) => console.error("Erro ao atualizar status:", err));
    };

    // Paginação
    const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const comprasPaginadas = Array.isArray(compras) ? compras.slice(indiceInicial, indiceFinal) : [];
    const totalPaginas = Array.isArray(compras) ? Math.ceil(compras.length / registrosPorPagina) : 1;

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

                {/* Tabela de Compras */}
                <div className="mt-8 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Compras Registradas</h2>
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
                            {comprasPaginadas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-4 text-gray-500">
                                        Nenhuma compra registrada.
                                    </td>
                                </tr>
                            ) : (
                                comprasPaginadas.map((compra) => (
                                    <tr key={compra.id} className="border-t">
                                        <td className="p-2">{compra.fornecedor}</td>
                                        <td className="p-2">R$ {compra.valor}</td>
                                        <td className="p-2">{compra.data_pagamento}</td>
                                        <td className="p-2">{compra.metodo_pagamento}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-white ${compra.status === "pago" ? "bg-green-500" : "bg-red-500"}`}>
                                                {compra.status}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <select 
                                                className="p-1 border rounded"
                                                value={compra.status}
                                                onChange={(e) => handleUpdateStatus(compra.id, e.target.value)}
                                            >
                                                <option value="pendente">Pendente</option>
                                                <option value="pago">Pago</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Compras;
