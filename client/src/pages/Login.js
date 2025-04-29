    // frontend-rifa/src/pages/Login.js
    //import React, { useState } from 'react';
    import { useAuth } from '../context/AuthContext';
    import { useNavigate } from 'react-router-dom';
    import Draggable from 'react-draggable';
    import React, { useState, useRef } from 'react';
    import Swal from 'sweetalert2';
    import withReactContent from 'sweetalert2-react-content';
    
        const notiMySwal = withReactContent(Swal);

    const Login = () => {
      const [credentials, setCredentials] = useState({ email: '', password: '' });
      const { login } = useAuth();
      const navigate = useNavigate();    

      // Refs para Draggable (para evitar el uso de findDOMNode)
    const draggableRef = useRef(null);

    // Dentro del componente Login
  const handleForgotPassword = () => {
    navigate('/reset-password');
  };


      const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(credentials);
        if (success) {
          //alert("Usuario validado correctamente"); // o mejor con un toast
          notiMySwal.fire({
            icon: 'success',
            title: 'Inicio de sesion exitoso',
            html: <i>El usuario con email:<strong> {credentials.email} </strong>fue validado con exito</i>,
            imageUrl: "img/bienvenido.gif",
            imageWidth: 100,
            imageHeight: 100,
            //text: 'Usuario registrado con éxito',
            confirmButtonColor: '#198754' // color btn-success
            
          }).then(() => {
            navigate('/rifa');
          });
          //navigate('/rifa');
        } else {
          notiMySwal.fire({
            icon: 'error',
            title: 'Atención',
             html: `<i><strong>${credentials.email} </strong>, Error de email o password   no se pude ingresar a su usuario, intente de nuevo</i>`,
            imageUrl: "img/errorlogin.gif",
            imageWidth: 100,
            imageHeight: 100,
            //text: 'Usuario registrado con éxito',
            confirmButtonColor: '#3085d6',
          });    
          
        }
      };
      
      return (
        <div className="container mt-5">
          <h2>Iniciar Sesión</h2>

        {/* Texto flotante */}
        <div className="float-end mb-3 text-muted" style={{ cursor: 'pointer' }} onClick={handleForgotPassword}>
          ¿Olvidaste tu contraseña?
        </div>


    {/* Clearfix para que el contenedor abarque correctamente el flotante */}
    <div className="clearfix"></div>

          <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} className="form-control mb-2" required />
            <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="form-control mb-2" required />
            <button type="submit" className="btn btn-primary">Ingresar</button>
          </form>


          
          {/* Draggable con imagen y texto */}
          
            {/* Imagen en la parte superior */}
            <img
              src="/img/jesus.jpg" //Asegúrate de que esta imagen esté en public/img
              alt="Imagen de Jesus mi salvador"
              style={{
                width: '10%',
                height: 'auto',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            /> <h3><p style={{color:'blue', textAlign:'center'}}>para poder participar en la rifa, debes estar registrado y posteriormente iniciar sesión con tu correo y la clave que hayas utilizado en el registro, gracias por participar y colaborarme</p></h3>
          <div  className="overflow-y-auto p-4 rounded-xl mt-3" style={{ maxHeight: '70vh', backgroundColor: '#17a2b8', // cyan-ish fondo     color: '#f8f9fa', // texto beige/blanco claro  fontSize: '1rem',
            WebkitOverflowScrolling: 'touch', touchAction: 'manipulation', color:'whitesmoke'}}>
            <p >
              <lu >
                <li>
                  <i><strong style={{ color: 'beige' }}>Bienvenido y gracias por participar en la rifa pro_quimioterapia Erwin.</strong></i> 
                </li>
              </lu><br />
              💡
              Para entrar a nuestra página y participar en la rifa de $300000 COP (Trescientos mil pesos colombianos) debe estar registrado en la plataforma y posteriormente ingresar con su usuario y contraseña. La rifa funciona de la manera siguiente:
              participas con el número de cuatro cifras generado por el botón "Generar Número" y esta es la cantidad que debes pagar, por ejemplo, si se genera el número "0214" cancelas $214 COP y con este número participas en la rifa y si deseas participar con más números, da clic en el botón nuevamente (no es obligatorio), si decides generar otro número y te sale "1026", cancelas en total la suma de los dos números: $1240 COP y con estos dos números tienes oportunidad de ganar (Puedes generar los números deseados hasta un máximo de cinco números, pero no es necesario hacerlo si solo quieres participar con uno, dos, ..., cinco números esta bien). <br /><br />
              <li><strong>Tenga en cuenta:</strong> </li><br />
              <ul>
                <ol>
                  <li><strong>Tenga en cuenta que por cada vez que genere un número en la sesión, lo que cancela va aumentando, porque es la suma de los números generados en una sola sesión o en varias, esto se puede ver en la tabla inferior, donde se van mostrando los números jugados y el pago total de estos.</strong> </li>
                  <li><strong>El usuario puede participar con un sólo número generado aleatoriamente por el botón "Generar Números" y si desea más boletas o números para la rifa, debe (solo si lo desea) hacer clik en el botón, tendrá como máximo cinco posiblidades en total de generar un número para la rifa, por usuario.</strong> </li>
                    <li><strong>La rifa pro-quimioterapia Erwin, juega el día sábado 31 de mayo del 2025.</strong> </li>
                    <li><strong>Debes registrar tu usuario y proporcionar los datos solicitados.</strong> </li>
                    <li><strong>Iniciar sesión con tu correo y la clave que seleccionaste.</strong> </li>
                    <li><strong>Todo número/s de la rifa debe estar cancelado para el pago del premio y se debe enviar o subir el comprobante de pago al celular <strong>3142999274</strong> a Nequi o Daviplata a nombre de <strong>Vilma o Vilme</strong>. Gracias por su colaboración.</strong> </li>
                    <li><strong>Las oportunidades para ganar son proporcionales a los números generados.</strong> </li>
                    <li><strong>Los comprobantes subidos a la plataforma deben ser de un operador valido como por ejemplo Nequi o Daviplata entre otros al número proporcionado en la página.</strong> </li>
                    <li><strong>El número menor generado por el sistema es el "0000" y el mayor es "9999".</strong> </li>                    
                    
                </ol>
              </ul>
            </p>
           </div>
          
        
      </div>
    );
  };


    export default Login;
