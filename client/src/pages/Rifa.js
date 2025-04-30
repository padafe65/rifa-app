    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { useCallback } from "react";
    import { useAuth } from '../context/AuthContext';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import Swal from 'sweetalert2';
    import withReactContent from 'sweetalert2-react-content';

    const notiMySwal = withReactContent(Swal);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    const formatearPesos = (monto) =>
      monto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    const Rifa = () => {
      //const { usuario } = useAuth();
      const [numeros, setNumeros] = useState([]);
      const [totalPago, setTotalPago] = useState(0);
      const [rifas, setRifas] = useState([]);
      const { usuario, userRole } = useAuth();
      const [cargando, setCargando] = useState(true);
      //const [imagenesPago, setImagenesPago] = useState({});
      const [filaActivaParaPago, setFilaActivaParaPago] = useState(null);
      const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState({});
      // Por estas:
      const [mensajesPorRifa, setMensajesPorRifa] = useState({});
      const [verComprobantePorRifa, setVerComprobantePorRifa] = useState({});
      const [botonDeshabilitado, setBotonDeshabilitado] = useState(false);
      const [cantidadJugados, setCantidadJugados] = useState();
      const [generarDeshabilitado, setGenerarDeshabilitado] = useState(false);



      const pagarRifa1 = (id) => {
        setFilaActivaParaPago(id); // Habilita la subida solo en esta fila
      };
      
      const manejarCambioImagen = (e, rifaId) => {
        const file = e.target.files[0];
        setImagenesSeleccionadas((prev) => ({
          ...prev,
          [rifaId]: file
        }));
      };
      

      

      const subirComprobantePago = async (rifaId) => {
        const imagen = imagenesSeleccionadas[rifaId];
        if (!imagen) {
          setMensajesPorRifa((prev) => ({ ...prev, [rifaId]: "❌ Debes seleccionar una imagen primero." }));
          return;
        }
      
        const rifaSeleccionada = rifas.find((r) => r.id === rifaId);
        const numeros = rifaSeleccionada?.numeros || "N/D";
  

        const formData = new FormData();
        formData.append("imagen", imagen);
      
        try {
          const respuesta = await axios.post(`${API_URL}/api/subir-comprobante/${rifaId}`, formData);
          notiMySwal.fire({
            icon: 'success',
            title: 'Atención',
            html: `<i><strong> ${usuario.nombre} </strong>,  participas con los números: ${numeros}, habilitados gracias por tu colaboración y pago</i>`,
            imageUrl: "img/pago.gif",
            imageWidth: 100,
            imageHeight: 100,            
            confirmButtonColor: '#3085d6',
          }); 
          setMensajesPorRifa((prev) => ({ ...prev, [rifaId]: "✅ Comprobante subido con éxito." }));
          setVerComprobantePorRifa((prev) => ({ ...prev, [rifaId]: true }));
          cargarRifas();
          setFilaActivaParaPago(null);
          // Opcional: si deseas refrescar la lista completa
        } catch (error) {
          console.error("Error al subir el comprobante:", error);
          setMensajesPorRifa((prev) => ({ ...prev, [rifaId]: "❌ Hubo un error al subir el comprobante." }));
        }
      };
      
      

    // Definir cargarRifas con useCallback para evitar cambios en cada renderizado
    const cargarRifas = useCallback(async () => {
      try {
          let response;

          //console.log("👤 Rol detectado:", usuario?.rol); // Debug

          if (usuario?.rol === "admin") { 
          
              response = await axios.get(`${API_URL}/api/rifas`);
              
          } else {
          
              response = await axios.get(`${API_URL}/api/rifa/listar/${usuario.id}`);
              
          }

          setRifas(response.data);

           // ✅ Contar la cantidad total de números jugados por el usuario
          let totalNumerosJugados = 0;

          response.data.forEach(rifa => {
            if (rifa.numeros) {
              const numerosLista = rifa.numeros.split(",").map(n => n.trim()).filter(n => n !== "");
              totalNumerosJugados += numerosLista.length;
              
            }
          });

          // 👉 Guarda la cantidad en un estado si lo necesitas
          setCantidadJugados(totalNumerosJugados); // solo si lo necesitas en otra parte
          

        // Verifica la cantidad de números jugados por el usuario
        if (response.data.length >= 5) {
          setBotonDeshabilitado(true);
        } else {
          setBotonDeshabilitado(false);
        }

      } catch (error) {
          console.error("Error al cargar rifas:", error);
      }
    }, [userRole, usuario?.id]);

    useEffect(() => {
      if (usuario) {
        cargarRifas();
        setCargando(false);
      }
    }, [usuario, cargarRifas]);    
    

    const generarNumero = async () => {
      // Verificación inicial de límite
      if (rifas.length >= 5 || cantidadJugados >= 5) {
        await notiMySwal.fire({
          icon: 'info',
          title: 'Atención',
          html: `<i><strong>${usuario.nombre}</strong>, ya alcanzaste el límite de 5 números. Gracias por tu colaboración.</i>`,
          imageUrl: "img/limite.gif",
          imageWidth: 100,
          imageHeight: 100,
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false
        });
    
        // Guarda el estado actual
        guardarNumeros(numeros, totalPago);
        setGenerarDeshabilitado(true);
        return;
      }
    
      // Generar número único
      let nuevoNumero;
      do {
        nuevoNumero = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      } while (numeros.includes(nuevoNumero));
    
      // Cálculo nuevo estado
      const nuevosNumeros = [...numeros, nuevoNumero];
      const nuevoTotal = totalPago + parseInt(nuevoNumero, 10);
    
      // Actualiza el estado visual
      setNumeros(nuevosNumeros);
      setCantidadJugados(prev => prev + 1);
      setTotalPago(nuevoTotal);
    
      // Pregunta si desea generar otro número
      const resultado = await notiMySwal.fire({
        title: '¿Deseas generar otro número?',
        icon: 'question',
        html: `<i><strong>${usuario.nombre}</strong>, ¿Deseas participar con otro número de la rifa?</i>`,
        imageUrl: "img/jugarmas.gif",
        imageWidth: 100,
        imageHeight: 100,
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        confirmButtonColor: '#198754',
        cancelButtonColor: '#d33',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    
      // Si el usuario dice NO, guardar datos y desactivar el botón
      if (resultado.dismiss === notiMySwal.DismissReason.cancel || resultado.isDenied) {
        guardarNumeros(nuevosNumeros, nuevoTotal);
        setGenerarDeshabilitado(true);
      }
    };
    
    

    const guardarNumeros = async (numerosAGuardar, totalAGuardar) => {
      if (numerosAGuardar.length === 0) {
        notiMySwal.fire({
          icon: 'info',
          title: 'Atención',
          html: `<i><strong>${usuario.nombre}</strong>, debes generar al menos un número antes de guardar.</i>`,
          imageUrl: "img/numero.gif",
          imageWidth: 100,
          imageHeight: 100,
          confirmButtonColor: '#3085d6'
        });
        return;
      }
    
      try {
        const response = await axios.post(`${API_URL}/api/rifa/guardar`, {
          usuario_id: usuario.id,
          numeros: numerosAGuardar,
          totalPago: totalAGuardar
        });
    
        if (response.data.message === "Números guardados con éxito") {
          notiMySwal.fire({
            icon: 'info',
            title: 'Atención',
            html: `<i><strong>${usuario.nombre}</strong>, número/s guardados con éxito. Gracias por tu colaboración.</i>`,
            imageUrl: "img/guardar.gif",
            imageWidth: 100,
            imageHeight: 100,
            confirmButtonColor: '#3085d6'
          });
        }
    
        alert(response.data.message);
        setNumeros([]);
        setTotalPago(0);
        cargarRifas();
      } catch (error) {
        console.error("Error al guardar números:", error);
        notiMySwal.fire({
          icon: 'info',
          title: 'Atención',
          html: `<i><strong>${usuario.nombre}</strong>, error al guardar el o los números.</i>`,
          imageUrl: "img/errorpago.gif",
          imageWidth: 100,
          imageHeight: 100,
          confirmButtonColor: '#3085d6'
        });
      }
    };
    

      const pagarRifa = async (id) => {
        try {
          await axios.put(`${API_URL}/api/rifa/pagar/${id}`);
          alert("Pago realizado con éxito");
          cargarRifas();
        } catch (error) {
          console.error("Error al pagar:", error);
          alert("Hubo un error al procesar el pago.");
        }
      };

      return (
        <div className="container mt-5">
          <h2>Participar en la Rifa</h2>
          <button className="btn btn-success" onClick={generarNumero} disabled={botonDeshabilitado || generarDeshabilitado} variant="primary">
            Generar Número
          </button>          

          <div className="mt-3">
            <h4>Números Jugados:</h4>
            {numeros.map((num, index) => (
              <span key={index} className="badge bg-primary me-2">{num}</span>
            ))}
          </div>

            <h3>Total a pagar: ${formatearPesos(totalPago)}</h3>
            {totalPago < 1000 && <p className="text-danger">Por favor jugar almennos un o unos números más  hasta alcanzar una suma de los números juagados igual o mayor a  $1000 pesos si lo desea</p>}
            <h3>Oportunidades según números jugados: {cantidadJugados} / 5</h3>

            <h3>Rol detectado: {usuario.rol}</h3>
            <h3>Usuario en la sesión: {usuario.nombre}</h3>
            <h3>Id Usuario: {usuario.id}</h3>
            
          <h2 className="mt-5">Historial de Rifas</h2>

          <table className="table table-bordered table-striped table-hover text-center align-middle">

            <thead>
            <tr style={{ backgroundColor: '#198754', color: 'white', textAlign: 'center' }}>
                <th>Id rifa</th>
                <th>Usuario</th>
                <th>Usuario Id</th>
                <th>Números</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>              
                <th>Acciones</th>
                <th>Imagen</th>
              </tr>
            </thead>
            <tbody>
              {rifas.map((rifa) => (                
                <tr key={rifa.id} style={{ backgroundColor: 'red', color: 'white', fontSize: 16, textAlign: 'center', verticalAlign: 'middle' }}>
                  <td>{rifa.id}</td>
                  <td>{rifa.nombre_usuario || usuario.nombre}</td>
                  <td>{rifa.usuario_id || "No disponible"}</td>
                  <td>{JSON.parse(rifa.numeros).join(', ')}</td>
                  <td>${rifa.monto_total}</td>
                  <td>{rifa.estado}</td>
                  <td>{rifa.fecha}</td>
                  <td>
                    {rifa.estado === "Debe" && filaActivaParaPago !== rifa.id && (
                      <button className="btn btn-warning btn-sm"
                        onClick={() => pagarRifa1(rifa.id)}>
                        Pagar
                      </button>
                    )}

                    {rifa.estado === "Debe" && filaActivaParaPago === rifa.id && (
                      <>
                        <input type="file" accept="image/*" className="form-control mb-2"
                          onChange={(e) => manejarCambioImagen(e, rifa.id)} />
                        <button className="btn btn-success btn-sm"
                          onClick={() => subirComprobantePago(rifa.id)}>
                          Subir Comprobante
                        </button>
                      </>
                    )}

                    {rifa.estado === "Cancelado" && rifa.imagen_pago && (
                      <a  href={`${API_URL}/uploads/${rifa.imagen_pago}`} 
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-info btn-sm">
                        Ver Comprobante                        
                      </a>                      
                    )}
                  </td> 
                  
                  <td>
                    {rifa.estado === "Cancelado" && rifa.imagen_pago ? (
                      <img
                        src={`${API_URL}/uploads/${rifa.imagen_pago}`}
                        alt="Comprobante"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="badge bg-danger">Sin comprobante</span>
                    )}
                  </td>               
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    export default Rifa;

