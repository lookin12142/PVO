import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Inicio = () => {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const codigoValido = '1234'; // puedes validar contra tu BD o archivo
    if (codigo === codigoValido) {
      navigate('/productos'); // o la ruta principal de tu app
    } else {
      setError('Código incorrecto. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Ingreso al Sistema</h1>
        
        <label className="block mb-2 text-sm font-medium text-gray-700">Código de acceso</label>
        <input
          type="password"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ingresa tu código"
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          onClick={handleLogin}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
};

export default Inicio;
