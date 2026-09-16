import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})

export class CartService {

  private cartItemsSignal = signal<CartItem[]>(this.loadCartFromStorage());
  public items = this.cartItemsSignal.asReadonly();
  public totalProductos = computed(() => 
    this.cartItemsSignal().reduce((acc, item) => acc + item.cantidad, 0)
  );
  public precioTotal = computed(() => 
    this.cartItemsSignal().reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  );

  constructor() {}

  // Agregar producto al carrito
  agregarProducto(producto: any, cantidad: number = 1) {
    const itemsActuales = this.cartItemsSignal();
    // Buscamos si el producto ya existe por su ID
    const itemExistente = itemsActuales.find(i => i.productoID === producto.productoID);

    if (itemExistente) {
      // Si ya existe, incrementamos su cantidad
      itemExistente.cantidad += cantidad;
      this.cartItemsSignal.set([...itemsActuales]);
    } else {
      // Si es nuevo, lo añadimos mapeando los campos de tu API
      const nuevoItem: CartItem = {
        productoID: producto.productoID,
        nombreProducto: producto.nombreProducto || producto.name,
        precio: producto.precio,
        slug: producto.slug,
        imagen: producto.imagen || producto.imageUrl,
        cantidad: cantidad
      };
      this.cartItemsSignal.set([...itemsActuales, nuevoItem]);
    }
    this.saveCartToStorage();
  }

  // Eliminar un producto por completo
  eliminarProducto(productoID: string | number) {
    const filtrados = this.cartItemsSignal().filter(i => i.productoID !== productoID);
    this.cartItemsSignal.set(filtrados);
    this.saveCartToStorage();
  }

  // Modificar cantidad directamente (+ o -)
  actualizarCantidad(productoID: string | number, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminarProducto(productoID);
      return;
    }
    const itemsActuales = this.cartItemsSignal().map(item => {
      if (item.productoID === productoID) {
        return { ...item, cantidad };
      }
      return item;
    });
    this.cartItemsSignal.set(itemsActuales);
    this.saveCartToStorage();
  }

  // Vaciar el carrito
  vaciarCarrito() {
    this.cartItemsSignal.set([]);
    this.saveCartToStorage();
  }

  // Métodos de persistencia en LocalStorage
  private saveCartToStorage() {
    localStorage.setItem('fractals_cart', JSON.stringify(this.cartItemsSignal()));
  }

  private loadCartFromStorage(): CartItem[] {
    const saved = localStorage.getItem('fractals_cart');
    return saved ? JSON.parse(saved) : [];
  }
}
