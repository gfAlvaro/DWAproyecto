import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importa ChangeDetectorRef
import { AdminPedidosService } from '../../core/services/admin-pedidos.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class AdminPedidos implements OnInit {
  
  private pedidosSubject = new BehaviorSubject<any[]>([]);
  pedidos$: Observable<any[]> = this.pedidosSubject.asObservable();

  estadosDisponibles: string[] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
  
  pedidoExpandidoID: number | null = null;
  detallesCargados: any[] = [];

  // 2. Inyéctalo en tu constructor junto a tu servicio
  constructor(
    private dataService: AdminPedidosService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.dataService.obtenerPedidos().subscribe({
      next: (data) => this.pedidosSubject.next(data),
      error: (err) => console.error('Error al cargar pedidos', err)
    });
  }

  toggleDetalles(pedidoID: number): void {
    if (this.pedidoExpandidoID === pedidoID) {
      this.pedidoExpandidoID = null;
      this.detallesCargados = [];
      this.cdr.detectChanges(); // Forzamos actualización al cerrar
      return;
    }

    this.dataService.getDetallesPedido(pedidoID).subscribe({
      next: (detalles) => {
        this.pedidoExpandidoID = pedidoID;
        this.detallesCargados = detalles;
        
        // 3. CRÍTICO: Obliga a Angular a revisar la vista y pintar el @if / *ngIf
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al cargar los detalles del pedido', err)
    });
  }

  onEstadoChange(pedidoId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstado = selectElement.value;

    this.dataService.cambiarEstado(pedidoId, nuevoEstado).subscribe({
      next: (res) => {
        const listaActual = this.pedidosSubject.value;
        const pedidoModificado = listaActual.find(p => p.pedidoID === pedidoId);
        if (pedidoModificado) {
          pedidoModificado.estado = nuevoEstado;
          this.pedidosSubject.next([...listaActual]);
          this.cdr.detectChanges(); // Forzamos actualización al cambiar estado
        }
      },
      error: (err) => console.error('Error al actualizar estado', err)
    });
  }

  obtenerRutaImagen(pathOriginal: string): string {
    if (!pathOriginal){
      return '';
    }
    
    let rutaLimpia = pathOriginal.replace('public/', '');
    
    if (!rutaLimpia.startsWith('/')) {
      rutaLimpia = '/' + rutaLimpia;
    }
    
    return rutaLimpia;
  }
}
