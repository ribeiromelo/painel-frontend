import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const Compras = () => {
    const [compras, setCompras] = useState([]);
    const [fornecedor, setFornecedor] = useState("");
    const [valor, setValor] = useState("");
    const [dataPagamento, setDataPagamento] = useState("");
    const [metodoPagamento, setMetodoPagamento] = useState("dinheiro");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const registrosPorPagina = 20;

    // Carregar compras da API
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/compras/")
            .then((res) => res.json())
            .then((data) => setCompras(data))
            .catch((err) => console.error("Erro ao carregar compras:", err));
    }, []);

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

        fetch("http://127.0.0.1:8000/api/compras/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        fetch(`http://127.0.0.1:8000/api/compras/${id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
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

                    {/* Novo campo para Método de Pagamento */}
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

                    {/* Paginação */}
                    <div className="flex justify-center mt-4 space-x-2">
                        {[...Array(totalPaginas)].map((_, index) => (
                            <button
                                key={index}
                                className={`px-3 py-1 rounded ${paginaAtual === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
                                onClick={() => setPaginaAtual(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Compras;
