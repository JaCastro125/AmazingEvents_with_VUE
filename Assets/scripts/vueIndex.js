const { createApp } = Vue;

const appIndex = createApp({
  data() {
    return {
      //variable que resume el link o acceso a JSON en este caso
      apiUrl: "../Assets/json/amazing.json",

      //variable general, usada en el todo el codigo
      tarjetas: [],

      //variables usadas en home, upCommings y pastEvents
      tarjetasAMostrar: [],
      tarjetasAMostrarPasadas: [],
      tarjetasAMostrarFuturas: [],
      tarjetasPasadas: [],
      tarjetasfuturas: [],

      //variable para ser usada en details
      tarjetaInfo: [],

      //variables de criterios de filtro
      texto: "",
      categorias: [],
      categoriasSeleccionadas: [],

      //variables de contact
      nombre: "",
      email: "",
      mensaje: "",
      eventWithHighestAttendancePercentage: [],
    };
  },
  created() {
    this.pedirDatos();
  },
  methods: {

    //------------------------------codigo para traer los datos del JSON o Url

    pedirDatos() {
      fetch(this.apiUrl)
        .then((response) => response.json())
        .then((datosApi) => {
          //carga la variable tarjetas
          this.tarjetas = datosApi.events;

          //carga variables para upComming y pastEvents
          this.time = datosApi.currentDate;
          this.tarjetasPasadas = this.tarjetas.filter(
            (event) => event.date < this.time);
          this.tarjetasfuturas = this.tarjetas.filter(
            (event) => event.date > this.time);

          // carga las variables nuevamente despues de aplicar filtros
          this.tarjetasAMostrar = this.tarjetas;
          this.tarjetasAMostrarPasadas = this.tarjetasPasadas;
          this.tarjetasAMostrarFuturas = this.tarjetasfuturas;
          this.extraerCategorias(datosApi.events);

          //carga cariable despues de buscar y comparar los id para la pagina details
          const queryString = window.location.search;
          const urlParams = new URLSearchParams(queryString);
          const id = urlParams.get('id');
          this.tarjetaInfo = this.tarjetas.find(tarjeta => tarjeta._id == id);
        })
        .catch((error) => console.log(error.message));
    },
    extraerCategorias(array) {
      array.forEach((elemento) => {
        if (!this.categorias.includes(elemento.category) && elemento.category) {
          this.categorias.push(elemento.category);
        }
      });
    },

    //------------------------------codigo para validar y enviar los datos de contacto

    validarNombre() {
      const regex = /^[A-Za-z]+$/;
      return regex.test(this.nombre);
    },
    validarEmail() {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(this.email);
    },
    validarMensaje() {
      return this.mensaje.length >= 2;
    },
    enviar() {
      if (!this.validarNombre()) {
        alert("Please enter a valid name.");
        return;
      }
      if (!this.validarEmail()) {
        alert("Please enter a valid email address.");
        return;
      }
      if (!this.validarMensaje()) {
        alert("Please enter a message of at least two characters.");
        return;
      }

      const destinatario = "consult.events@event.com";
      const asunto = "Query about event";
      const cuerpo = `Nombre: ${this.nombre}%0D%0A%0D%0AEmail: ${this.email}%0D%0A%0D%0AMensaje: ${this.mensaje}`;

      window.location.href = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;

      this.limpiar();
    },
    limpiar() {
      this.nombre = "";
      this.email = "";
      this.mensaje = "";
    },

    //------------------------------codigo para calcular ganancias y porcentajes de cada categoria
    statsPasadas() {
      const resultado = this.tarjetasPasadas.reduce(  //-------------------------------------------------------------------------------
        (resultado, dato) => {
          const categoria = dato.category;
          if (!resultado.categorys.includes(categoria)) {
            resultado.categorys.push(categoria);
            resultado.ganancias[categoria] = 0;
            resultado.attendance[categoria] = 0;
            resultado.capacidad[categoria] = 0;
          }
          const attendances = dato.assistance ?? dato.estimate;
          resultado.ganancias[categoria] += dato.price * attendances;
          resultado.attendance[categoria] += attendances;
          resultado.capacidad[categoria] += dato.capacity;
          return resultado;
        },
        {
          categorys: [],
          ganancias: {},
          porcentajes: {},
          attendance: {},
          capacidad: {},
        }
      );
      resultado.categorys.forEach((categoria) => {
        resultado.porcentajes[categoria] =
          (resultado.attendance[categoria] / resultado.capacidad[categoria]) * 100;
      });
      return resultado;
    },
    statsFuturas() {
      const resultado = this.tarjetasfuturas.reduce(  
        (resultado, dato) => {
          const categoria = dato.category;
          if (!resultado.categorys.includes(categoria)) {
            resultado.categorys.push(categoria);
            resultado.ganancias[categoria] = 0;
            resultado.attendance[categoria] = 0;
            resultado.capacidad[categoria] = 0;
          }
          const attendances = dato.assistance ?? dato.estimate;
          resultado.ganancias[categoria] += dato.price * attendances;
          resultado.attendance[categoria] += attendances;
          resultado.capacidad[categoria] += dato.capacity;
          return resultado;
        },
        {
          categorys: [],
          ganancias: {},
          porcentajes: {},
          attendance: {},
          capacidad: {},
        }
      );
      resultado.categorys.forEach((categoria) => {
        resultado.porcentajes[categoria] =
          (resultado.attendance[categoria] / resultado.capacidad[categoria]) * 100;
      });
      return resultado;
    }
  },
  computed: {

    //------------------------------codigo para superFiltro de Home, upCommings y pastEvents

    superFiltro() {
      let primerFiltro = this.tarjetas.filter((tarjeta) =>
        tarjeta.name.toLowerCase().includes(this.texto.toLowerCase())
      );
      if (!this.categoriasSeleccionadas.length) {
        this.tarjetasAMostrar = primerFiltro;
      } else {
        this.tarjetasAMostrar = primerFiltro.filter((tarjeta) =>
          this.categoriasSeleccionadas.includes(tarjeta.category)
        );
      }
    },
    superFiltroFuturo() {
      let primerFiltro = this.tarjetasfuturas.filter((tarjeta) =>
        tarjeta.name.toLowerCase().includes(this.texto.toLowerCase())
      );
      if (!this.categoriasSeleccionadas.length) {
        this.tarjetasAMostrarFuturas = primerFiltro;
      } else {
        this.tarjetasAMostrarFuturas = primerFiltro.filter((tarjeta) =>
          this.categoriasSeleccionadas.includes(tarjeta.category)
        );
      }
    },
    superFiltroPasado() {
      let primerFiltro = this.tarjetasPasadas.filter((tarjeta) =>
        tarjeta.name.toLowerCase().includes(this.texto.toLowerCase())
      );
      if (!this.categoriasSeleccionadas.length) {
        this.tarjetasAMostrarPasadas = primerFiltro;
      } else {
        this.tarjetasAMostrarPasadas = primerFiltro.filter((tarjeta) =>
          this.categoriasSeleccionadas.includes(tarjeta.category)
        );
      }
    },

    //------------------------------codigo para stats

    eventoConMayorAsistencia() {
      let nombreEventoConMayorAsistencia = "";
      let mayorPorcentajeAsistencia = 0;
      for (let i = 0; i < this.tarjetas.length; i++) {
        const asistencia = this.tarjetas[i].assistance || 0;
        const estimado = this.tarjetas[i].estimate || 0;
        const capacidad = this.tarjetas[i].capacity || 1;
        const porcentaje = ((asistencia || estimado) / capacidad) * 100;
        if (porcentaje > mayorPorcentajeAsistencia) {
          mayorPorcentajeAsistencia = porcentaje;
          nombreEventoConMayorAsistencia = this.tarjetas[i].name;
        }
      }
      return nombreEventoConMayorAsistencia;
    },
    eventoConMenorAsistencia() {
      let nombreEventoConMenorAsistencia = '';
      let porcentajeMenorAsistencia = Infinity;
      for (let i = 0; i < this.tarjetas.length; i++) {
        const asistencia = this.tarjetas[i].assistance || 0;
        const estimado = this.tarjetas[i].estimate || 0;
        const capacidad = this.tarjetas[i].capacity || 1;
        const porcentaje = ((asistencia || estimado) / capacidad) * 100;
        if (porcentaje < porcentajeMenorAsistencia) {
          porcentajeMenorAsistencia = porcentaje;
          nombreEventoConMenorAsistencia = this.tarjetas[i].name;
        }
      }
      return nombreEventoConMenorAsistencia;
    },
    eventoConMayorCapacidad() {
      const eventoMayorCapacidad = this.tarjetas.find(
        (event) => event.capacity === Math.max(...this.tarjetas.map((event) => event.capacity))
      );
      return eventoMayorCapacidad ? eventoMayorCapacidad.name : '';
    },
    categorysPasadas() {
      return this.statsPasadas().categorys;
    },
    gananciasPasadas() {
      return this.statsPasadas().ganancias;
    },
    porcentajesPasadas() {
      return this.statsPasadas().porcentajes;
    },
    categorysFuturas() {
      return this.statsFuturas().categorys;
    },
    gananciasFuturas() {
      return this.statsFuturas().ganancias;
    },
    porcentajesFuturas() {
      return this.statsFuturas().porcentajes;
    },
  },
}).mount("#appIndex");
