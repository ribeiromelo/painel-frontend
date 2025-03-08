import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { jsPDF } from "jspdf";
import API_BASE_URL from "../config";

const Credito = () => {
    const [creditos, setCreditos] = useState([]);
    const [nome, setNome] = useState("");
    const [valor, setValor] = useState("");
    const [prazo, setPrazo] = useState("semanal"); // Valor padrão
    const [paginaAtual, setPaginaAtual] = useState(1);
    const registrosPorPagina = 20;

    // Carregar créditos da API
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/credito/`)
            .then((res) => res.json())
            .then((data) => setCreditos(data))
            .catch((err) => console.error("Erro ao carregar créditos:", err));
    }, []);

    // Adicionar novo crédito
    const handleAddCredito = () => {
        if (!nome || !valor || !prazo) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const novoCredito = {
            nome,
            valor: parseFloat(valor).toFixed(2),
            prazo, // Mantém exatamente como no select
            status: "por pagar",
        };

        fetch(`${API_BASE_URL}/api/credito/`, {  // ✅ Adicionada a vírgula correta aqui
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoCredito),
        })
        .then(async (res) => {
            const responseData = await res.json();
            if (!res.ok) {
                console.error("Erro no backend:", responseData);
                throw new Error(`Erro ao adicionar crédito: ${res.status} - ${JSON.stringify(responseData)}`);
            }
            return responseData;
        })
        .then((data) => {
            setCreditos([...creditos, data]);
        })
        .catch((err) => {
            console.error("Erro ao adicionar crédito:", err);
            alert("Erro ao adicionar crédito. Verifique os dados e tente novamente.");
        });

        setNome("");
        setValor("");
        setPrazo("semanal"); // Mantém coerente com as opções do dropdown
    };

    // Atualizar status de crédito
    const handleUpdateStatus = (id, novoStatus) => {
        fetch(`${API_BASE_URL}/api/credito/${id}/`, {  // ✅ Adicionada a vírgula correta aqui
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus }),
        })
        .then(async (res) => {
            if (!res.ok) {
                const errorMessage = await res.text();
                throw new Error(`Erro ao atualizar crédito: ${res.status} - ${errorMessage}`);
            }
            return res.json();
        })
        .then((data) => {
            console.log("Atualização de status:", data);
            const novosCreditos = creditos.map((credito) =>
                credito.id === id ? { ...credito, status: novoStatus } : credito
            );
            setCreditos(novosCreditos);
        })
        .catch((err) => console.error("Erro ao atualizar crédito:", err));
    };

    // Filtrar para exibir apenas os "por pagar"
    const creditosPendentes = creditos.filter((credito) => credito.status === "por pagar");

    // Paginação
    const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const creditosPaginados = creditosPendentes.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(creditosPendentes.length / registrosPorPagina);

    // Exportar PDF
    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Créditos Pendentes", 20, 10);
        let y = 20;
        creditosPaginados.forEach((credito, index) => {
            doc.text(`${index + 1}. Nome: ${credito.nome} | Valor: R$ ${credito.valor} | Prazo: ${credito.prazo}`, 20, y);
            y += 10;
        });
        doc.save("Relatorio_Creditos.pdf");
    };

    return (
        <Layout>
            <div className="flex flex-col items-center p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro de Créditos</h1>

                {/* Formulário de Cadastro */}
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                    <h2 className="text-xl font-semibold mb-4">Novo Crédito</h2>
                    <input type="text" placeholder="Nome do Devedor" className="w-full p-2 border rounded mb-3" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <input type="number" placeholder="Valor (R$)" className="w-full p-2 border rounded mb-3" value={valor} onChange={(e) => setValor(e.target.value)} />
                    
                    {/* Dropdown de Prazo */}
                    <select className="w-full p-2 border rounded mb-3" value={prazo} onChange={(e) => setPrazo(e.target.value)}>
                        <option value="semanal">Semanal</option>
                        <option value="15dias">15 dias</option>
                        <option value="45dias">45 dias</option>
                    </select>

                    <button onClick={handleAddCredito} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Adicionar Crédito</button>
                </div>

                {/* Tabela de Créditos */}
                <div className="mt-8 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Créditos Pendentes</h2>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Nome</th>
                                <th className="p-2">Valor</th>
                                <th className="p-2">Prazo</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {creditosPaginados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-gray-500">
                                        Nenhum crédito pendente.
                                    </td>
                                </tr>
                            ) : (
                                creditosPaginados.map((credito) => (
                                    <tr key={credito.id} className="border-t">
                                        <td className="p-2">{credito.nome}</td>
                                        <td className="p-2">R$ {credito.valor}</td>
                                        <td className="p-2">{credito.prazo}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-white ${credito.status === "pago" ? "bg-green-500" : "bg-red-500"}`}>
                                                {credito.status}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <select 
                                                className="p-1 border rounded"
                                                value={credito.status}
                                                onChange={(e) => handleUpdateStatus(credito.id, e.target.value)}
                                            >
                                                <option value="por pagar">Por Pagar</option>
                                                <option value="pago">Pago</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <button onClick={exportarPDF} className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200">
                    Exportar PDF
                </button>
            </div>
        </Layout>
    );
};

export default Credito;