import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Verifique se o caminho está correto
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import './FormularioFilme.css';

// Removemos a 'interface'
function FormularioFilme({ filmeId, onNavegar }) {
  const { perfil } = useAuth();
  // Removemos os tipos <...>
  const [categorias, setCategorias] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [ano, setAno] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [diretor, setDiretor] = useState('');
  const [elenco, setElenco] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarCategorias();
    if (filmeId) {
      carregarFilme();
    }
  }, [filmeId]);

  const carregarCategorias = async () => {
    try {
      const { data } = await supabase.from('categorias').select('*').order('nome');
      if (data) {
        setCategorias(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const carregarFilme = async () => {
    if (!filmeId) return;
    // ... (o restante da sua função carregarFilme)
  };

  // Removemos a anotação de tipo (e: React.FormEvent)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (o restante da sua função handleSubmit)
  };

  // Removemos a anotação de tipo (categoriaId: string)
  const toggleCategoria = (categoriaId) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(categoriaId)
        ? prev.filter((id) => id !== categoriaId)
        : [...prev, categoriaId]
    );
  };

  return (
    <div className="formulario">
      {/* ... (Todo o seu JSX do formulário) ... */}
    </div>
  );
}

export default FormularioFilme;