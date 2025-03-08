import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { jsPDF } from "jspdf";
import API_BASE_URL from "../config";

const Financeiro = () => {
    const [despesas, setDespesas] = useState([]);
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [categoria, setCategoria] = useState("Transporte");
    const [data, setData] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const registrosPorPagina = 20;

    // Buscar despesas da API
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/financeiro/`)
            .then((res) => res.json())
            .then((data) => setDespesas(data))
            .catch((err) => console.error("Erro ao carregar despesas:", err));
    }, []);

    // Adicionar nova despesa
    const handleAddDespesa = () => {
        if (!descricao || !valor || !data) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const novaDespesa = { descricao, valor, categoria, data };

        fetch(`${API_BASE_URL}/api/financeiro/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaDespesa),
        })
            .then((res) => res.json())
            .then((data) => setDespesas([...despesas, data]))
            .catch((err) => console.error("Erro ao adicionar despesa:", err));

        setDescricao("");
        setValor("");
        setCategoria("Transporte");
        setData("");
    };

    // Paginação
    const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const despesasPaginadas = despesas.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(despesas.length / registrosPorPagina);

    // Exportar PDF
    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Relatório Financeiro", 20, 10);
        let y = 20;
        despesasPaginadas.forEach((despesa, index) => {
            doc.text(
                `${index + 1}. ${despesa.data} - ${despesa.descricao}: R$ ${despesa.valor} (${despesa.categoria})`,
                20, y
            );
            y += 10;
        });
        doc.save("Relatorio_Financeiro.pdf");
    };

    return (
        <Layout>
            <div className="flex flex-col items-center p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Controle Financeiro</h1>

                {/* Formulário de Cadastro */}
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                    <h2 className="text-xl font-semibold mb-4">Nova Despesa</h2>
                    <input
                        type="text"
                        placeholder="Descrição"
                        className="w-full p-2 border rounded mb-3"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Valor (R$)"
                        className="w-full p-2 border rounded mb-3"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                    />
                    <input
                        type="date"
                        className="w-full p-2 border rounded mb-3"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                    <select
                        className="w-full p-2 border rounded mb-3"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                    >
                        <option value="Trabalhadores">Trabalhadores</option>
                        <option value="Combustível">Combustível</option>
                        <option value="Descarregamento">Descarregamento</option>
                        <option value="Peças">Peças</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Construção">Construção</option>
                    </select>

                    <button
                        onClick={handleAddDespesa}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Adicionar Despesa
                    </button>
                </div>

                {/* Tabela de Despesas */}
                <div className="mt-8 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Despesas Registradas</h2>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Data</th>
                                <th className="p-2">Descrição</th>
                                <th className="p-2">Valor</th>
                                <th className="p-2">Categoria</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despesasPaginadas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-4 text-gray-500">
                                        Nenhuma despesa registrada.
                                    </td>
                                </tr>
                            ) : (
                                despesasPaginadas.map((despesa) => (
                                    <tr key={despesa.id} className="border-t">
                                        <td className="p-2">{despesa.data}</td>
                                        <td className="p-2">{despesa.descricao}</td>
                                        <td className="p-2">R$ {despesa.valor}</td>
                                        <td className="p-2">{despesa.categoria}</td>
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
                                className={`px-3 py-1 rounded ${
                                    paginaAtual === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
                                }`}
                                onClick={() => setPaginaAtual(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {/* Botão de Exportar PDF */}
                    <button
                        onClick={exportarPDF}
                        className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                    >
                        Exportar PDF
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Financeiro;
