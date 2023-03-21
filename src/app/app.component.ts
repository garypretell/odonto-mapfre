import { Component, ElementRef, ViewChild } from '@angular/core';
import { Engine } from './files/core/engine';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('canvasRef', { static: false }) canvasRef!: ElementRef;

  public width: number = 648;
  public height: number = 500;

  private cx!: CanvasRenderingContext2D;
  engine = new Engine();

  ngAfterViewInit(): void {
    this.render();
  }

  private render() {
    const canvasEl = this.canvasRef.nativeElement;
    this.cx = canvasEl.getContext('2d');
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    let dataArray =
      '11,29,X,,,,0,0,0,0,0,,12,44,X,,,,0,0,0,0,0,,12,29,X,,,,0,0,0,0,0,,13,44,X,,,,0,0,0,0,0,,13,29,X,,,,0,0,0,0,0,,14,32,X,,,,0,0,0,0,0,,14,29,X,,,,0,0,0,0,0,,15,33,X,,,,0,0,0,0,0,,15,29,X,,,,0,0,0,0,0,,16,32,X,,,,0,0,0,0,0,,16,29,X,,,,0,0,0,0,0,,17,6,X,,HP,HM,-1,0,0,0,0,,17,29,X,,HP,HM,0,0,0,0,0,,18,29,X,S,,,0,0,0,0,0,,18,40,V,S,,,-1,0,0,0,0,,21,29,X,,,,0,0,0,0,0,,21,28,X,,,,0,0,0,0,0,,22,29,X,,,,0,0,0,0,0,,22,28,X,,,,0,0,0,0,0,,23,41,X,S,,,0,0,0,0,0,,23,29,X,S,,,0,0,0,0,0,,23,40,V,S,,,-1,0,0,0,0,,24,29,X,HP,HM,O,0,0,0,0,0,,24,0,X,HP,HM,O,-1,1,1,1,1,,25,29,X,,,,0,0,0,0,0,,26,29,X,,,,0,0,0,0,0,,27,6,X,,,,-1,0,0,0,0,,27,29,X,,,,0,0,0,0,0,,28,29,X,,,,0,0,0,0,0,,31,23,X,HM,HP,O,0,0,0,0,0,,31,29,X,HM,HP,O,0,0,0,0,0,,31,0,X,HM,HP,O,-1,1,1,1,1,,32,23,X,HP,HM,O,0,0,0,0,0,,32,29,X,HP,HM,O,0,0,0,0,0,,32,0,X,HP,HM,O,-1,1,1,1,1,,33,23,X,,,,0,0,0,0,0,,33,29,X,,,,0,0,0,0,0,,34,44,X,S,,,0,0,0,0,0,,34,29,X,S,,,0,0,0,0,0,,34,40,L,S,,,-1,0,0,0,0,,35,6,X,,,,-1,0,0,0,0,,35,29,X,,,,0,0,0,0,0,,36,29,X,,,,0,0,0,0,0,,37,29,X,,,,0,0,0,0,0,,38,29,X,,,,0,0,0,0,0,,41,29,X,,,,0,0,0,0,0,,42,29,X,,,,0,0,0,0,0,,43,29,X,,,,0,0,0,0,0,,44,29,X,,,,0,0,0,0,0,,45,44,X,,,,0,0,0,0,0,,45,6,X,,,,-1,0,0,0,0,,45,29,X,,,,0,0,0,0,0,,46,29,X,,,,0,0,0,0,0,,47,29,X,HP,HM,O,0,0,0,0,0,,47,0,X,HP,HM,O,-1,1,1,1,1,,48,29,X,S,,,0,0,0,0,0,,48,40,L,S,,,-1,0,0,0,0,,52,0,X,HP,HM,O,-1,1,1,1,1,,53,32,X,,,,1,0,0,0,0,,54,33,X,,,,0,0,0,0,0,,55,32,X,S,,,1,0,0,0,0,,55,40,V,S,,,-1,0,0,0,0,,61,23,X,,,,-1,0,0,0,0,,61,6,X,,,,-1,0,0,0,0,,62,23,X,S,,,-1,0,0,0,0,,62,40,V,S,,,-1,0,0,0,0,,63,23,X,HM,HP,O,-1,0,0,0,0,,63,0,X,HM,HP,O,-1,1,1,1,1,,71,32,X,,,,1,0,0,0,0,,72,33,X,HM,HP,O,0,0,0,0,0,,72,0,X,HM,HP,O,-1,1,1,1,1,,73,32,X,S,,,1,0,0,0,0,,73,40,L,S,,,-1,0,0,0,0,,81,6,X,,,,-1,0,0,0,0,,82,23,X,,,,-1,0,0,0,0,,83,23,X,,,,-1,0,0,0,0,,84,23,X,HP,HM,O,-1,0,0,0,0,,84,0,X,HP,HM,O,-1,1,1,1,1,,85,40,L,S,,,-1,0,0,0,0';
    this.engine.setCanvas(canvasEl);
    this.engine.init(0);

    this.engine.setDataSource(dataArray);

    canvasEl.addEventListener(
      'mousedown',
      (event: any) => {
        this.engine.onMouseClick(event);
      },
      false
    );

    canvasEl.addEventListener(
      'mousemove',
      (event: any) => {
        this.engine.onMouseMove(event);
      },
      false
    );

    window.addEventListener(
      'keydown',
      (event: any) => {
        this.engine.onButtonClick(event);
      },
      false
    );
  }
}
