// src/components/ClienteDetail.jsx
import React, { useState, useEffect } from 'react';
import HealthCharts from './HealthCharts';
import './ClienteDetail.css';

const ClienteDetail = ({ clienteId }) => {
  // Estado para los datos del cliente
  const [cliente, setCliente] = useState(null);
  // Estado para el historial de salud
  const [historial, setHistorial] = useState([]);
  // Estado para el formulario de nuevo registro de salud
  const [nuevoRegistro, setNuevoRegistro] = useState({
    glucemia: '',
    tension_max: '',
    tension_min: '',
    peso: '',
    latidos: '',
    fecha: new Date().toLocaleDateString('es-ES') // Formato dd/mm/aaaa
  });

  // Simular carga de datos del cliente y su historial (en un caso real, harías fetch con el clienteId)
  useEffect(() => {
    // Datos de ejemplo del cliente
    const datosCliente = {
      id: clienteId,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '+34 123 456 789',
      empresa: 'Tech Solutions',
      perfil: 'Premium',
      importe_pendiente: 150.75
    };
    setCliente(datosCliente);

    // Historial de salud de ejemplo
    const historialEjemplo = [
      { id: 1, glucemia: 1.05, tension_max: 12, tension_min: 7, peso: 70, latidos: 80, fecha: '01/10/2023' },
      { id: 2, glucemia: 1.15, tension_max: 13, tension_min: 8, peso: 71, latidos: 90, fecha: '15/10/2023' },
      { id: 3, glucemia: 1.08, tension_max: 11, tension_min: 6, peso: 69, latidos: 82, fecha: '30/10/2023' },
      { id: 4, glucemia: 1.20, tension_max: 14, tension_min: 9, peso: 72, latidos: 95, fecha: '10/11/2023' },
      { id: 5, glucemia: 1.02, tension_max: 12, tension_min: 7, peso: 70, latidos: 78, fecha: '20/11/2023' },
    ];
    setHistorial(historialEjemplo);
  }, [clienteId]);

  // Manejar cambios en el formulario de nuevo registro
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoRegistro({
      ...nuevoRegistro,
      [name]: value
    });
  };

  // Agregar un nuevo registro al historial
  const agregarRegistro = () => {
    if (!nuevoRegistro.glucemia || !nuevoRegistro.tension_max || !nuevoRegistro.tension_min || !nuevoRegistro.peso || !nuevoRegistro.latidos || !nuevoRegistro.fecha) {
      alert('Por favor, complete todos los campos del formulario.');
      return;
    }

    const nuevoRegistroCompleto = {
      id: historial.length + 1,
      ...nuevoRegistro,
      glucemia: parseFloat(nuevoRegistro.glucemia),
      tension_max: parseInt(nuevoRegistro.tension_max),
      tension_min: parseInt(nuevoRegistro.tension_min),
      peso: parseFloat(nuevoRegistro.peso),
      latidos: parseInt(nuevoRegistro.latidos)
    };

    setHistorial([...historial, nuevoRegistroCompleto]);
    // Restablecer el formulario
    setNuevoRegistro({
      glucemia: '',
      tension_max: '',
      tension_min: '',
      peso: '',
      latidos: '',
      fecha: new Date().toLocaleDateString('es-ES')
    });
    alert('Registro de salud agregado exitosamente.');
  };

  // Funciones para el módulo financiero
  const pagarCompleto = () => {
    if (cliente.importe_pendiente > 0) {
      setCliente({ ...cliente, importe_pendiente: 0 });
      alert('Pago completo realizado.');
    }
  };

  const pagarParcial = (monto) => {
    const montoNum = parseFloat(monto);
    if (montoNum > 0 && montoNum <= cliente.importe_pendiente) {
      setCliente({ ...cliente, importe_pendiente: cliente.importe_pendiente - montoNum });
      alert(`Pago parcial de ${montoNum}€ realizado.`);
    } else {
      alert('Monto inválido o superior al importe pendiente.');
    }
  };

  // Lógica para determinar el estado de salud (alertas)
  const getEstadoGlucemia = (valor) => {
    if (valor < 1.10) return 'Baja';
    if (valor > 1.10) return 'Alta';
    return 'Normal';
  };

  const getEstadoTension = (max, min) => {
    const maxIdeales = [11, 12, 13];
    const minIdeales = [6, 7, 8];
    if (maxIdeales.includes(max) && minIdeales.includes(min)) return 'Ideal';
    return 'Fuera de rango';
  };

  const getEstadoLatidos = (valor) => {
    if (valor < 85) return 'Bajo';
    if (valor > 85) return 'Alto';
    return 'Normal';
  };

  if (!cliente) {
    return <div>Cargando datos del cliente...</div>;
  }

  return (
    <div className="cliente-detail">
      <h2>Ficha del Cliente</h2>

      {/* Datos Personales */}
      <div className="datos-personales">
        <h3>Datos Personales</h3>
        <p><strong>Nombre:</strong> {cliente.nombre} {cliente.apellido}</p>
        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        <p><strong>Empresa:</strong> {cliente.empresa}</p>
        <p><strong>Perfil:</strong> {cliente.perfil}</p>
      </div>

      {/* Módulo Financiero */}
      <div className="modulo-financiero">
        <h3>Módulo Financiero</h3>
        <p><strong>Importe pendiente de pago:</strong> {cliente.importe_pendiente.toFixed(2)}€</p>
        <div className="acciones-financieras">
          <button onClick={pagarCompleto} className="btn btn-success">
            Pagar importe completo
          </button>
          <div className="pago-parcial">
            <input
              type="number"
              placeholder="Monto parcial"
              id="montoParcial"
              step="0.01"
              min="0"
              max={cliente.importe_pendiente}
            />
            <button onClick={() => {
              const input = document.getElementById('montoParcial');
              pagarParcial(input.value);
              input.value = '';
            }} className="btn btn-warning">
              Pagar parcial
            </button>
          </div>
        </div>
      </div>

      {/* Módulo Sanitario - Formulario de Seguimiento */}
      <div className="modulo-sanitario">
        <h3>Formulario de Seguimiento Sanitario</h3>
        <div className="formulario-salud">
          <div className="form-group">
            <label>Glucemia (g/L):</label>
            <input
              type="number"
              name="glucemia"
              value={nuevoRegistro.glucemia}
              onChange={handleInputChange}
              step="0.01"
              placeholder="Ej: 1.10"
            />
          </div>
          <div className="form-group">
            <label>Tensión Máxima:</label>
            <input
              type="number"
              name="tension_max"
              value={nuevoRegistro.tension_max}
              onChange={handleInputChange}
              placeholder="Ej: 12"
            />
          </div>
          <div className="form-group">
            <label>Tensión Mínima:</label>
            <input
              type="number"
              name="tension_min"
              value={nuevoRegistro.tension_min}
              onChange={handleInputChange}
              placeholder="Ej: 7"
            />
          </div>
          <div className="form-group">
            <label>Peso (kg):</label>
            <input
              type="number"
              name="peso"
              value={nuevoRegistro.peso}
              onChange={handleInputChange}
              step="0.1"
              placeholder="Ej: 70.5"
            />
          </div>
          <div className="form-group">
            <label>Latidos (lpm):</label>
            <input
              type="number"
              name="latidos"
              value={nuevoRegistro.latidos}
              onChange={handleInputChange}
              placeholder="Ej: 85"
            />
          </div>
          <div className="form-group">
            <label>Fecha (dd/mm/aaaa):</label>
            <input
              type="text"
              name="fecha"
              value={nuevoRegistro.fecha}
              onChange={handleInputChange}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <button onClick={agregarRegistro} className="btn btn-primary">
            Agregar Registro
          </button>
        </div>
      </div>

      {/* Historial en Tabla */}
      <div className="historial-tabla">
        <h3>Historial de Salud</h3>
        {historial.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Glucemia (g/L)</th>
                <th>Tensión (Máx/Min)</th>
                <th>Peso (kg)</th>
                <th>Latidos (lpm)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.fecha}</td>
                  <td>
                    {registro.glucemia} 
                    <span className={`badge ${getEstadoGlucemia(registro.glucemia) === 'Normal' ? 'badge-success' : 'badge-danger'}`}>
                      {getEstadoGlucemia(registro.glucemia)}
                    </span>
                  </td>
                  <td>
                    {registro.tension_max}/{registro.tension_min}
                    <span className={`badge ${getEstadoTension(registro.tension_max, registro.tension_min) === 'Ideal' ? 'badge-success' : 'badge-warning'}`}>
                      {getEstadoTension(registro.tension_max, registro.tension_min)}
                    </span>
                  </td>
                  <td>{registro.peso}</td>
                  <td>
                    {registro.latidos}
                    <span className={`badge ${getEstadoLatidos(registro.latidos) === 'Normal' ? 'badge-success' : 'badge-danger'}`}>
                      {getEstadoLatidos(registro.latidos)}
                    </span>
                  </td>
                  <td>
                    {/* Podríamos agregar un estado general basado en todas las métricas */}
                    {getEstadoGlucemia(registro.glucemia) === 'Normal' && 
                     getEstadoTension(registro.tension_max, registro.tension_min) === 'Ideal' && 
                     getEstadoLatidos(registro.latidos) === 'Normal' ? (
                      <span className="badge badge-success">Saludable</span>
                    ) : (
                      <span className="badge badge-warning">Requiere atención</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay registros de salud para este cliente.</p>
        )}
      </div>

      {/* Gráficos de Evolución */}
      <div className="charts-section">
        <HealthCharts historial={historial} />
      </div>
    </div>
  );
};

export default ClienteDetail;