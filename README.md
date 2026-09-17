# Tienda web con Angular, un proyecto para el máster de Desarrollo Web Avanzado

Este proyecto desarrolla una tienda web de acuerdo a las especificaciones de los proyectos del máster en Desarrollo Web Avanzado.

## Parte pública

En la parte pública hay una landing de inicio con descripciones sobre la tienda y botones CTA.

El header de la tienda cuenta con un nav donde poder acceder a las distintas secciones públicas de la tienda.

### Inicio

Esta opción del nav devuelve a la página de inicio de la web

### Sobre nosotros

Información sobre las personas responsables de la tienda y su trayectoria

### productos

Selección de productos disponibles en la tienda. Si se hace click en alguno de ellos aparecera la página individual del mismo

### contacto

Formulario de contacto para que el cliente pueda comunicarse con los responsables de la tienda

### botón para iniciar sesión

Lleva a un formulario para iniciar sesión, una vez hecho los usuarios podrán comprar los productos y ver su carrito de la compra en el header. El botón de iniciar sesión será entonces sustituido por el botón Mi cuenta que permite a los usuarios entrar en su panel privado.

## Panel privado de usuarios

Aquí los usuarios pueden consultar y modificar sus datos de perfil, ver su lista de pedidos y modificar su contraseña.

## Panel privado para administradores

La web cuenta con un acceso exclusivo para administradores donde podrán llevar a cabo las tareas propias de su rol. Esto es añadir, modificar y/o borrar los productos existentes en la web, consultar los pedidos y modificar su estado y ver los datos de los clientes

## Tecnologías aplicadas en la web

La web está desarrollada en Angular, y usa una API en Node.js que envía consultas a una base de datos en MySQL, alojada en el servidor proporcionado para el proyecto.