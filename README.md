## Requerimientos del Sistema

### Requerimientos Funcionales (RF)

* **RF 1:** El sistema debe permitir dar de alta, modificar y eliminar películas de la cartelera y mostrar su título, sinopsis, duración e imagen.
* **RF 2:** El sistema debe permitir crear una película a una sala, fecha, horario, idioma (castellano o subtitulada) y la dimensión (2D, 3D, 4D o 5D).
* **RF 3:** El sistema debe permitir el registro de los usuarios capturando los datos como el mail, nombre, apellido, fecha de nacimiento, tipo de sangre, color de ojos y días de vacaciones anuales.
* **RF 4:** El sistema debe aplicar un cupón del 20% de descuento en la primera compra al usuario registrado.
* **RF 5:** El sistema debe permitir a usuarios no registrados a realizar la compra de entradas sin tener que crearse una cuenta.
* **RF 6:** El sistema debe mostrar el plano interactivo de la sala (20 filas numeradas con letras, compuestas por 3 bloques de 4, 20 y 4 columnas respectivamente) permitiendo ver la disponibilidad de asientos en tiempo real y seleccionar los deseados.
* **RF 7:** El sistema debe procesar el pago de las entradas seleccionadas (aplicando descuento si corresponde).
* **RF 8:** El sistema debe generar un documento PDF descargable tras confirmar la compra, el cual debe incluir el resumen de la entrada y un código QR único para la validación del acceso al cine.
* **RF 9:** El sistema debe permitir a los usuarios calificar películas con estrellas y dejar un comentario corto.
* **RF 10:** El sistema debe calcular y mostrar el promedio de calificaciones de cada película en la cartelera antes de la compra.
* **RF 11:** El sistema debe incluir un buscador de películas y un filtro por género (puede tener varios géneros una misma película).
* **RF 12:** El sistema debe mostrar en la pantalla principal las 3 películas más vendidas y contar con una sección de "Próximamente" para futuros estrenos.
* **RF 13:** El sistema debe permitir a los usuarios registrados activar alertas para recibir notificaciones cuando las entradas de una película en "Próximamente" se pongan a la venta.
* **RF 14:** El sistema debe permitir al administrador configurar el porcentaje de descuento del cupón de primera compra y crear cupones a mayores de edad.
* **RF 15:** El sistema debe permitir habilitar la preventa de entradas 7 días antes del estreno a un precio promocional configurable por película, volviendo automáticamente al precio normal una vez vencida la fecha.
* **RF 16:** El sistema debe permitir al administrador crear productos de Candy Bar y permitir al cliente comprarlos junto con la entrada.
* **RF 17:** El sistema debe permitir al administrador configurar combos promocionales a un precio fijo y mostrarlos en la pantalla de compra.
* **RF 18:** El sistema debe asignar automáticamente la sala al programar una película según los días y horarios seleccionados, y evitando que no se solape con otras funciones.
* **RF 19:** El sistema debe proveer una interfaz para el rol Empleado que permita validar entradas y consumiciones de Candy Bar, ya sea mediante la lectura del código QR o ingresando el código manualmente.
* **RF 20:** El sistema debe dar de baja / invalidar el QR una vez que la entrada o el producto del Candy Bar haya sido entregado.
* **RF 21:** El sistema debe generar un reporte administrativo con la facturación diaria acumulada y la cantidad de entradas vendidas.
* **RF 22:** El sistema debe acumular 1 punto por cada peso gastado por usuarios registrados y permitir canjearlos por entradas o productos de Candy Bar según el costo configurado por el admin.
* **RF 23:** El sistema debe mostrar en el perfil del usuario su saldo de puntos, historial de canjes, y la sección "Mis Películas" con el historial visual (póster, fecha y calificación) de las películas que ha visto.
* **RF 24:** El sistema debe permitir al cliente cancelar una compra realizada hasta 2 horas antes del inicio de la función.
* **RF 25:** En caso de cancelación, el sistema no realizará reembolsos monetarios, sino que cargará automáticamente el monto equivalente como crédito a favor en la cuenta del usuario.
* **RF 26:** El sistema debe permitir utilizar el crédito acumulado en el perfil del usuario como método de pago (parcial o total) en futuras compras de entradas o Candy Bar.
* **RF 27:** Las últimas 3 filas de cada sala (filas R, S y T) deben configurarse como categoría VIP, contando con un precio diferenciado superior.
* **RF 28:** El mapa interactivo de la sala debe resaltar de forma distinta las butacas VIP y mostrar una advertencia o confirmación clara del costo adicional antes de proceder al pago.
* **RF 29:** El sistema debe permitir al administrador exportar el reporte de facturación diaria/mensual a formatos PDF y Excel (.xlsx).
* **RF 30:** El panel de administración debe incluir gráficos estadísticos interactivos que muestren:
  * Las películas más vistas por semana y por mes.
  * El producto del Candy Bar más vendido.
* **RF 31:** El sistema debe registrar un historial no editable de acciones administrativas y operativas (creación de funciones, modificación de precios, validación de códigos QR), almacenando el usuario responsable, la acción realizada, la fecha y la hora exacta.

---

### Requerimientos No Funcionales (RNF)

* **RNF 1:** La aplicación debe estar desarrollada de forma integral en Angular, aplicando arquitectura orientada a componentes, servicios y buenas prácticas de desarrollo.
* **RNF 2:** La persistencia de datos, la gestión de autenticación de usuarios y el almacenamiento de archivos (pósters/imágenes) deben estar integrados mediante Supabase.
* **RNF 3:** El sistema debe estar configurado e implementado como una Progressive Web App (PWA), permitiendo su instalación en dispositivos y ofreciendo una experiencia optimizada.
* **RNF 4:** La actualización del plano de la sala y la ocupación de las butacas debe realizarse dinámicamente mediante suscripciones en tiempo real (Supabase Realtime / WebSockets) para evitar solapamientos entre compras simultáneas.
* **RNF 5:** La interfaz gráfica debe contar con un estilo visual trabajado, profesional y propio (evitando aspectos genéricos).
* **RNF 6:** Las vistas no deben depender de selectores por defecto difíciles de usar (para ingreso de fechas y horas) y deben estar estructuradas de forma que se evite el scroll vertical excesivo.
* **RNF 7:** La aplicación debe adaptarse y funcionar correctamente tanto en pantallas de escritorio como en dispositivos móviles (especialmente para la interfaz de escaneo de QR usada por empleados).
* **RNF 8:** La aplicación debe estar alojada en una plataforma de hosting en la nube (ej. Vercel, Netlify, Firebase) accesible mediante una URL pública funcional.
* **RNF 9:** El código fuente completo debe ser público/accesible en un repositorio de GitHub, el cual debe incluir un archivo README.md detallando la arquitectura del proyecto, tecnologías y decisiones técnicas tomadas.