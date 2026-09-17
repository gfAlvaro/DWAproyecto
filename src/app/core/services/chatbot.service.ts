import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private scriptInyectado = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  mostrar(): void {
    // 1. Si no se ha inyectado el script, lo fabricamos e insertamos el código interno
    if (!this.scriptInyectado) {
      const script = this.document.createElement('script');
      script.type = 'text/javascript';
      
      script.innerHTML = `
        (function(d,s,id){
            if(d.getElementById(id)){return;}
            var u='//www.beepychatbot.com/'+d.domain+'/eye.js?';
            if((h=d.location.href.split(/#ev!/)[1])) u += '?_e=' +h;
            else if((r=/.*\_evV=(\w+)\b.*/).test(c=d.cookie) ) u += '?_v='+c.replace(r,'$1');
            var js = d.createElement(s);
            js.src = u;js.id = id;
            var fjs = d.getElementsByTagName(s)[0];
            fjs.parentNode.insertBefore(js, fjs);
            })(document,'script','livebeep-script');
      `; 

      // Se inyecta en el <head> tal como te solicitó la plataforma
      this.document.head.appendChild(script);
      this.scriptInyectado = true;
      return;
    }

    // 2. Si ya existía pero el usuario regresó a la zona pública, lo volvemos a mostrar
    this.alternarVisibilidadWidget(true);
  }

  ocultar(): void {
    // Esconde el chat cuando el usuario ingresa a /admin o /client
    this.alternarVisibilidadWidget(false);
  }

  private alternarVisibilidadWidget(visible: boolean): void {
    // Selectores habituales que renderiza Beepy en el árbol HTML de tu navegador
    const widget = this.document.getElementById('beepy-chatbot-root') || 
                   this.document.querySelector('.beepy-chatbot-container') ||
                   this.document.getElementById('eye-chatbot');
                   
    if (widget) {
      (widget as HTMLElement).style.display = visible ? 'block' : 'none';
    }
  }
}
