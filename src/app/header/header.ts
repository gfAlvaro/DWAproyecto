import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

export class Header {

  constructor(
    private authService: AuthService,
    public cartService: CartService
  ) {}
  
  get estaAutenticado(): boolean {
    return this.authService.isLoggedIn();
  }
}
