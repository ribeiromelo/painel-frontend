import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { jsPDF } from "jspdf"; // ✅ IMPORTAÇÃO NO TOPO
import API_BASE_URL from "../config";

const Feiras = () => {
    const [feiras, setFeiras] = useState([]);
    const [data, setData] = useState("");
    const [relatorio, setRelatorio] = useState("");
    const [valorFaturado, setValorFaturado] = useState("");
    const [valorFiado, setValorFiado] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const registrosPorPagina = 20;

    // ✅ Função para exportar PDF
    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Relatório das Últimas 20 Feiras", 20, 10);
        let y = 20;
        feiras.slice(0, 20).forEach((feira, index) => {
            doc.text(
                `${index + 1}. Data: ${feira.data} | Faturamento: R$ ${feira.valor_faturado} | Fiado: R$ ${feira.valor_fiado}`,
                20, y
            );
            y += 10;
        });
        doc.save("Relatorio_Feiras.pdf");
    };

    // Carregar feiras da API
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/feiras/`)
            .then((res) => res.json())
            .then((data) => setFeiras(data))
            .catch((err) => console.error("Erro ao carregar feiras:", err));
    }, []);

    // Adicionar nova feira
    const handleAddFeira = () => {
        if (!data || !valorFaturado || !valorFiado) {
            alert("Preencha os campos obrigatórios!");
            return;
        }

        const novaFeira = {
            data,
            relatorio,
            valor_faturado: valorFaturado,
            valor_fiado: valorFiado,
        };

        fetch(`${API_BASE_URL}/api/feiras/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaFeira),
        })
            .then((res) => res.json())
            .then((data) => setFeiras([...feiras, data]))
            .catch((err) => console.error("Erro ao adicionar feira:", err));

        setData("");
        setRelatorio("");
        setValorFaturado("");
        setValorFiado("");
    };

    // Paginação
    const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const feirasPaginadas = feiras.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(feiras.length / registrosPorPagina);

    return (
        <Layout>
            <div className="flex flex-col items-center p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro de Feiras</h1>

                {/* Formulário de Cadastro */}
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                    <h2 className="text-xl font-semibold mb-4">Nova Feira</h2>
                    <input
                        type="date"
                        className="w-full p-2 border rounded mb-3"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                    <textarea
                        placeholder="Relatório"
                        className="w-full p-2 border rounded mb-3"
                        value={relatorio}
                        onChange={(e) => setRelatorio(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Faturamento (R$)"
                        className="w-full p-2 border rounded mb-3"
                        value={valorFaturado}
                        onChange={(e) => setValorFaturado(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Valor Fiado (R$)"
                        className="w-full p-2 border rounded mb-3"
                        value={valorFiado}
                        onChange={(e) => setValorFiado(e.target.value)}
                    />
                    <button
                        onClick={handleAddFeira}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Adicionar Feira
                    </button>
                </div>

                {/* Tabela de Feiras */}
                <div className="mt-8 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Feiras Registradas</h2>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Data</th>
                                <th className="p-2">Relatório</th>
                                <th className="p-2">Faturamento</th>
                                <th className="p-2">Fiado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feirasPaginadas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-4 text-gray-500">
                                        Nenhuma feira registrada.
                                    </td>
                                </tr>
                            ) : (
                                feirasPaginadas.map((feira) => (
                                    <tr key={feira.id} className="border-t">
                                        <td className="p-2">{feira.data}</td>
                                        <td className="p-2">{feira.relatorio}</td>
                                        <td className="p-2">R$ {feira.valor_faturado}</td>
                                        <td className="p-2">R$ {feira.valor_fiado}</td>
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

export default Feiras;
