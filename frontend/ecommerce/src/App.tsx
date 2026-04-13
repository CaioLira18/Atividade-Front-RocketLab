import './App.css'
import Navbar from './components/NavBar'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import ProdutoForm from './pages/ProdutoForm'
import ProdutoDetalhe from './pages/ProdutoDetalhe'
import Home from './pages/Home'
import Carrinho from './pages/Carrinho'

function App() {
  return (
    <div>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produtos/novo" element={<ProdutoForm />} />
        <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
        <Route path="/produtos/:id/editar" element={<ProdutoForm />} />
        <Route path="/carrinho" element={<Carrinho />} />
      </Routes>
    </div>
  )
}

export default App
