import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private scriptInyectado = false;

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {}

  mostrar(): void {

    // Primera carga de Beepy
    if (!this.scriptInyectado) {

      const script = this.document.createElement('script');
      script.type = 'text/javascript';

      script.innerHTML = `
        (function(d,s,id){
            if(d.getElementById(id)){return;}

            var u='//www.beepychatbot.com/'+d.domain+'/eye.js?';

            if((h=d.location.href.split(/#ev!/)[1]))
                u += '?_e=' + h;
            else if((r=/.*\\_evV=(\\w+)\\b.*/).test(c=d.cookie))
                u += '?_v=' + c.replace(r,'$1');

            var js = d.createElement(s);
            js.src = u;
            js.id = id;

            var fjs = d.getElementsByTagName(s)[0];
            fjs.parentNode.insertBefore(js, fjs);

        })(document,'script','livebeep-script');
      `;

      this.document.head.appendChild(script);

      this.scriptInyectado = true;

      // Beepy tarda unos instantes en crear el widget.
      // Cuando aparezca, contrae la ventana automáticamente.
      this.esperarYContraerBeepy();

      return;
    }

    // Si Beepy ya estaba cargado, muestra el widget.
    this.alternarVisibilidadWidget(true);
  }

  ocultar(): void {
    // Oculta Beepy en /admin y /client
    this.alternarVisibilidadWidget(false);
  }


  private esperarYContraerBeepy(): void {

  const intervalo = window.setInterval(() => {

    const panel = this.document.getElementById('lbContact');

    if (panel) {
      window.clearInterval(intervalo);

      const elemento = panel as HTMLElement;

      // Beepy lo crea inicialmente maximizado. Quita el estado maximizado.
      elemento.classList.remove('lbInvMaximized');

      // Añade el estado minimizado.
      elemento.classList.add('lbInvMinimized');
    }

  }, 100);

  // Seguridad
  window.setTimeout(() => {
    window.clearInterval(intervalo);
  }, 10000);
}
  // Muestra u oculta el widget completo.
  private alternarVisibilidadWidget(visible: boolean): void {

    const widget =
      this.document.getElementById('lbContact') ||
      this.document.getElementById('eye-chatbot') ||
      this.document.querySelector('.beepy-chatbot-container');

    if (widget) {
      (widget as HTMLElement).style.display =
        visible ? 'block' : 'none';
    }
  }
}

