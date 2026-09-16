import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart.model';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service'; // 1. Importa tu servicio de autenticación

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class Carrito {
  
  constructor(
    public cartService: CartService,
    private api: ClienteService,
    private authService: AuthService, // 2. Inyecta tu servicio de autenticación
    private router: Router
  ) {}

  aumentarCantidad(item: CartItem) {
    this.cartService.actualizarCantidad(item.productoID, item.cantidad + 1);
  }

  disminuirCantidad(item: CartItem) {
    this.cartService.actualizarCantidad(item.productoID, item.cantidad - 1);
  }

  eliminarItem(productoID: string | number) {
    this.cartService.eliminarProducto(productoID);
  }

  limpiarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar tu carrito?')) {
      this.cartService.vaciarCarrito();
    }
  }

procederAlPago() {
  if (this.cartService.items().length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const clienteIDLogueado = this.authService.getCliente()?.clienteID; 
  if (!clienteIDLogueado) {
    alert('Debes iniciar sesión.');
    return;
  }

  const datosMaestro = {
    clienteID: Number(clienteIDLogueado),
    total: Number(this.cartService.precioTotal()) 
  };

  console.log('1. Guardando Pedido Maestro...');
  
  this.api.crearPedidoMaestro(datosMaestro).subscribe({
    next: (resMaestro) => {
      const nuevoPedidoID = resMaestro.pedidoID;
      console.log('Pedido Maestro Creado ID:', nuevoPedidoID);

      const detallesEnvio = this.cartService.items().map(item => {
        return this.api.crearPedidoDetalle({
          pedidoID: Number(nuevoPedidoID),
          productoID: Number(item.productoID),
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precio)
        });
      });

      import('rxjs').then(({ forkJoin }) => {
        forkJoin(detallesEnvio).subscribe({
          next: () => {
            this.cartService.vaciarCarrito();        
            alert(`🎉 ¡Pedido efectuado con éxito! Número de orden: #${nuevoPedidoID}`);
            this.router.navigate(['/mi-cuenta']);
          },
          error: (errDetalle) => {
            console.error('Error al guardar los artículos:', errDetalle);
            alert('El pedido maestro se creó, pero hubo un problema al guardar los productos.');
          }
        });
      });
    },
    error: (errMaestro) => {
      console.error('Error en Maestro:', errMaestro);
      alert('Error crítico del servidor al inicializar el pedido.');
    }
  });
}

}
