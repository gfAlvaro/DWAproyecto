export interface CartItem {
  productoID: string | number;
  nombreProducto: string;
  precio: number;
  slug: string;
  imagen?: string;
  cantidad: number;
}
