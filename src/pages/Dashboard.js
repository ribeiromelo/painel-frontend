import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
    const [totalDespesas, setTotalDespesas] = useState(0);
    const [creditoPendente, setCreditoPendente] = useState(0);
    const [ultimasCompras, setUltimasCompras] = useState([]);
    const [ultimasFeiras, setUltimasFeiras] = useState([]);
    const [estoqueResumo, setEstoqueResumo] = useState([]);
    const [alertasDebitos, setAlertasDebitos] = useState([]);
    const [gastosMensais, setGastosMensais] = useState([]);
    const [faturamentoFeiras, setFaturamentoFeiras] = useState([]);
    const [comprasMensais, setComprasMensais] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/financeiro/")
            .then((res) => res.json())
            .then((data) => {
                const total = data.reduce((sum, item) => sum + parseFloat(item.valor), 0);
                setTotalDespesas(total);
                setGastosMensais(data.map(item => ({ data: item.data, valor: parseFloat(item.valor) })));
            })
            .catch((err) => console.error("Erro ao carregar financeiro:", err));

        fetch("http://127.0.0.1:8000/api/credito/")
            .then((res) => res.json())
            .then((data) => {
                const totalCredito = data
                    .filter((credito) => credito.status === "por pagar")
                    .reduce((sum, item) => sum + parseFloat(item.valor), 0);
                setCreditoPendente(totalCredito);
            })
            .catch((err) => console.error("Erro ao carregar crédito:", err));

        fetch("http://127.0.0.1:8000/api/feiras/")
            .then((res) => res.json())
            .then((data) => {
                setFaturamentoFeiras(data.map(item => ({ data: item.data, valor: parseFloat(item.valor_faturado) })));
                setUltimasFeiras(data.slice(-3));
            })
            .catch((err) => console.error("Erro ao carregar feiras:", err));

        fetch("http://127.0.0.1:8000/api/compras/")
            .then((res) => res.json())
            .then((data) => {
                setComprasMensais(data.map(item => ({ data: item.data, valor: parseFloat(item.valor) })));
                setUltimasCompras(data.slice(-3));

                const hoje = new Date();
                const proximosDebitos = data
                    .filter((compra) => new Date(compra.data_pagamento) >= hoje)
                    .sort((a, b) => new Date(a.data_pagamento) - new Date(b.data_pagamento))
                    .slice(0, 3);
                setAlertasDebitos(proximosDebitos);
            })
            .catch((err) => console.error("Erro ao carregar compras:", err));

        fetch("http://127.0.0.1:8000/api/estoque/")
            .then((res) => res.json())
            .then((data) => setEstoqueResumo(data.slice(0, 3)))
            .catch((err) => console.error("Erro ao carregar estoque:", err));

    }, []);

    return (
        <Layout>
            <div className="p-6 overflow-y-auto h-screen">
                {/* ALERTAS DE DÉBITOS PRÓXIMOS */}
                {alertasDebitos.length > 0 && (
                    <div className="w-full bg-red-100 text-red-700 p-4 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold">⚠ Débitos Próximos:</h2>
                        {alertasDebitos.map((debito) => (
                            <div key={debito.id} className="bg-red-200 p-3 rounded-md mt-2 shadow">
                                📅 <strong>{debito.data_pagamento}</strong> - <strong>{debito.fornecedor}</strong> precisa pagar <strong>R$ {debito.valor}</strong>
                            </div>
                        ))}
                    </div>
                )}

                <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white shadow-md p-4 rounded-lg border">
                        <h2 className="text-xl font-semibold">Resumo Financeiro</h2>
                        <p className="border-t mt-2 pt-2">Total de Despesas: <strong>R$ {totalDespesas.toFixed(2)}</strong></p>
                    </div>

                    <div className="bg-white shadow-md p-4 rounded-lg border">
                        <h2 className="text-xl font-semibold">Crédito Pendente</h2>
                        <p className="border-t mt-2 pt-2">Total a Receber: <strong>R$ {creditoPendente.toFixed(2)}</strong></p>
                    </div>

                    <div className="bg-white shadow-md p-4 rounded-lg border">
                        <h2 className="text-xl font-semibold">Últimas Compras</h2>
                        <ul className="border-t mt-2 pt-2">
                            {ultimasCompras.map((compra) => (
                                <li key={compra.id} className="border-b py-1">{compra.fornecedor} - R$ {compra.valor}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white shadow-md p-4 rounded-lg border">
                        <h2 className="text-xl font-semibold">Estoque</h2>
                        <ul className="border-t mt-2 pt-2">
                            {estoqueResumo.map((produto) => (
                                <li key={produto.id} className="border-b py-1">{produto.nome} - {produto.quantidade} {produto.unidade}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white shadow-md p-4 rounded-lg border">
                        <h2 className="text-xl font-semibold">Últimas Feiras</h2>
                        <ul className="border-t mt-2 pt-2">
                            {ultimasFeiras.map((feira) => (
                                <li key={feira.id} className="border-b py-1">Data: {feira.data} - R$ {feira.valor_faturado}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* SEÇÃO DE GRÁFICOS */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Análises Financeiras</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow-md p-4 rounded-lg border">
    <h2 className="text-xl font-semibold">Compras por Mês</h2>
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={comprasMensais}>
            <Line type="monotone" dataKey="valor" stroke="green" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
        </LineChart>
    </ResponsiveContainer>
</div>

                    <div className="bg-white shadow-md p-4 rounded-lg border">
                        <h2 className="text-xl font-semibold">Gastos por Mês</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={gastosMensais}>
                                <Line type="monotone" dataKey="valor" stroke="red" />
                                <CartesianGrid stroke="#ccc" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-white shadow-md p-4 rounded-lg border">
                        <h2 className="text-xl font-semibold">Faturamento das Feiras</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={faturamentoFeiras}>
                                <Line type="monotone" dataKey="valor" stroke="blue" />
                                <CartesianGrid stroke="#ccc" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
