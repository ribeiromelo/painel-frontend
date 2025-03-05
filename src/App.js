import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute"; // Importando rota protegida
import Compras from "./pages/Compras";
import Feiras from "./pages/Feiras";
import Estoque from "./pages/Estoque";
import Financeiro from "./pages/Financeiro";
import Credito from "./pages/Credito";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Rotas protegidas */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/feiras" element={<Feiras />} />
                    <Route path="/estoque" element={<Estoque />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/credito" element={<Credito />} />
                    <Route path="/compras" element={<Compras />} /> {/* Nova rota */}
                </Route>

                {/* Redireciona rota raiz para Login */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
