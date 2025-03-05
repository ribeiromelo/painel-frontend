import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const Estoque = () => {
    const [produtos, setProdutos] = useState([]);
    const [nome, setNome] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [unidade, setUnidade] = useState("sacas"); // Valor padrão
    const [paginaAtual, setPaginaAtual] = useState(1);
    const registrosPorPagina = 20;

    // Carregar produtos da API
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/estoque/")
            .then((res) => res.json())
            .then((data) => setProdutos(data))
            .catch((err) => console.error("Erro ao carregar produtos:", err));
    }, []);

    const handleAddProduto = () => {
        if (!nome || !quantidade || !unidade) {
            alert("Preencha todos os campos!");
            return;
        }

        const novoProduto = {
            nome,
            quantidade,
            unidade
        };

        fetch("http://127.0.0.1:8000/api/estoque/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoProduto),
        })
        .then((res) => res.json())
        .then((data) => setProdutos([...produtos, data]))
        .catch((err) => console.error("Erro ao adicionar produto:", err));

        setNome("");
        setQuantidade("");
        setUnidade("sacas"); // Reset para o padrão
    };

    // Paginação
    const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const produtosPaginados = produtos.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(produtos.length / registrosPorPagina);

    return (
        <Layout>
            <div className="flex flex-col items-center p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Estoque</h1>

                {/* Formulário de Cadastro */}
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                    <h2 className="text-xl font-semibold mb-4">Novo Produto</h2>
                    <input type="text" placeholder="Nome do Produto" className="w-full p-2 border rounded mb-3" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <input type="number" placeholder="Quantidade" className="w-full p-2 border rounded mb-3" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                    
                    {/* Dropdown para unidade de medida */}
                    <select className="w-full p-2 border rounded mb-3" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
                        <option value="sacas">Sacas</option>
                        <option value="litros">Litros</option>
                        <option value="pacotes">Pacotes</option>
                        <option value="unidades">Unidades</option>
                        <option value="quilos">Quilos</option>
                        <option value="garrafas">Garrafas</option>
                    </select>

                    <button onClick={handleAddProduto} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Adicionar Produto</button>
                </div>

                {/* Tabela de Produtos */}
                <div className="mt-8 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Produtos em Estoque</h2>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Nome</th>
                                <th className="p-2">Quantidade</th>
                                <th className="p-2">Unidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtosPaginados.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center p-4 text-gray-500">
                                        Nenhum produto cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                produtosPaginados.map((produto) => (
                                    <tr key={produto.id} className="border-t">
                                        <td className="p-2">{produto.nome}</td>
                                        <td className="p-2">{produto.quantidade}</td>
                                        <td className="p-2">{produto.unidade}</td>
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
                </div>
            </div>
        </Layout>
    );
};

export default Estoque;
