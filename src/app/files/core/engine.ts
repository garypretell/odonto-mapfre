import { OdontogramaGenerator } from './odontograma-generator';
import { CollisionHandler } from './collision-handler';
import { Renderer } from './renderer';
import { Settings } from '../utils/settings';
import { Constants } from '../utils/constants';


export class Engine {
  canvas: any = null;

  canvas1: any = null;

  adultShowing = true;

  // array which contains all the teeth for an odontograma
  mouth: any = [];

  // array which holds all the spaces between teeth
  spaces: any = [];

  // array for an adult odontograma
  odontAdult: any = [];
  odontAdultcopy: any = [];

  // spaces for a adult odontograma
  odontSpacesAdult: any = [];

  // array for a child odontograma
  odontChild: any = [];
  odontChildtcopy: any = [];

  // spaces for a child odontograma
  odontSpacesChild: any = [];

  // renderer which will render everything on a canvas
  renderer = new Renderer();

  // helper to create odontograma
  odontogramaGenerator = new OdontogramaGenerator();

  // helper for handeling collision
  collisionHandler = new CollisionHandler();

  // settings for application
  settings = new Settings();

  // constants for application
  constants = new Constants();

  // value of the selected damage which should be added or removed
  selectedHallazgo: any = 0;

  // x position of the mouse pointer
  cursorX = 0;

  // y position of the mouse pointer
  cursorY = 0;

  // flag to toggle multiselection on or off
  multiSelect = false;

  // array to hold values for multiselection. When selecting
  // a range of teeth
  multiSelection: any = [];

  callback: any;

  preview = false;

  printPreviewPositionChange = 190;

  // object containing data for print preview
  treatmentData: any = {};

  // observer to consume click events
  observer: any;

  // flag to turn the observer on or off
  observerActivated = false;

  arrayRange: any = [];
  minimo = 0;
  maximo = 0;
  state = 0;
  statetext = 0;

  state2 = 0;
  state3 = 0;
  result: any = [];

  setCanvas(canvas: any) {
    console.log('Engine: setting canvas: ' + canvas);
    console.log(
      'Engine: canvas size (' + canvas.width + ', ' + canvas.height + ')'
    );
    this.canvas = canvas;
    this.renderer.init(this.canvas);
  }

  getXpos(event: any) {
    var boundingRect = this.canvas.getBoundingClientRect();

    return Math.round(event.clientX - boundingRect.left);
  }

  getYpos(event: any) {
    var boundingRect = this.canvas.getBoundingClientRect();

    return Math.round(event.clientY - boundingRect.top);
  }

  init(valor: any) {
    this.collisionHandler.setConstants(this.constants);

    // set up the odontograma
    this.odontogramaGenerator.setEngine(this);

    this.odontogramaGenerator.setSettings(this.settings);

    this.odontogramaGenerator.setConstants(this.constants);

    this.odontogramaGenerator.prepareOdontogramaAdult(
      this.odontAdult,
      this.odontSpacesAdult,
      this.canvas,
      valor
    );

    this.odontogramaGenerator.prepareOdontogramaChild(
      this.odontChild,
      this.odontSpacesChild,
      this.canvas,
      valor
    );

    this.mouth = this.odontAdult;

    console.log('carga inicial', this.mouth);

    this.spaces = this.odontSpacesAdult;
  }

  update() {
    this.renderer.clear(this.settings);

    if (!this.preview) {
      // render the teeth
      this.renderer.render(this.mouth, this.settings, this.constants);

      //render spaces
      this.renderer.render(this.spaces, this.settings, this.constants);

      if (this.settings.DEBUG) {
        this.renderer.renderText('DEBUG MODE', 2, 15, '#000000');

        this.renderer.renderText(
          'X: ' + this.cursorX + ', Y: ' + this.cursorY,
          128,
          15,
          '#000000'
        );
      }
    } else {
      this.printPreview();
    }
  }

  removeHighlight() {
    for (var i = 0; i < this.mouth.length; i++) {
      this.mouth[i].highlight = false;
    }
  }

  highlightMultiSelection(tooth: any) {
    try {
      // only highlight if we the selection is at least 1
      if (this.multiSelection.length > 0) {
        // reset the highlighting
        for (var i = 0; i < this.mouth.length; i++) {
          this.mouth[i].highlight = false;
          this.mouth[i].highlightColor = this.settings.COLOR_HIGHLIGHT;
        }

        var tooth1 = this.multiSelection[0];

        // check if these teeth are same types
        if (tooth1.type == tooth.type) {
          // get indices for both teeth
          var index1 = this.getIndexForTooth(tooth1);
          var index2 = this.getIndexForTooth(tooth);

          var begin = Math.min(index1, index2);
          var end = Math.max(index1, index2);

          // highlight the teeth between begin and end
          for (var i = begin; i <= end; i++) {
            this.mouth[i].highlight = true;
          }

          // some damages can only have 2 items in multiselection
          if (this.selectedHallazgo == this.constants.TRANSPOSICION_LEFT) {
            // if count of selection for this damage (max 2) then
            // change the highlight color, to show that this selection
            // is not allowed
            if (end - begin > 1) {
              for (var i = begin; i <= end; i++) {
                this.mouth[i].highlightColor =
                  this.settings.COLOR_HIGHLIGHT_BAD;
              }
            }
          }
        }

        // repaint
        this.update();
      }
    } catch (error: any) {
      console.log('Engine highlightMultiSelection e: ' + error.message);
    }
  }

  printMultiSelection() {
    console.log('Multi Select count: ' + this.multiSelection.length);
    for (var i = 0; i < this.multiSelection.length; i++) {
      console.log('multiSelection[' + i + ']: ' + this.multiSelection[i].id);
    }

    if (this.multiSelection.length > 0) {
      this.minimo = this.multiSelection[0].id;
      if (this.multiSelection.length > 1)
        this.maximo = this.multiSelection[this.multiSelection.length - 1].id;
      else this.maximo = this.minimo;

      if (this.minimo != this.maximo) {
        var arr1: any = [this.minimo, this.maximo];

        var valor = 0;
        for (var i = 0; i < this.arrayRange.length; i++) {
          if (
            this.arrayRange[i][0] == this.minimo &&
            this.arrayRange[i][1] == this.maximo
          ) {
            valor = 1;
            delete this.arrayRange[i][0];
            delete this.arrayRange[i][1];
          } else if (
            this.arrayRange[i][0] == this.maximo &&
            this.arrayRange[i][1] == this.minimo
          ) {
            valor = 1;
            delete this.arrayRange[i][0];
            delete this.arrayRange[i][1];
          }
        }

        if (valor == 0) {
          this.arrayRange.push(arr1);
        }
      }
      console.log(this.arrayRange);
    }
  }

  resetMultiSelect() {
    this.selectedHallazgo = '0';
    this.multiSelect = false;
    this.multiSelection.length = 0;
    this.removeHighlight();
    this.update();
  }

  getIndexForTooth(tooth: any) {
    var index = -1;

    for (var i = 0; i < this.mouth.length; i++) {
      if (this.mouth[i].id == tooth.id) {
        index = i;
        break;
      }
    }

    return index;
  }

  handleMultiSelection() {
    // only handle multiselect when 2 teeth have been selected
    // start and end
    if (this.multiSelection.length == 2) {
      var tooth1 = this.multiSelection[0];
      var tooth2 = this.multiSelection[1];

      // get the indices for the teeth which have been selected
      var index1 = this.getIndexForTooth(tooth1);
      var index2 = this.getIndexForTooth(tooth2);

      var valid = true;

      // make sure that we dont select the same tooth 2 times
      if (index1 == index2) {
        valid = false;
      }

      // make sure that both teeth are same type, upper or lower mouth
      if (tooth1.type !== tooth2.type) {
        valid = false;
      }

      // only toggle damages if everyhting is okey
      if (valid) {
        var start = Math.min(index1, index2);
        var end = Math.max(index1, index2);

        // check which damage should be added or removed from the selected
        // teeth
        if (this.selectedHallazgo == this.constants.ORTODONTICO_FIJO_END) {
          this.mouth[start].toggleDamage(
            this.constants.ORTODONTICO_FIJO_END,
            this.constants
          );

          this.mouth[end].toggleDamage(
            this.constants.ORTODONTICO_FIJO_END,
            this.constants
          );

          for (var i = start + 1; i <= end - 1; i++) {
            this.mouth[i].toggleDamage(
              this.constants.ORTODONTICO_FIJO_CENTER,
              this.constants
            );
          }
        } else if (
          this.selectedHallazgo == this.constants.PROTESIS_FIJA_LEFT
        ) {
          this.mouth[start].toggleDamage(
            this.constants.PROTESIS_FIJA_RIGHT,
            this.constants
          );

          this.mouth[end].toggleDamage(
            this.constants.PROTESIS_FIJA_LEFT,
            this.constants
          );

          for (var i = start + 1; i <= end - 1; i++) {
            this.mouth[i].toggleDamage(
              this.constants.PROTESIS_FIJA_CENTER,
              this.constants
            );
          }
        } else if (
          this.selectedHallazgo == this.constants.TRANSPOSICION_LEFT
        ) {
          if (end - start == 1) {
            this.mouth[start].toggleDamage(
              this.constants.TRANSPOSICION_LEFT,
              this.constants
            );

            this.mouth[end].toggleDamage(
              this.constants.TRANSPOSICION_RIGHT,
              this.constants
            );
          }
        } else if (
          this.selectedHallazgo == this.constants.ORTONDICO_REMOVIBLE
        ) {
          for (var i = start; i <= end; i++) {
            this.mouth[i].toggleDamage(
              this.constants.ORTONDICO_REMOVIBLE,
              this.constants
            );
          }
        }
      }

      // reset multiselection when it is finished
      this.multiSelection.length = 0;

      this.removeHighlight();

      this.update();
    }
  }

  addToMultiSelection(tooth: any) {
    this.multiSelection.push(tooth);

    this.printMultiSelection();

    if (this.multiSelection.length == 2) {
      this.handleMultiSelection();
    }
  }

  isAlphanumeric(input: any) {
    var valid = false;

    var letters = /^[0-9a-zA-Z]+$/;

    if (input.match(letters)) {
      valid = true;
    }

    return valid;
  }

  setTextToTextBox(textBox: any, text: any, text2?: any, text3?: any) {
    if (text !== null) {
      if (text.length < 4) {
        if (this.isAlphanumeric(text)) {
          //textBox.setNote(text);
          if (textBox.enumerador == 1) {
            textBox.setNote(text);
          }
          if (textBox.enumerador == 2) {
            textBox.setNote(text);
            if (text2 != undefined) textBox.setNote(text2);
          }
          if (textBox.enumerador == 3) {
            textBox.setNote(text);
            if (text3 != undefined) textBox.setNote(text3);
          }
          /**/
          console.log('else setTextToTextBox', textBox);
        } else if (text == '') {
          //textBox.setNote(text);
          if (textBox.enumerador == 1) {
            textBox.setNote(text);
          }
          if (textBox.enumerador == 2) {
            textBox.setNote(text);
            if (text2 != undefined) textBox.setNote(text2);
          }
          if (textBox.enumerador == 3) {
            textBox.setNote(text);
            if (text3 != undefined) textBox.setNote(text3);
          }
          /**/
          console.log('else setTextToTextBox', textBox);
        }
      }
    }
  }

  onTextBoxClicked(textBox: any) {
    if (!this.observerActivated) {
      var message = 'Escribe C\u00F3digo Dental. Max. 3 letras.';

      var text = prompt(message, '');
      console.log('onTextBoxClicked', textBox);
      this.setTextToTextBox(textBox, text);
    }
  }

  mouseRightClickSpace(event: any) {
    var shouldUpdate = false;

    for (var i = 0; i < this.spaces.length; i++) {
      // check collision for current space
      if (
        this.spaces[i].checkCollision(this.getXpos(event), this.getYpos(event))
      ) {
        this.spaces[i].popDamage();

        shouldUpdate = true;
      }
    }

    // only update if something new has occurred
    if (shouldUpdate) {
      this.update();
    }
  }

  mouseRightClickTooth(event: any) {
    console.log('ingresa e iso clic');
    var texto = '';
    var id = '';
    var inicio = 0;
    var fin = 0;

    if (this.mouth.length > 61) fin = 32;
    else fin = 20;

    var shouldUpdate = false;

    // loop through all teeth
    for (var i = 0; i < this.mouth.length; i++) {
      var codID;

      if (
        this.mouth[i].textBox.rect.checkCollision(
          this.getXpos(event),
          this.getYpos(event)
        )
      ) {
        if (this.selectedHallazgo == this.constants.IMPLANTE) {
          for (var j = 0; j < this.mouth[i].damages.length; j++) {
            if (this.mouth[i].damages[j].id == this.constants.IMPLANTE) {
              var valor = this.mouth[i].damages[j].statetext;

              if (this.mouth[i].damages[j].statetext == 1) {
                this.mouth[i].textBox.statetext = 0;
              } else {
                this.mouth[i].textBox.statetext = 1;
              }
              codID = this.mouth[i].damages[j].id;
              this.mouth[i].toggleDamageState(
                codID,
                undefined,
                this.mouth[i].textBox.statetext
              );
              break;
            }
          }
        }

        if (
          this.selectedHallazgo == this.constants.CORONA_DEFINITIVA ||
          this.constants.PULPAR
        ) {
          for (var j = 0; j < this.mouth[i].damages.length; j++) {
            if (
              this.mouth[i].damages[j].id ==
                this.constants.CORONA_DEFINITIVA ||
              this.mouth[i].damages[j].id == this.constants.PULPAR
            ) {
              var valor = this.mouth[i].damages[j].statetext;

              if (this.mouth[i].damages[j].statetext == 1) {
                this.mouth[i].textBox.statetext = 0;
              } else {
                this.mouth[i].textBox.statetext = 1;
              }
              codID = this.mouth[i].damages[j].id;

              this.mouth[i].toggleDamageState(
                codID,
                undefined,
                this.mouth[i].textBox.statetext
              );
              break;
            }
          }
        }
      }

      if (
        this.mouth[i].rect.checkCollision(
          this.getXpos(event),
          this.getYpos(event)
        )
      ) {
        if (this.selectedHallazgo == this.constants.ORTODONTICO_FIJO_END) {
          var cadena = '';
          for (var x = 0; x < this.arrayRange.length; x++) {
            cadena = cadena + this.arrayRange[x][0] + '-';
            cadena = cadena + this.arrayRange[x][1] + ',';
          }

          var ArregloEntero = [];
          if (cadena != '') {
            var arrayDeCadenas = cadena.split(',');
            for (var k = 0; k < arrayDeCadenas.length; k++) {
              if (arrayDeCadenas[k] != '') {
                var Array2 = arrayDeCadenas[k].split('-');

                var arr1 = Array2[0];
                var arr2 = Array2[1];
                var valorArr = [];
                if (arr1 > arr2) {
                  valorArr = [arr2, arr1];
                } else {
                  valorArr = [arr1, arr2];
                }
                ArregloEntero.push(valorArr);
              }
            }
          }

          for (var l = 0; l < ArregloEntero.length; l++) {
            var encontrar = 0;
            for (
              var m: any = ArregloEntero[l][0];
              m <= ArregloEntero[l][1];
              m++
            ) {
              if (this.mouth[i].id == m) {
                encontrar = 1;
                break;
              }
            }

            if (encontrar == 1) {
              for (
                var m: any = ArregloEntero[l][0];
                m <= ArregloEntero[l][1];
                m++
              ) {
                for (var n = 0; n < this.mouth.slice(0, fin).length; n++) {
                  if (this.mouth[n].id == m) {
                    if (this.mouth[n].damages.length > 1) {
                      for (var y = 0; y < this.mouth[n].damages.length; y++) {
                        if (
                          this.mouth[n].damages[y].id ==
                          this.constants.ORTODONTICO_FIJO_END
                        ) {
                          this.mouth[n].toggleDamageState(
                            this.mouth[n].damages[y].id
                          );
                          break;
                        }
                        if (
                          this.mouth[n].damages[y].id ==
                          this.constants.ORTODONTICO_FIJO_CENTER
                        ) {
                          this.mouth[n].toggleDamageState(
                            this.mouth[n].damages[y].id
                          );
                          break;
                        }
                      }
                    } else {
                      this.mouth[n].toggleDamageState(
                        this.mouth[n].damages[0].id
                      );
                    }
                  }
                }
              }
            }
          }
        }

        if (this.selectedHallazgo == this.constants.ORTONDICO_REMOVIBLE) {
          var cadena = '';
          for (var x = 0; x < this.arrayRange.length; x++) {
            cadena = cadena + this.arrayRange[x][0] + '-';
            cadena = cadena + this.arrayRange[x][1] + ',';
          }

          var ArregloEntero = [];
          if (cadena != '') {
            var arrayDeCadenas = cadena.split(',');
            for (var k = 0; k < arrayDeCadenas.length; k++) {
              if (arrayDeCadenas[k] != '') {
                var Array2 = arrayDeCadenas[k].split('-');

                var arr1 = Array2[0];
                var arr2 = Array2[1];
                var valorArr = [];
                if (arr1 > arr2) {
                  valorArr = [arr2, arr1];
                } else {
                  valorArr = [arr1, arr2];
                }
                ArregloEntero.push(valorArr);
              }
            }
          }

          for (var l = 0; l < ArregloEntero.length; l++) {
            var encontrar = 0;
            for (
              var m: any = ArregloEntero[l][0];
              m <= ArregloEntero[l][1];
              m++
            ) {
              if (this.mouth[i].id == m) {
                encontrar = 1;
                break;
              }
            }

            if (encontrar == 1) {
              for (
                var m: any = ArregloEntero[l][0];
                m <= ArregloEntero[l][1];
                m++
              ) {
                for (var n = 0; n < this.mouth.slice(0, fin).length; n++) {
                  if (this.mouth[n].id == m) {
                    if (this.mouth[n].damages.length > 1) {
                      for (var y = 0; y < this.mouth[n].damages.length; y++) {
                        if (
                          this.mouth[n].damages[y].id ==
                          this.constants.ORTONDICO_REMOVIBLE
                        ) {
                          this.mouth[n].toggleDamageState(
                            this.mouth[n].damages[y].id
                          );
                          break;
                        }
                      }
                    } else {
                      this.mouth[n].toggleDamageState(
                        this.mouth[n].damages[0].id
                      );
                    }
                  }
                }
              }
            }
          }
        }

        if (this.selectedHallazgo == this.constants.IMPLANTE) {
          for (var j = 0; j < this.mouth[i].damages.length; j++) {
            if (this.mouth[i].damages[j].id == this.constants.IMPLANTE) {
              var valor = this.mouth[i].damages[j].statetext;

              if (this.mouth[i].damages[j].statetext == 1) {
                this.mouth[i].textBox.statetext = 0;
              } else {
                this.mouth[i].textBox.statetext = 1;
              }
              this.mouth[i].damages[j].indicador = 1;
              this.mouth[i].damages[j].state = 1;
              codID = this.mouth[i].damages[j].id;
              this.mouth[i].toggleDamageState(
                codID,
                undefined,
                this.mouth[i].textBox.statetext
              );
              break;
            }
          }
        }

        if (
          this.selectedHallazgo == this.constants.CORONA_DEFINITIVA ||
          this.selectedHallazgo == this.constants.PULPAR
        ) {
          var posicion1 = 0;
          var posicion2 = 0;
          for (var j = 0; j < this.mouth[i].damages.length; j++) {
            if (
              this.mouth[i].damages[j].id ==
                this.constants.CORONA_DEFINITIVA ||
              this.mouth[i].damages[j].id == this.constants.PULPAR
            ) {
              this.mouth[i].textBox.statetext = 1;
              if (this.mouth.length > 60) {
                for (var k = 32; k < this.mouth.length; k++) {
                  if (
                    this.mouth[k].id == this.mouth[i].id &&
                    this.mouth[k].textBox.enumerador == 2
                  ) {
                    this.mouth[k].textBox.statetext = 1;
                    posicion1 = k;
                  }
                  if (
                    this.mouth[k].id == this.mouth[i].id &&
                    this.mouth[k].textBox.enumerador == 3
                  ) {
                    this.mouth[k].textBox.statetext = 1;
                    posicion2 = k;
                  }
                }
              } else if (this.mouth.length < 61) {
                for (var k = 20; k < this.mouth.length; k++) {
                  if (
                    this.mouth[k].id == this.mouth[i].id &&
                    this.mouth[k].textBox.enumerador == 2
                  ) {
                    this.mouth[k].textBox.statetext = 1;
                    posicion1 = k;
                  }
                  if (
                    this.mouth[k].id == this.mouth[i].id &&
                    this.mouth[k].textBox.enumerador == 3
                  ) {
                    this.mouth[k].textBox.statetext = 1;
                    posicion2 = k;
                  }
                }
              }

              this.mouth[i].damages[j].indicador = 1;
              this.mouth[i].damages[j].state = 1;
              codID = this.mouth[i].damages[j].id;
              this.mouth[i].toggleDamageState(
                codID,
                undefined,
                this.mouth[i].textBox.statetext
              );
              if (this.mouth.length > 60) {
                this.mouth[posicion1].toggleDamageState(
                  codID,
                  undefined,
                  this.mouth[posicion1].textBox.statetext
                );
                this.mouth[posicion2].toggleDamageState(
                  codID,
                  undefined,
                  this.mouth[posicion2].textBox.statetext
                );
              } else if (this.mouth.length < 61) {
                this.mouth[posicion1].toggleDamageState(
                  codID,
                  undefined,
                  this.mouth[posicion1].textBox.statetext
                );
                this.mouth[posicion2].toggleDamageState(
                  codID,
                  undefined,
                  this.mouth[posicion2].textBox.statetext
                );
              }
              break;
            }
          }
        }
        /**/

        if (this.selectedHallazgo == this.constants.PROTESIS_FIJA_LEFT) {
          var cadena = '';
          for (var x = 0; x < this.arrayRange.length; x++) {
            cadena = cadena + this.arrayRange[x][0] + '-';
            cadena = cadena + this.arrayRange[x][1] + ',';
          }
          var ArregloEntero = [];
          if (cadena != '') {
            var arrayDeCadenas = cadena.split(',');
            for (var k = 0; k < arrayDeCadenas.length; k++) {
              if (arrayDeCadenas[k] != '') {
                var Array2 = arrayDeCadenas[k].split('-');
                var arr1 = Array2[0];
                var arr2 = Array2[1];
                var valorArr = [];
                if (arr1 > arr2) {
                  valorArr = [arr2, arr1];
                } else {
                  valorArr = [arr1, arr2];
                }
                ArregloEntero.push(valorArr);
              }
            }
          }
          for (var l = 0; l < ArregloEntero.length; l++) {
            var encontrar = 0;
            for (
              var m: any = ArregloEntero[l][0];
              m <= ArregloEntero[l][1];
              m++
            ) {
              if (this.mouth[i].id == m) {
                encontrar = 1;
                break;
              }
            }
            if (encontrar == 1) {
              for (
                var m: any = ArregloEntero[l][0];
                m <= ArregloEntero[l][1];
                m++
              ) {
                for (var n = 0; n < this.mouth.slice(0, fin).length; n++) {
                  if (this.mouth[n].id == m) {
                    if (this.mouth[n].damages.length > 1) {
                      for (var y = 0; y < this.mouth[n].damages.length; y++) {
                        if (
                          this.mouth[n].damages[y].id ==
                          this.constants.PROTESIS_FIJA_LEFT
                        ) {
                          this.mouth[n].toggleDamageState(
                            this.mouth[n].damages[y].id
                          );
                          this.mouth[n].damages[y].direction = 0;
                          break;
                        }
                        if (
                          this.mouth[n].damages[y].id ==
                          this.constants.PROTESIS_FIJA_CENTER
                        ) {
                          this.mouth[n].toggleDamageState(
                            this.mouth[n].damages[y].id
                          );
                          this.mouth[n].damages[y].direction = -1;
                          break;
                        }
                        if (
                          this.mouth[n].damages[y].id ==
                          this.constants.PROTESIS_FIJA_RIGHT
                        ) {
                          this.mouth[n].toggleDamageState(
                            this.mouth[n].damages[y].id
                          );
                          this.mouth[n].damages[y].direction = 1;
                          break;
                        }
                      }
                    } else {
                      this.mouth[n].toggleDamageState(
                        this.mouth[n].damages[0].id
                      );
                    }
                  }
                }
              }
            }
          }
        }

        if (this.selectedHallazgo == this.constants.PROTESIS_REMOVIBLE) {
          for (var j = 0; j < this.mouth[i].damages.length; j++) {
            if (
              this.mouth[i].damages[j].id == this.constants.PROTESIS_REMOVIBLE
            ) {
              codID = this.mouth[i].damages[j].id;
              this.mouth[i].toggleDamageState(codID);
              break;
            }
          }
        }

        if (this.selectedHallazgo == this.constants.PROTESIS_TOTAL) {
          var cadena = '';

          if (this.mouth[i].id > 30 && this.mouth[i].id <= 48) {
            cadena = '48-31';
          }
          if (this.mouth[i].id > 10 && this.mouth[i].id <= 28) {
            cadena = '28-11';
          }
          if (this.mouth[i].id > 50 && this.mouth[i].id <= 65) {
            cadena = '65-51';
          }

          if (this.mouth[i].id > 70 && this.mouth[i].id <= 85) {
            cadena = '85-71';
          }

          var ArregloEntero = [];
          if (cadena != '') {
            var arrayDeCadenas = cadena.split(',');
            for (var k = 0; k < arrayDeCadenas.length; k++) {
              if (arrayDeCadenas[k] != '') {
                var Array2 = arrayDeCadenas[k].split('-');
                var arr1 = Array2[0];
                var arr2 = Array2[1];
                var valorArr = [];
                if (arr1 > arr2) {
                  valorArr = [arr2, arr1];
                } else {
                  valorArr = [arr1, arr2];
                }
                ArregloEntero.push(valorArr);
              }
            }
          }
          var encontrar = 0;
          for (var l = 0; l < ArregloEntero.length; l++) {
            for (
              var m: any = ArregloEntero[l][0];
              m <= ArregloEntero[l][1];
              m++
            ) {
              if (this.mouth[i].id == m) {
                encontrar = 1;
              }
            }
            if (encontrar == 1) {
              for (
                var m: any = ArregloEntero[l][0];
                m <= ArregloEntero[l][1];
                m++
              ) {
                for (var n = 0; n < this.mouth.slice(0, fin).length; n++) {
                  if (this.mouth[n].id == m) {
                    if (this.mouth[n].damages.length > 1) {
                      for (var y = 0; y < this.mouth[n].damages.length; y++) {
                        if (
                          this.mouth[n].damages[y].id ==
                          this.constants.PROTESIS_TOTAL
                        ) {
                          this.mouth[n].toggleDamageState(
                            this.mouth[n].damages[y].id
                          );
                          this.mouth[n].damages[y].direction = 0;
                          break;
                        }
                      }
                    } else {
                      this.mouth[n].toggleDamageState(
                        this.mouth[n].damages[0].id
                      );
                    }
                  }
                }
              }
            }
          }
        }

        shouldUpdate = true;
      }

      for (var j = 0; j < this.mouth[i].checkBoxes.length; j++) {
        if (
          this.mouth[i].checkBoxes[j].checkCollision(
            this.getXpos(event),
            this.getYpos(event)
          )
        ) {
          if (this.mouth[i].checkBoxes[j].state == 1)
            this.mouth[i].checkBoxes[j].state = -1;
          else if (this.mouth[i].checkBoxes[j].state == 11)
            this.mouth[i].checkBoxes[j].state = -11;
          else if (this.mouth[i].checkBoxes[j].state == 39)
            this.mouth[i].checkBoxes[j].state = -39;
          else this.mouth[i].checkBoxes[j].state = 0;

          shouldUpdate = true;
        }
      }
    }

    for (var i = 0; i < this.mouth.length; i++) {
      if (this.mouth[i].id == id) {
        if (this.mouth[i].textBox.text == '') {
          this.mouth[i].textBox.text = texto;
          this.mouth[i].state = 1;
        } else if (this.mouth[i].textBox2.text == '') {
          this.mouth[i].textBox2.text = texto;
          this.mouth[i].state2 = 1;
        } else if (this.mouth[i].textBox3.text == '') {
          this.mouth[i].textBox3.text = texto;
          this.mouth[i].state3 = 1;
        }
        break;
      }
    }
    if (shouldUpdate) {
      this.update();
    }
  }

  mouseClickSpaces(event: any) {
    var shouldUpdate = false;

    for (var i = 0; i < this.spaces.length; i++) {
      // check collision for current space
      if (
        this.spaces[i].checkCollision(this.getXpos(event), this.getYpos(event))
      ) {
        this.collisionHandler.handleCollision(
          this.spaces[i],
          this.selectedHallazgo
        );

        shouldUpdate = true;
      }
    }

    // only update if something new has occurred
    if (shouldUpdate) {
      this.update();
    }
  }

  mouseClickTeeth(event: any) {
    var shouldUpdate = false;
    var texto = '';
    var id = '';
    var opcion = '';
    var contador = 0;

    for (var i = 0; i < this.mouth.length; i++) {
      // check if there is a collision with the textBox
      if (
        this.mouth[i].textBox.rect.checkCollision(
          this.getXpos(event),
          this.getYpos(event)
        )
      ) {
        //console.log('mouseClickTeeth',this.mouth[i]);
        this.onTextBoxClicked(this.mouth[i].textBox);
      }

      // check collision for current tooth
      if (
        this.mouth[i].rect.checkCollision(
          this.getXpos(event),
          this.getYpos(event)
        )
      ) {
        // if we are in multi select mode
        // add this tooth to multi select list
        if (this.multiSelect) {
          this.addToMultiSelection(this.mouth[i]);
        } else {
          if (!this.observerActivated) {
            // handle collision with tooth
            if (
              this.selectedHallazgo == this.constants.EDENTULOA_TOTAL ||
              this.selectedHallazgo == this.constants.PROTESIS_TOTAL
            ) {
              this.mouth.forEach((item: any) => {
                if (item.type == this.mouth[i].type) {
                  this.collisionHandler.handleCollision(
                    item,
                    this.selectedHallazgo
                  );
                }
              });
            } else {
              if (this.selectedHallazgo == this.constants.CORONA_DEFINITIVA) {
                var posicion1 = 0;
                var posicion2 = 0;
                for (var j = 0; j < this.mouth[i].damages.length; j++) {
                  if (this.mouth[i].damages[j].id == this.selectedHallazgo) {
                    if (this.mouth[i].damages[j].indicador == 0) {
                      contador = 1;
                      this.mouth[i].damages[j].indicador = 'R';
                    } else {
                      contador = 0;
                      this.mouth[i].damages[j].indicador = 'A';
                    }

                    this.mouth[i].textBox.statetext = contador;
                    if (contador == 0 && this.mouth[i].textBox.statetext == 0)
                      this.mouth[i].textBox.text = '';

                    if (this.mouth.length > 60) {
                      for (var k = 32; k < this.mouth.length; k++) {
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 2
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion1 = k;
                        }
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 3
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion2 = k;
                        }
                      }
                    } else if (this.mouth.length < 61) {
                      for (var k = 20; k < this.mouth.length; k++) {
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 2
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion1 = k;
                        }
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 3
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion2 = k;
                        }
                      }
                    }
                    this.mouth[posicion1].textBox.text = '';
                    this.mouth[posicion1].textBox.statetext = 0;
                    this.mouth[posicion2].textBox.text = '';
                    this.mouth[posicion2].textBox.statetext = 0;
                  }
                }
              }

              if (this.selectedHallazgo == this.constants.PULPAR) {
                var posicion1 = 0;
                var posicion2 = 0;
                for (var j = 0; j < this.mouth[i].damages.length; j++) {
                  if (this.mouth[i].damages[j].id == this.selectedHallazgo) {
                    this.mouth[i].damages[j].state = 1;

                    this.mouth[i].textBox.text = '';
                    this.mouth[i].textBox.statetext = 0;
                    if (this.mouth.length > 60) {
                      for (var k = 32; k < this.mouth.length; k++) {
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 2
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion1 = k;
                        }
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 3
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion2 = k;
                        }
                      }
                    } else if (this.mouth.length < 61) {
                      for (var k = 20; k < this.mouth.length; k++) {
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 2
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion1 = k;
                        }
                        if (
                          this.mouth[k].id == this.mouth[i].id &&
                          this.mouth[k].textBox.enumerador == 3
                        ) {
                          this.mouth[k].textBox.statetext = 1;
                          posicion2 = k;
                        }
                      }
                    }
                    this.mouth[posicion1].textBox.text = '';
                    this.mouth[posicion1].textBox.statetext = 0;
                    this.mouth[posicion2].textBox.text = '';
                    this.mouth[posicion2].textBox.statetext = 0;
                  }
                }
              }
              this.collisionHandler.handleCollision(
                this.mouth[i],
                this.selectedHallazgo,
                undefined,
                undefined,
                undefined,
                undefined,
                contador
              );
            }

            shouldUpdate = true;
          } else {
            if (this.observer !== undefined) {
              this.observer(this.mouth[i].id);
            }
          }
        }

        shouldUpdate = true;
      }

      //comprobar si hay una colisi�n con una de las superficies de los dientes
      for (var j = 0; j < this.mouth[i].checkBoxes.length; j++) {
        if (
          this.mouth[i].checkBoxes[j].checkCollision(
            this.getXpos(event),
            this.getYpos(event)
          )
        ) {
          if (!this.observerActivated) {
            // handle collision with surface
            this.collisionHandler.handleCollisionCheckBox(
              this.mouth[i].checkBoxes[j],
              this.selectedHallazgo
            );

            shouldUpdate = true;

            if (this.selectedHallazgo == this.constants.SELLANTES) {
              texto = 'S';
              if (this.mouth[i].checkBoxes[j].clic_check == undefined) {
                this.mouth[i].checkBoxes[j].clic_check = 1;
                this.mouth[i].textBox.text = texto;
                this.mouth[i].textBox.statetext = 0;
                this.mouth[i].textBox.state = 0;
              } else if (
                this.mouth[i].checkBoxes[j].clic_check != undefined &&
                this.mouth[i].checkBoxes[j].clic_check < 3
              ) {
                this.mouth[i].checkBoxes[j].clic_check =
                  parseInt(this.mouth[i].checkBoxes[j].clic_check) + 2;
                this.mouth[i].checkBoxes[j].state = -40; /**/
                this.mouth[i].textBox.statetext = 1;
                this.mouth[i].textBox.state = 1;
              } else if (
                this.mouth[i].checkBoxes[j].clic_check == 3 &&
                this.mouth[i].checkBoxes[j].touching == true
              ) {
                this.mouth[i].textBox.text = '';
                this.mouth[i].checkBoxes[j].state = 0;
                this.mouth[i].checkBoxes[j].clic_check = undefined;
                this.mouth[i].checkBoxes[j].touching = false;
              }
            }

            if (this.selectedHallazgo == this.constants.CURACION) {
              if (
                this.mouth[i].checkBoxes[j].touching == true &&
                this.mouth[i].checkBoxes[j].clic_check == undefined
              ) {
                this.mouth[i].checkBoxes[j].clic_check = 1;
              } else if (
                this.mouth[i].checkBoxes[j].clic_check != undefined &&
                this.mouth[i].checkBoxes[j].clic_check < 3
              ) {
                this.mouth[i].checkBoxes[j].clic_check =
                  parseInt(this.mouth[i].checkBoxes[j].clic_check) + 2;
                this.mouth[i].checkBoxes[j].state = 1;
                if (this.mouth[i].textBox.text != '') {
                  this.mouth[i].textBox.statetext = 1;
                  this.mouth[i].textBox.state = 1;
                }

                if (this.mouth.length > 60) {
                  for (var k = 32; k < this.mouth.length; k++) {
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 2
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.statetext = 1;
                        this.mouth[i].textBox.state = 1;
                        posicion1 = k;
                      }
                    }
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 3
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.statetext = 1;
                        this.mouth[i].textBox.state = 1;
                        posicion1 = k;
                      }
                    }
                  }
                } else if (this.mouth.length < 61) {
                  for (var k = 20; k < this.mouth.length; k++) {
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 2
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.statetext = 1;
                        this.mouth[i].textBox.state = 1;
                        posicion1 = k;
                      }
                    }
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 3
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.statetext = 1;
                        this.mouth[i].textBox.state = 1;
                        posicion1 = k;
                      }
                    }
                  }
                }
              } else if (
                this.mouth[i].checkBoxes[j].clic_check == 3 &&
                this.mouth[i].checkBoxes[j].touching == true
              ) {
                if (this.mouth[i].textBox.text != '') {
                  this.mouth[i].textBox.text = '';
                  this.mouth[i].textBox.statetext = 0;
                  this.mouth[i].textBox.state = 0;
                }
                this.mouth[i].checkBoxes[j].state = 0;
                this.mouth[i].checkBoxes[j].clic_check = undefined;
                this.mouth[i].checkBoxes[j].touching = false;

                if (this.mouth.length > 60) {
                  for (var k = 32; k < this.mouth.length; k++) {
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 2
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.text = '';
                        this.mouth[k].textBox.statetext = 0;
                        this.mouth[i].textBox.state = 0;
                        posicion1 = k;
                      }
                    }
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 3
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.text = '';
                        this.mouth[k].textBox.statetext = 1;
                        this.mouth[i].textBox.state = 1;
                        posicion1 = k;
                      }
                    }
                  }
                } else if (this.mouth.length < 61) {
                  for (var k = 20; k < this.mouth.length; k++) {
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 2
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.text = '';
                        this.mouth[k].textBox.statetext = 1;
                        this.mouth[i].textBox.state = 1;
                        posicion1 = k;
                      }
                    }
                    if (
                      this.mouth[k].id == this.mouth[i].id &&
                      this.mouth[k].textBox.enumerador == 3
                    ) {
                      if (this.mouth[k].textBox.text != '') {
                        this.mouth[k].textBox.text = '';
                        this.mouth[k].textBox.statetext = 1;
                        this.mouth[i].textBox.state = 1;
                        posicion1 = k;
                      }
                    }
                  }
                }
              }
            }
          } else {
            if (this.observer !== undefined) {
              this.observer(this.mouth[i].checkBoxes[j].id);
            }
          }
        }
      }
    }

    // only update if something new has occurred
    if (shouldUpdate) {
      this.update();
    }
  }

  onMouseClick(event: any) {
    if (!this.preview) {
      if (event.which == 3) {
        // check what is in foreground
        if (this.settings.HIHGLIGHT_SPACES) {
          this.mouseRightClickSpace(event);
        } else {
          this.mouseRightClickTooth(event);
        }
      } else {
        // check what is in foreground
        if (this.settings.HIHGLIGHT_SPACES) {
          this.mouseClickSpaces(event);
        } else {
          this.mouseClickTeeth(event);
        }
      }
    }
  }

  followMouse(event: any) {
    this.cursorX = this.getXpos(event);
    this.cursorY = this.getYpos(event);

    this.update();
  }

  mouseMoveSpaces(event: any) {
    var update = false;
    for (var i = 0; i < this.spaces.length; i++) {
      if (
        this.spaces[i].checkCollision(this.getXpos(event), this.getYpos(event))
      ) {
        this.spaces[i].onTouch(true);

        update = true;
      } else {
        this.spaces[i].onTouch(false);
      }
    }

    if (update) {
      this.update();
    }
  }

  mouseMoveTeeth(event: any) {
    for (var i = 0; i < this.mouth.length; i++) {
      if (
        this.mouth[i].textBox.rect.checkCollision(
          this.getXpos(event),
          this.getYpos(event)
        )
      ) {
        this.mouth[i].textBox.touching = true;
      } else {
        this.mouth[i].textBox.touching = false;
      }

      if (
        this.mouth[i].checkCollision(this.getXpos(event), this.getYpos(event))
      ) {
        this.mouth[i].onTouch(true);

        if (this.multiSelect) {
          if (this.multiSelection.length > 0) {
            this.highlightMultiSelection(this.mouth[i]);
          }
        }
      } else {
        this.mouth[i].onTouch(false);
      }

      for (var j = 0; j < this.mouth[i].checkBoxes.length; j++) {
        if (
          this.mouth[i].checkBoxes[j].checkCollision(
            this.getXpos(event),
            this.getYpos(event)
          )
        ) {
          this.mouth[i].checkBoxes[j].touching = true;
        } else {
          this.mouth[i].checkBoxes[j].touching = false;
        }
      }
    }
  }

  onMouseMove(event: any) {
    if (!this.preview) {
      // are the spaces in forground
      if (this.settings.HIHGLIGHT_SPACES) {
        this.mouseMoveSpaces(event);
      } else {
        this.mouseMoveTeeth(event);
      }

      // update mouse cooridnates
      this.followMouse(event);
    }
  }

  reset() {
    for (var i = 0; i < this.mouth.length; i++) {
      this.mouth[i].damages.length = 0;

      this.mouth[i].textBox.text = '';

      for (var j = 0; j < this.mouth[i].checkBoxes.length; j++) {
        this.mouth[i].checkBoxes[j].state = 0;
      }
    }

    // reset all spaces
    for (var i = 0; i < this.spaces.length; i++) {
      this.spaces[i].damages.length = 0;
    }

    // repaint
    this.update();
  }

  getData() {
    var list = Array();

    // Get data for all the spaces in the odontograma
    for (var i = 0; i < this.odontSpacesAdult.length; i++) {
      var t1: any = this.odontSpacesAdult[i];
      for (var j = 0; j < t1.damages.length; j++) {
        var d: any = new Object();
        d.tooth = t1.id;
        d.damage = t1.damages[j].id;
        d.diagnostic = '';
        d.surface = 'X';
        d.note = '';
        d.direction = t1.damages[j].direction;
        list.push(d);
      }
    }

    if (this.odontAdult.length > 32) {
      var newArray: any = [];
      var newArray_: any = [];

      newArray = this.odontAdult.slice(0, 32);
      newArray_ = this.odontAdult.slice(32, 96);

      for (var j = 0; j < newArray.length; j++) {
        if (newArray[j].textBox.text == '') newArray[j].textBox.state = 0;

        for (var i = 0; i < newArray_.length; i++) {
          if (newArray[j].id == newArray_[i].id) {
            if (newArray_[i].textBox.enumerador == 2) {
              newArray[j].textBox2.text = newArray_[i].textBox.text;
              //newArray[j].textBox.enumerador == newArray_[i].textBox.enumerador;
              newArray[j].textBox2.enumerador = newArray_[i].textBox.enumerador;
              newArray[j].textBox2.statetext = newArray_[i].textBox.statetext;
              //newArray[j].textBox2.state2 = newArray_[i].textBox.state;
              if (newArray[j].textBox2.text == '')
                newArray[j].textBox2.state2 = 0;
              else newArray[j].textBox2.state2 = newArray_[i].textBox.state;
            }
            if (newArray_[i].textBox.enumerador == 3) {
              newArray[j].textBox3.text = newArray_[i].textBox.text;
              //newArray[j].textBox.enumerador == newArray_[i].textBox.enumerador;
              newArray[j].textBox3.enumerador = newArray_[i].textBox.enumerador;
              newArray[j].textBox3.statetext = newArray_[i].textBox.statetext;
              //newArray[j].textBox3.state3 = newArray_[i].textBox.state;
              if (newArray[j].textBox3.text == '')
                newArray[j].textBox3.state3 = 0;
              else newArray[j].textBox3.state3 = newArray_[i].textBox.state;
            }
            //break;
          }
        }
      }
      this.odontAdult = [];
      this.odontAdult = newArray;
    }

    // get all data from the teeth in the odontograma
    for (var i = 0; i < this.odontAdult.length; i++) {
      var t1: any = this.odontAdult[i];
      // get the notes from the text boxes

      //VALIDACION PARA LOS AUTOMATICOS DE TEXTO EN DURO
      if (
        t1.textBox.text !== '' &&
        t1.textBox.text != 'PP' &&
        t1.textBox.text != 'PC' &&
        t1.textBox.text != 'TC' &&
        t1.textBox.text != 'CM' &&
        t1.textBox.text != 'CF' &&
        t1.textBox.text != 'CMC' &&
        t1.textBox.text != 'CV' &&
        t1.textBox.text != 'CJ' &&
        t1.textBox.text != 'S' &&
        t1.textBox.text != 'AM' &&
        t1.textBox.text != 'R' &&
        t1.textBox.text != 'IV' &&
        t1.textBox.text != 'IE' &&
        t1.textBox.text != 'C'
      ) {
        var d: any = new Object();
        d.tooth = t1.id;
        d.damage = 0;
        d.diagnostic = '';
        d.surface = 'X';
        d.note = t1.textBox.text;
        d.direction = -1;

        //if (t1.textBox.text != "")
        d.state = t1.textBox.state;
        d.statetext = t1.textBox.statetext;

        d.note2 = t1.textBox2.text;
        d.state2 = t1.textBox2.state2;
        d.note3 = t1.textBox3.text;
        d.state3 = t1.textBox3.state3;

        list.push(d);
      }

      // get the damages registered for the tooth
      for (var j = 0; j < t1.damages.length; j++) {
        var d: any = new Object();

        d.tooth = t1.id;
        d.damage = t1.damages[j].id;
        d.diagnostic = '';
        d.surface = 'X';
        //d.note = "";
        if (t1.damages[j].id > 0) {
          d.note = '';
        } else {
          d.note = t1.textBox.text !== '' ? t1.textBox.text : '';
          d.note2 = t1.textBox2.text != '' ? t1.textBox2.text : '';
          d.note3 = t1.textBox3.text != '' ? t1.textBox3.text : '';
          d.state = t1.textBox.state; //1;
          d.state2 = t1.textBox2.state2; //1;
          d.state3 = t1.textBox3.state3; //1;
        }

        if (t1.damages[j].id == 32) t1.damages[j].direction = 1;
        if (t1.damages[j].id == 33) t1.damages[j].direction = 0;
        if (t1.damages[j].id == 23) t1.damages[j].direction = -1;
        if (t1.damages[j].id == 30) t1.damages[j].direction = -1;
        if (t1.damages[j].id == 34) t1.damages[j].direction = 1;
        if (t1.damages[j].id == 35) t1.damages[j].direction = -1;
        if (t1.damages[j].id == 36) t1.damages[j].direction = 0;
        if (t1.damages[j].id == 12) t1.damages[j].direction = -1;
        if (t1.damages[j].id == 2) t1.damages[j].direction = -1;
        if (t1.damages[j].id == 28) t1.damages[j].direction = -1;
        if (t1.damages[j].id == 29) t1.damages[j].direction = -1;

        if (t1.damages[j].id == 6) d.direction = t1.damages[j].direction;
        d.state = t1.damages[j].state;

        d.note = t1.textBox.text !== '' ? t1.textBox.text : '';
        d.note2 = t1.textBox2.text != '' ? t1.textBox2.text : '';
        d.note3 = t1.textBox3.text != '' ? t1.textBox3.text : '';
        /**/

        if (t1.damages[j].id > 0) d.statetext = 0;
        else d.statetext = t1.textBox.statetext;

        d.PHLLZGO = t1.damages[j].indicador;
        if (t1.damages[j].id == this.constants.IMPLANTE) {
          d.statetext =
            t1.damages[j].indicador == '' ? 0 : t1.damages[j].indicador;
        }
        if (t1.damages[j].id == this.constants.PERNO_MUNON) {
          if (t1.damages[j].state == 1) {
            t1.damages[j].indicador = 'R';
            d.statetext = t1.damages[j].state;
          }
          if (t1.damages[j].state == 0) {
            t1.damages[j].indicador = 'A';
            d.statetext = t1.damages[j].state;
          }
        }
        if (t1.damages[j].id == this.constants.PULPAR) {
          d.note = t1.textBox.text;
          d.state = 0;
          d.state2 = 0;
          d.state3 = 0;
        }

        if (
          t1.damages[j].id == this.constants.CORONA_DEFINITIVA ||
          t1.damages[j].id == this.constants.PULPAR
        ) {
          d.note = t1.textBox.text;
          d.note2 = t1.textBox2.text;
          d.note3 = t1.textBox3.text;
          d.state =
            t1.textBox.statetext == undefined ? 0 : t1.textBox.statetext;
          d.state2 =
            t1.textBox2.statetext == undefined ? 0 : t1.textBox2.statetext;
          d.state3 =
            t1.textBox3.statetext == undefined ? 0 : t1.textBox3.statetext;
          d.statetext =
            t1.textBox.statetext == undefined ? 0 : t1.textBox.statetext;
          d.statetext =
            t1.textBox2.statetext == undefined ? 0 : t1.textBox2.statetext;
          d.statetext =
            t1.textBox3.statetext == undefined ? 0 : t1.textBox3.statetext;
        }
        if (t1.damages[j].id == this.constants.SUPERFICIE_DESGASTADA) {
          d.state = 1;
          d.state2 = 0;
          d.state3 = 0;
        }
        /**/

        list.push(d);
      }

      // get data for the checkboxes (surfaces) for current tooth
      for (var j = 0; j < t1.checkBoxes.length; j++) {
        if (t1.checkBoxes[j].state !== 0) {
          var d: any = new Object();

          d.tooth = t1.id;
          d.damage = t1.checkBoxes[j].state;
          d.diagnostic = '';
          d.surface = t1.checkBoxes[j].id;
          d.note = t1.textBox.text;
          d.direction = -1;

          if (
            (t1.checkBoxes[j].state == this.constants.SELLANTES ||
              t1.checkBoxes[j].state == -40) &&
            d.note == 'S'
          ) {
            if (t1.checkBoxes[j].clic_check == 1) d.state = 0;
            else if (t1.checkBoxes[j].clic_check > 2) d.state = 1;
            d.damage = 40;
            //t1.checkBoxes[j].state = 40;
          } else if (
            t1.checkBoxes[j].state == this.constants.CURACION ||
            t1.checkBoxes[j].state == 1
          ) {
            d.note2 = t1.textBox2.text;
            d.note3 = t1.textBox3.text;
            d.state = t1.textBox.statetext;
            d.state2 = t1.textBox2.statetext;
            d.state3 = t1.textBox3.statetext;
          }
          /**/
          list.push(d);
        }
      }
    }

    // Get data for all the spaces in the odontograma
    for (var i = 0; i < this.odontSpacesChild.length; i++) {
      var t1: any = this.odontSpacesChild[i];
      for (var j = 0; j < t1.damages.length; j++) {
        var d: any = new Object();
        d.tooth = t1.id;
        d.damage = t1.damages[j].id;
        d.diagnostic = '';
        d.surface = 'X';
        d.note = '';
        d.direction = t1.damages[j].direction;
        list.push(d);
      }
    }

    if (this.odontChild.length > 20) {
      var newArray2: any = [];
      var newArray2_: any = [];

      newArray2 = this.odontChild.slice(0, 20);
      newArray2_ = this.odontChild.slice(20, 60);

      for (var j = 0; j < newArray2.length; j++) {
        if (newArray2[j].textBox.text == '') newArray2[j].textBox.state = 0;
        for (var i = 0; i < newArray2_.length; i++) {
          if (newArray2[j].id == newArray2_[i].id) {
            if (newArray2_[i].textBox.enumerador == 2) {
              newArray2[j].textBox2.text = newArray2_[i].textBox.text;
              //newArray[j].textBox.enumerador == newArray_[i].textBox.enumerador;
              newArray2[j].textBox2.enumerador ==
                newArray2_[i].textBox.enumerador;
              newArray2[j].textBox2.statetext = newArray2_[i].textBox.statetext;
              //newArray[j].textBox2.state2 = newArray_[i].textBox.state;
              if (newArray2[j].textBox2.text == '')
                newArray2[j].textBox2.state2 = 0;
              else newArray2[j].textBox2.state2 = newArray2_[i].textBox.state;
            }
            if (newArray2_[i].textBox.enumerador == 3) {
              if (newArray2[j].textBox3.text == '')
                newArray2[j].textBox3.state = 0;
              newArray2[j].textBox3.text = newArray2_[i].textBox.text;
              //newArray[j].textBox.enumerador == newArray_[i].textBox.enumerador;
              newArray2[j].textBox3.enumerador ==
                newArray2_[i].textBox.enumerador;
              newArray2[j].textBox3.statetext = newArray2_[i].textBox.statetext;
              //newArray[j].textBox3.state3 = newArray_[i].textBox.state;
              if (newArray2[j].textBox3.text == '')
                newArray2[j].textBox3.state3 = 0;
              else newArray2[j].textBox3.state3 = newArray2_[i].textBox.state;
            }
          }
        }
      }
      this.odontChild = [];
      this.odontChild = newArray2;
    }

    // get all data from the teeth in the odontograma
    for (var i = 0; i < this.odontChild.length; i++) {
      var t1: any = this.odontChild[i];

      // get the notes from the text boxes
      if (
        t1.textBox.text !== '' &&
        t1.textBox.text != 'PP' &&
        t1.textBox.text != 'PC' &&
        t1.textBox.text != 'TC' &&
        t1.textBox.text != 'CM' &&
        t1.textBox.text != 'CF' &&
        t1.textBox.text != 'CMC' &&
        t1.textBox.text != 'CV' &&
        t1.textBox.text != 'CJ' &&
        t1.textBox.text != 'S' &&
        t1.textBox.text != 'AM' &&
        t1.textBox.text != 'R' &&
        t1.textBox.text != 'IV' &&
        t1.textBox.text != 'IE' &&
        t1.textBox.text != 'C'
      ) {
        var d: any = new Object();
        d.tooth = t1.id;
        d.damage = 0;
        d.diagnostic = '';
        d.surface = 'X';
        d.note = t1.textBox.text;
        d.direction = -1;

        d.state = t1.textBox.state;
        d.statetext = t1.textBox.statetext;

        d.note2 = t1.textBox2.text;
        d.state2 = t1.textBox2.state2;
        d.note3 = t1.textBox3.text;
        d.state3 = t1.textBox3.state3;
        /**/

        list.push(d);
      }

      // get the damages registered for the tooth
      for (var j = 0; j < t1.damages.length; j++) {
        var d: any = new Object();

        d.tooth = t1.id;
        d.damage = t1.damages[j].id;
        d.diagnostic = '';
        d.surface = 'X';

        if (t1.damages[j].id > 0) {
          d.note = '';
        } else {
          d.note = t1.textBox.text !== '' ? t1.textBox.text : '';

          d.note2 = t1.textBox2.text != '' ? t1.textBox2.text : '';
          d.note3 = t1.textBox3.text != '' ? t1.textBox3.text : '';
          d.state = t1.textBox.state; //1;
          d.state2 = t1.textBox2.state2; //1;
          d.state3 = t1.textBox3.state3; //1;
          /**/
        }

        if (t1.damages[j].id == 32) t1.damages[j].direction = 1;
        if (t1.damages[j].id == 33) t1.damages[j].direction = 0;

        if (t1.damages[j].id == 23) t1.damages[j].direction = -1;

        if (t1.damages[j].id == 30) t1.damages[j].direction = -1;

        if (t1.damages[j].id == 34) t1.damages[j].direction = 1;
        if (t1.damages[j].id == 35) t1.damages[j].direction = -1;
        if (t1.damages[j].id == 36) t1.damages[j].direction = 0;

        if (t1.damages[j].id == 12) t1.damages[j].direction = -1;

        if (t1.damages[j].id == 2) t1.damages[j].direction = -1;

        if (t1.damages[j].id == 28) t1.damages[j].direction = -1;

        if (t1.damages[j].id == 29) t1.damages[j].direction = -1;

        d.direction = t1.damages[j].direction;
        d.state = d.state = t1.damages[j].state;

        d.note = t1.textBox.text != '' ? t1.textBox.text : '';
        d.note2 = t1.textBox2.text != '' ? t1.textBox2.text : '';
        d.note3 = t1.textBox3.text != '' ? t1.textBox3.text : '';
        /**/

        if (t1.damages[j].id > 0) d.statetext = 0;
        else d.statetext = t1.textBox.statetext;

        d.PHLLZGO = t1.damages[j].indicador;
        if (t1.damages[j].id == this.constants.IMPLANTE) {
          d.statetext =
            t1.damages[j].indicador == '' ? 0 : t1.damages[j].indicador;
          //d.statetext = t1.damages[j].state;
        }
        if (t1.damages[j].id == this.constants.PERNO_MUNON) {
          if (t1.damages[j].state == 1) {
            t1.damages[j].indicador = 'R';
            d.statetext = t1.damages[j].state;
          }
          if (t1.damages[j].state == 0) {
            t1.damages[j].indicador = 'A';
            d.statetext = t1.damages[j].state;
          }
        }
        if (t1.damages[j].id == this.constants.PULPAR) {
          d.note = t1.textBox.text;
          d.state = 0;
          d.state2 = 0;
          d.state3 = 0;
        }
        if (
          t1.damages[j].id == this.constants.CORONA_DEFINITIVA ||
          t1.damages[j].id == this.constants.PULPAR
        ) {
          d.note = t1.textBox.text;
          d.note2 = t1.textBox2.text;
          d.note3 = t1.textBox3.text;
          d.state =
            t1.textBox.statetext == undefined ? 0 : t1.textBox.statetext;
          d.state2 =
            t1.textBox2.statetext == undefined ? 0 : t1.textBox2.statetext;
          d.state3 =
            t1.textBox3.statetext == undefined ? 0 : t1.textBox3.statetext;
          d.statetext =
            t1.textBox.statetext == undefined ? 0 : t1.textBox.statetext;
          d.statetext =
            t1.textBox2.statetext == undefined ? 0 : t1.textBox2.statetext;
          d.statetext =
            t1.textBox3.statetext == undefined ? 0 : t1.textBox3.statetext;
        }
        if (t1.damages[j].id == this.constants.SUPERFICIE_DESGASTADA) {
          d.state = 1;
          d.state2 = 0;
          d.state3 = 0;
        }

        /**/

        list.push(d);
      }

      // get data for the checkboxes (surfaces) for current tooth
      for (var j = 0; j < t1.checkBoxes.length; j++) {
        if (t1.checkBoxes[j].state !== 0) {
          var d: any = new Object();
          d.tooth = t1.id;
          d.damage = t1.checkBoxes[j].state;
          d.diagnostic = '';
          d.surface = t1.checkBoxes[j].id;
          d.note = t1.textBox.text;
          d.direction = -1;
          if (
            (t1.checkBoxes[j].state == this.constants.SELLANTES ||
              t1.checkBoxes[j].state == -40) &&
            d.note == 'S'
          ) {
            if (t1.checkBoxes[j].clic_check == 1) d.state = 0;
            else if (t1.checkBoxes[j].clic_check > 2) d.state = 1;
            d.damage = 40;
            //t1.checkBoxes[j].state = 40;
          } else if (
            t1.checkBoxes[j].state == this.constants.CURACION ||
            t1.checkBoxes[j].state == 1
          ) {
            d.note2 = t1.textBox2.text;
            d.note3 = t1.textBox3.text;
            d.state = t1.textBox.statetext;
            d.state2 = t1.textBox2.statetext;
            d.state3 = t1.textBox3.statetext;
          }
          /**/
          list.push(d);
        }
      }
    }

    return list;
  }

  save() {
    // save image as png
    var link = document.createElement('a');

    // create a unique name
    var name = Date.now() + '.png';

    link.download = name;

    // Create an image stream of the canvas
    link.href = this.canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    // download the image
    link.click();
  }

  keyMapper(event: any) {
    var value = 0;

    if (event.key == 'q') {
      value = 10;
    } else if (event.key == 'w') {
      value = 11;
    } else if (event.key == 'e') {
      value = 12;
    } else if (event.key == 'r') {
      value = 13;
    } else if (event.key == 't') {
      value = 14;
    } else if (event.key == 'y') {
      value = 15;
    } else if (event.key == 'u') {
      value = 16;
    } else if (event.key == 'i') {
      value = 17;
    } else if (event.key == 'o') {
      value = 18;
    } else if (event.key == 'p') {
      value = 19;
    } else if (event.key == 'a') {
      value = 20;
    } else if (event.key == 's') {
      value = 21;
    } else if (event.key == 'd') {
      value = 22;
    } else if (event.key == 'f') {
      value = 23;
    } else if (event.key == 'g') {
      value = 24;
    } else if (event.key == 'h') {
      value = 25;
    } else if (event.key == 'j') {
      value = 27;
    } else if (event.key == 'k') {
      value = 28;
    } else if (event.key == 'l') {
      value = 29;
    } else if (event.key == 'x') {
      value = 30;
    } else if (event.key == 'c') {
      value = 31;
    } else if (event.key == 'b') {
      value = 32;
    } else if (event.key == 'n') {
      value = 34;
    } else if (event.key == 'm') {
      value = 38;
    }

    return value;
  }

  onButtonClick(event: any) {
    console.log('key ' + event.key);

    // key combination Ctrl + Q to activate debug mode
    if ((event.which == 81 || event.keyCode == 81) && event.ctrlKey) {
      this.settings.DEBUG = !this.settings.DEBUG;

      this.update();
    }
  }

  setDamage(damage: any) {
    this.multiSelect = false;
    this.multiSelection.length = 0;

    console.log('Engine setting damage: ' + damage);

    this.selectedHallazgo = parseInt(damage, 10) || 0;

    if (this.selectedHallazgo == this.constants.TRANSPOSICION_LEFT) {
      this.multiSelect = true;
      this.multiSelection.length = 0;
    }

    if (this.selectedHallazgo == this.constants.ORTODONTICO_FIJO_END) {
      this.multiSelect = true;
      this.multiSelection.length = 0;
    }

    if (this.selectedHallazgo == this.constants.PROTESIS_FIJA_LEFT) {
      this.multiSelect = true;
      this.multiSelection.length = 0;
    }

    if (this.selectedHallazgo == this.constants.ORTONDICO_REMOVIBLE) {
      this.multiSelect = true;
      this.multiSelection.length = 0;
    }

    if (this.selectedHallazgo == this.constants.SUPER_NUMERARIO) {
      this.settings.HIHGLIGHT_SPACES = true;
      this.update();
    }

    if (this.selectedHallazgo == this.constants.DIASTEMA) {
      this.settings.HIHGLIGHT_SPACES = true;
      this.update();
    }

    if (
      this.selectedHallazgo !== this.constants.DIASTEMA &&
      this.selectedHallazgo !== this.constants.SUPER_NUMERARIO
    ) {
      this.settings.HIHGLIGHT_SPACES = false;
      this.update();
    }
  }

  changeView(which: any) {
    if (which == '1') {
      this.adultShowing = false;
      this.mouth = this.odontChild;
      this.spaces = this.odontSpacesChild;
      this.update();
    } else {
      this.adultShowing = true;
      this.mouth = this.odontAdult;
      this.spaces = this.odontSpacesAdult;
      this.update();
    }

    if (this.callback != null) {
      this.callback(which);
    }
  }

  start() {
    var self = this;
    // setTimeout(function () {
    self.update();
    // }, 1500);
  }

  getToothById(id: any) {
    var tooth;

    for (var i = 0; i < this.mouth.length; i++) {
      if (this.mouth[i].id == id) {
        tooth = this.mouth[i];
        break;
      }
    }

    if (id < 51) {
      if (this.odontAdult.length > 32) {
        var newArray_: any = [];
        newArray_ = this.odontAdult.slice(32, 96);
        for (var j = 0; j < newArray_.length; j++) {
          if (tooth.id == newArray_[j].id) {
            tooth.state2 = newArray_[j].state2;
            tooth.state3 = newArray_[j].state3;
            if (newArray_[j].textBox2.enumerador == 2) {
              tooth.textBox2.state2 = parseInt(newArray_[j].textBox2.state2);
              tooth.textBox2.statetext = parseInt(newArray_[j].textBox2.state2);
              tooth.textBox2.text = newArray_[j].textBox2.text;
            }
            if (newArray_[j].textBox3.enumerador == 3) {
              tooth.textBox3.state3 = parseInt(newArray_[j].textBox3.state3);
              tooth.textBox3.statetext = parseInt(newArray_[j].textBox3.state3);
              tooth.textBox3.text = newArray_[j].textBox3.text;
            }
          }
        }
      }
    }

    if (id > 50) {
      for (var i = 0; i < this.odontChild.length; i++) {
        if (this.odontChild[i].id == id) {
          tooth = this.odontChild[i];
          break;
        }
      }

      if (this.odontChild.length > 20) {
        var newArray_: any = [];
        newArray_ = this.odontChild.slice(20, 60);
        for (var j = 0; j < newArray_.length; j++) {
          if (tooth.id == newArray_[j].id) {
            tooth.state2 = newArray_[j].state2;
            tooth.state3 = newArray_[j].state3;
            if (newArray_[j].textBox.enumerador == 2) {
              tooth.textBox2.state2 = parseInt(newArray_[j].textBox2.state2);
              tooth.textBox2.statetext = parseInt(newArray_[j].textBox2.state2);
              tooth.textBox2.text = newArray_[j].textBox2.text;
            }
            if (newArray_[j].textBox.enumerador == 3) {
              tooth.textBox3.state3 = parseInt(newArray_[j].textBox3.state3);
              tooth.textBox3.statetext = parseInt(newArray_[j].textBox3.state3);
              tooth.textBox3.text = newArray_[j].textBox3.text;
            }
          }
        }
      }
    }

    return tooth;
  }

  getSpaceById(id: any) {
    var space;

    for (var i = 0; i < this.spaces.length; i++) {
      if (this.spaces[i].id == id) {
        space = this.spaces[i];
        break;
      }
    }

    return space;
  }

  load(
    tooth: any,
    damage: any,
    surface: any,
    note: any,
    note2: any,
    note3: any,
    direction: any,
    state: any,
    state2: any,
    state3: any,
    statetext: any,
    posicion: any
  ) {
    var t1 = tooth;
    if (t1 > 10 && t1 < 49) {
      this.mouth = this.odontAdult;
      this.spaces = this.odontSpacesAdult;

      for (var i = 0; i < this.mouth.length; i++) {
        if (i > 32) {
          this.mouth[i].textBox2.text = '';
          this.mouth[i].textBox3.text = '';
          this.mouth[i].textBox2.enumerador = 2;
          this.mouth[i].textBox3.enumerador = 3;
        }
      }

      if (tooth !== 0 && damage == 0) {
        for (var i = 0; i < this.mouth.length; i++) {
          if (this.mouth[i].id == tooth) {
            this.mouth[i].text = note;
            this.mouth[i].textBox.statetext = statetext;
            this.mouth[i].state = state;

            if (this.mouth[i].textBox.enumerador == 1) {
              this.mouth[i].textBox.text = note;
              this.mouth[i].textBox.state = parseInt(state);
              this.mouth[i].textBox.statetext = parseInt(state);
            } else if (this.mouth[i].textBox.enumerador == 2) {
              this.mouth[i].textBox.text = note2;
              this.mouth[i].textBox.state = parseInt(state2);
              this.mouth[i].textBox.statetext = parseInt(state2);
            } else if (this.mouth[i].textBox.enumerador == 3) {
              this.mouth[i].textBox.text = note3;
              this.mouth[i].textBox.state = parseInt(state3);
              this.mouth[i].textBox.statetext = parseInt(state3);
            }
          }
        }
      }
    } else if (t1 > 50 && t1 < 85) {
      this.mouth = this.odontChild;
      this.spaces = this.odontSpacesChild;

      for (var i = 0; i < this.mouth.length; i++) {
        if (i < 20) {
          this.mouth[i].textBox2.text = '';
          this.mouth[i].textBox3.text = '';
          this.mouth[i].textBox2.enumerador = 2;
          this.mouth[i].textBox3.enumerador = 3;
        }
      }

      if (tooth !== 0 && damage == 0) {
        for (var i = 0; i < this.mouth.length; i++) {
          if (this.mouth[i].id == tooth) {
            this.mouth[i].text = note;
            this.mouth[i].textBox.statetext = statetext;
            this.mouth[i].state = state;

            if (this.mouth[i].textBox.enumerador == 1) {
              this.mouth[i].textBox.text = note;
              this.mouth[i].textBox.state = parseInt(state);
              this.mouth[i].textBox.statetext = parseInt(state);
            } else if (this.mouth[i].textBox.enumerador == 2) {
              this.mouth[i].textBox.text = note2;
              this.mouth[i].textBox.state = parseInt(state2);
              this.mouth[i].textBox.statetext = parseInt(state2);
            } else if (this.mouth[i].textBox.enumerador == 3) {
              this.mouth[i].textBox.text = note3;
              this.mouth[i].textBox.state = parseInt(state3);
              this.mouth[i].textBox.statetext = parseInt(state3);
            }
          }
        }
      }
    } else if (t1 > 1000 && t1 < 5000) {
      this.mouth = this.odontAdult;
      this.spaces = this.odontSpacesAdult;
    } else if (t1 > 5000) {
      this.mouth = this.odontChild;
      this.spaces = this.odontSpacesChild;
    }

    // check if we should add damage to a tooth
    if (surface == 'X') {
      if (tooth < 1000) {
        var t = this.getToothById(tooth);

        var xcontador = '';

        if (
          damage == this.constants.CORONA_DEFINITIVA ||
          damage == this.constants.PULPAR
        ) {
          xcontador = state;
        }

        this.collisionHandler.handleCollision(
          t,
          damage,
          direction,
          state,
          statetext,
          posicion,
          xcontador
        );
        if (
          damage == this.constants.CORONA_DEFINITIVA ||
          damage == this.constants.PULPAR
        )
          t.textBox.statetext = parseInt(state);

        if (note !== undefined && note !== '')
          this.setTextToTextBox(t.textBox, note, note2, note3);

        if (
          damage == this.constants.CORONA_DEFINITIVA ||
          damage == this.constants.PULPAR
        ) {
          if (note2 !== undefined && note3 !== '') {
            if (this.mouth.length > 60) {
              for (var k = 32; k < this.mouth.length; k++) {
                if (
                  this.mouth[k].id == tooth &&
                  this.mouth[k].textBox.enumerador == 2
                ) {
                  this.mouth[k].textBox.statetext = parseInt(state);
                  this.setTextToTextBox(
                    this.mouth[k].textBox,
                    note,
                    note2,
                    note3
                  );
                }
                if (
                  this.mouth[k].id == tooth &&
                  this.mouth[k].textBox.enumerador == 3
                ) {
                  this.mouth[k].textBox.statetext = parseInt(state);
                  this.setTextToTextBox(
                    this.mouth[k].textBox,
                    note,
                    note2,
                    note3
                  );
                }
              }
            }

            if (this.odontChild.length < 61) {
              for (var k = 20; k < this.odontChild.length; k++) {
                if (
                  this.odontChild[k].id == tooth &&
                  this.odontChild[k].textBox.enumerador == 2
                ) {
                  this.odontChild[k].textBox.statetext = parseInt(state);
                  this.setTextToTextBox(
                    this.mouth[k].textBox,
                    note,
                    note2,
                    note3
                  );
                }
                if (
                  this.odontChild[k].id == tooth &&
                  this.odontChild[k].textBox.enumerador == 3
                ) {
                  this.odontChild[k].textBox.statetext = parseInt(state);
                  this.setTextToTextBox(
                    this.odontChild[k].textBox,
                    note,
                    note2,
                    note3
                  );
                }
              }
            }
          }
        }
      } else {
        this.collisionHandler.handleCollision(this.getSpaceById(tooth), damage);
      }
    } else {
      var surfaceId = tooth + '_' + surface;

      var t = this.getToothById(tooth);
      var surface = t.getSurfaceById(surfaceId);

      if (damage == this.constants.CURACION || damage == 1) {
        if (damage == 11) {
          surface.clic_check = 1;
          surface.touching = true;
          surface.statetext = 0;

          t.textBox.text = note;
          t.textBox.statetext = state;
          t.textBox2.text = note2;
          t.textBox2.statetext = state2;
          t.textBox3.text = note3;
          t.textBox3.statetext = state3;
        } else if ((damage = 1)) {
          //t.textBox.statetext = state;
          surface.clic_check = 3;
          surface.touching = true;
          surface.statetext = 1;

          t.textBox.text = note;
          t.textBox.statetext = state;
          t.textBox2.text = note2;
          t.textBox2.statetext = state2;
          t.textBox3.text = note3;
          t.textBox3.statetext = state3;
        }
        for (var j = 0; j < this.odontAdult.length; j++) {
          if (this.odontAdult[j].id == t.id) {
            //if (j <= 32) {
            if (this.odontAdult[j].textBox.enumerador == 1) {
              t.textBox.text = note;
              t.textBox.state = parseInt(state);
              t.textBox.statetext = parseInt(state);

              this.odontAdult[j].textBox.text = note;
              this.odontAdult[j].textBox.state = parseInt(state);
              this.odontAdult[j].textBox.statetext = parseInt(state);
            } else if (this.odontAdult[j].textBox.enumerador == 2) {
              t.textBox2.text = note2;
              t.textBox2.state2 = parseInt(state2);
              t.textBox2.statetext = parseInt(state2);

              this.odontAdult[j].textBox.text = note2;
              this.odontAdult[j].textBox.state = parseInt(state2);
              this.odontAdult[j].textBox.statetext = parseInt(state2);
            } else if (this.odontAdult[j].textBox.enumerador == 3) {
              t.textBox3.text = note3;
              t.textBox3.state3 = parseInt(state3);
              t.textBox3.statetext = parseInt(state3);

              this.odontAdult[j].textBox.text = note3;
              this.odontAdult[j].textBox.state = parseInt(state3);
              this.odontAdult[j].textBox.statetext = parseInt(state3);
            }
          }
        }

        for (var j = 0; j < this.odontChild.length; j++) {
          if (this.odontChild[j].id == t.id) {
            if (this.odontChild[j].textBox.enumerador == 1) {
              t.textBox.text = note;
              t.textBox.state = parseInt(state);
              t.textBox.statetext = parseInt(state);

              this.odontChild[j].textBox.text = note;
              this.odontChild[j].textBox.state = parseInt(state);
              this.odontChild[j].textBox.statetext = parseInt(state);
            }
            //if (j <= 40) {
            else if (this.odontChild[j].textBox.enumerador == 2) {
              t.textBox2.text = note2;
              t.textBox2.state2 = parseInt(state2);
              t.textBox2.statetext = parseInt(state2);

              this.odontChild[j].textBox.text = note2;
              this.odontChild[j].textBox.state = parseInt(state2);
              this.odontChild[j].textBox.statetext = parseInt(state2);
            } else if (this.odontChild[j].textBox.enumerador == 3) {
              t.textBox3.text = note3;
              t.textBox3.state3 = parseInt(state3);
              t.textBox3.statetext = parseInt(state3);

              this.odontChild[j].textBox.text = note3;
              this.odontChild[j].textBox.state = parseInt(state3);
              this.odontChild[j].textBox.statetext = parseInt(state3);
            }
          }
        }
      }

      if (
        damage == this.constants.SELLANTES &&
        note == 'S'
      ) {
        if (state == 0) {
          t.textBox.statetext = state;
          surface.clic_check = 1;
          surface.touching = true;
          surface.statetext = 0;
        } else if ((state == 1)) {
          t.textBox.statetext = state;
          surface.clic_check = 3;
          surface.touching = true;
          surface.statetext = 1;
          surface.state = -40;
        }
      }
      /**/

      this.collisionHandler.handleCollisionCheckBox(surface, damage);

      if (note !== undefined && note !== '')
        this.setTextToTextBox(t.textBox, note, note2, note3);
    }
  }

  setDataSource(dataArray: any) {
    this.reset();

    var res = dataArray.split(',');

    var i = 0;

    while (i < res.length) {
      if (this.odontAdult.length > 32) {
        for (var j = 32; j < this.odontAdult.length; j++) {
          if (this.odontAdult[j].id == parseInt(res[i])) {
            if (this.odontAdult[j].textBox.enumerador == 2) {
              this.odontAdult[j].textBox.text = res[i + 4];
              this.odontAdult[j].textBox2.text = res[i + 4];
              this.odontAdult[j].textBox2.state2 = res[i + 8];
            }
            if (this.odontAdult[j].textBox.enumerador == 3) {
              this.odontAdult[j].textBox.text = res[i + 5];
              this.odontAdult[j].textBox3.text = res[i + 5];
              this.odontAdult[j].textBox3.state3 = res[i + 9];
            }
          }
        }
      }

      if (this.odontChild.length > 20) {
        for (var j = 20; j < this.odontChild.length; j++) {
          if (this.odontChild[j].id == parseInt(res[i])) {
            if (this.odontChild[j].textBox.enumerador == 2) {
              this.odontChild[j].textBox.text = res[i + 4];
              this.odontChild[j].textBox2.text = res[i + 4];
              this.odontChild[j].textBox2.state2 = parseInt(res[i + 8]);
            }
            if (this.odontChild[j].textBox.enumerador == 3) {
              this.odontChild[j].textBox.text = res[i + 5];
              this.odontChild[j].textBox3.text = res[i + 5];
              this.odontChild[j].textBox3.state3 = parseInt(res[i + 9]);
            }
          }
        }
      }

      this.load(
        Number(res[i]),
        Number(res[i + 1]),
        res[i + 2],
        res[i + 3],
        res[i + 4],
        res[i + 5],
        res[i + 6],
        res[i + 7],
        res[i + 8],
        res[i + 9],
        res[i + 10],
        res[i + 11]
      );

      i = i + 12; 
    }

    this.mouth = this.odontAdult;
    this.spaces = this.odontSpacesAdult;
  }

  setCallback(callback: any) {
    this.callback = callback;
  }

  togglePrintPreview() {
    this.preview = !this.preview;

    this.odontAdultcopy = this.odontAdult;
    this.odontChildtcopy = this.odontChild;
    /**/

    if (!this.preview) {
      this.hidePrintPreview();
    } else {
      this.showPrintPreview();
      this.print();
    }
  }

  togglePrintPreviewDocumento() {
    //debugger;
    this.preview = !this.preview;
    this.odontAdultcopy = this.odontAdult;
    this.odontChildtcopy = this.odontChild;

    let canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (!this.preview) {
      this.hidePrintPreview();
    } else {
      this.showPrintPreview();
      var windowContent = '<!DOCTYPE html>';
      windowContent += '<html lang="en">';
      windowContent += '<head>';
      windowContent +=
        '<meta http-equiv="content-type" content="text/html;charset=utf-8" />';
      windowContent += '<title>OIM Odontograma</title>';
      windowContent += '</head>';
      windowContent += '<body style=" margin:0;">';
      windowContent +=
        '<img style="display: block;margin-left: auto;margin-right: auto;" src="' +
        canvas.toDataURL() +
        '">';
      windowContent += '</body>';
      windowContent += '</html>';

      var processItemsDeferred: any = [];
      var param = "{html:'" + windowContent + "'}";
      $.ajax({
        type: 'POST',
        url: 'Odontograma.aspx/cargaDocumentos',
        data: param,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: true,
        success: function (data) {
          if (data.d !== '0') {
            console.log('cargaDocumentos-idDocumento:' + data.d);
            processItemsDeferred.push(this.processItem(data.d));
            processItemsDeferred.push($.Deferred().reject());
            $.when.apply($, processItemsDeferred).always(this.everythingDone());
          } else {
            return;
          }
        },
        error: function (error) {
          console.log('error togglePrintPreviewDocumento:' + error.status);
        },
      });
    }
  }

  processItem(data: any) {
    var dfd = $.Deferred();
    dfd.resolve();
    this.result.push(data);
    console.log('processItem-data' + data);
    return dfd.promise();
  }

  everythingDone() {
    var params: any;
    params = this.result[0];
    console.log('everythingDone-params' + params);

    if (params.length > 0) {
      this.printDocumento();
    }
  }

  printDocumento() {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    var dataUrl = canvas.toDataURL();

    var windowContent = '<!DOCTYPE html>';
    windowContent += '<html lang="en">';
    windowContent += '<head>';
    windowContent +=
      '<meta http-equiv="content-type" content="text/html;charset=utf-8" />';
    windowContent += '<title>OIM Odontograma</title>';
    windowContent += '</head>';
    windowContent += '<body style=" margin:0;">';
    windowContent +=
      '<img style="display: block;margin-left: auto;margin-right: auto;" src="' +
      dataUrl +
      '">';
    windowContent += '</body>';
    windowContent += '</html>';

    var printWin: any = window.open(
      '',
      '',
      'width=' + screen.availWidth + ',height=' + screen.availHeight + 200
    );
    printWin.document.open();
    printWin.document.write(windowContent);

    printWin.document.addEventListener(
      'load',
      function () {
        printWin.focus();
        printWin.print();
        printWin.document.close();
        printWin.close();
      },
      true
    );

    this.preview = false;
    this.hidePrintPreview();
  }

  showPrintPreview() {
    this.renderer.setCanvasSize(this.renderer.width, 1700);
    console.log('Print preview');

    for (var i = 0; i < this.odontAdult.length; i++) {
      if (this.odontAdult[i].type == 1) {
        this.odontAdult[i].moveUpDown(
          this.printPreviewPositionChange * 2 + 120
        );
        this.odontAdult[i].textBox.rect.y += 20;
      } else {
        this.odontAdult[i].moveUpDown(120);
        this.odontAdult[i].textBox.rect.y -= 20;
      }
    }

    for (var i = 0; i < this.odontSpacesAdult.length; i++) {
      if (this.odontSpacesAdult[i].type == 1) {
        this.odontSpacesAdult[i].moveUpDown(
          this.printPreviewPositionChange * 2 + 120
        );
      } else {
        this.odontSpacesAdult[i].moveUpDown(120);
      }
    }

    for (var i = 0; i < this.odontChild.length; i++) {
      this.odontChild[i].moveUpDown(this.printPreviewPositionChange + 120);
      if (this.odontChild[i].type == 0) {
        this.odontChild[i].textBox.rect.y -= this.printPreviewPositionChange;
      } else {
        this.odontChild[i].textBox.rect.y += this.printPreviewPositionChange;
      }
    }

    for (var i = 0; i < this.odontSpacesChild.length; i++) {
      this.odontSpacesChild[i].moveUpDown(
        this.printPreviewPositionChange + 120
      );
    }

    // realligne all teeth and damages
    for (var i = 0; i < this.odontAdult.length; i++) {
      this.odontAdult[i].refresh(this.constants);
    }

    for (var i = 0; i < this.odontChild.length; i++) {
      this.odontChild[i].refresh(this.constants);
    }

    this.update();
  }

  hidePrintPreview() {
    this.renderer.setCanvasSize(this.renderer.width, this.renderer.height);

    var contador_10_19 = 0;
    var contador_20_29 = 0;
    var contador_30_39 = 0;
    var contador_40_49 = 0;
    var contador_50_56 = 0;
    var contador_60_66 = 0;

    var posicion1 = 0;
    var posicion2 = 0;
    var posicion3 = 0;
    var posicion4 = 0;
    var posicion_1 = 0;

    var canvas = document.getElementById('canvas');
    this.setCanvas(canvas);

    console.log('Print preview');

    for (var i = 0; i < this.odontAdult.length; i++) {
      var cadena = this.odontAdult[i].image.src.split('/');
      var img =
        cadena[0] +
        '//' +
        cadena[2] +
        '/ODONTOGRAMA/images/' +
        cadena[cadena.length - 1].substring(1); //pruebas

      console.log('cadena=' + cadena);
      console.log('img=' + img);
      //debugger;
      this.odontAdult[i].image.src = img;
      if (this.odontAdult[i].id > 10 && this.odontAdult[i].id < 19) {
        contador_10_19++;
        this.odontAdult[i].y = 220;
        this.odontAdult[i].textBox.rect.y = 158 + posicion1;
        if (contador_10_19 == 8) {
          contador_10_19 = 0;
          posicion1 = posicion1 - 20;
        }
      }
      if (this.odontAdult[i].id > 20 && this.odontAdult[i].id < 29) {
        contador_20_29++;
        this.odontAdult[i].y = 220;
        this.odontAdult[i].textBox.rect.y = 158 + posicion2;
        if (contador_20_29 == 8) {
          contador_20_29 = 0;
          posicion2 = posicion2 - 20;
        }
      }
      if (this.odontAdult[i].id > 30 && this.odontAdult[i].id < 39) {
        contador_30_39++;
        this.odontAdult[i].y = 810;
        this.odontAdult[i].textBox.rect.y = 942 + posicion3;
        if (contador_30_39 == 8) {
          contador_30_39 = 0;
          posicion3 = posicion3 + 20;
        }
      }
      if (this.odontAdult[i].id > 40 && this.odontAdult[i].id < 49) {
        contador_40_49++;
        this.odontAdult[i].y = 810;
        this.odontAdult[i].textBox.rect.y = 942 + posicion4;
        if (contador_40_49 == 8) {
          contador_40_49 = 0;
          posicion4 = posicion4 + 20;
        }
      }
      /**/

      if (this.odontAdult[i].type == 1) {
        this.odontAdult[i].moveUpDown(
          -this.printPreviewPositionChange * 2 - 120
        );
        this.odontAdult[i].textBox.rect.y -= 20;
      } else {
        this.odontAdult[i].moveUpDown(-120);
        this.odontAdult[i].textBox.rect.y += 20;
      }
    }

    for (var i = 0; i < this.odontSpacesAdult.length; i++) {
      if (this.odontSpacesAdult[i].type == 1) {
        this.odontSpacesAdult[i].moveUpDown(
          -this.printPreviewPositionChange * 2 - 120
        );
      } else {
        this.odontSpacesAdult[i].moveUpDown(-120);
      }
    }

    /*jjallo 02122020*/
    posicion1 = 0;
    posicion2 = 0;
    /**/

    for (var i = 0; i < this.odontChild.length; i++) {
      /*jjallo 11092020*/
      var cadena = this.odontChild[i].image.src.split('/');
      //var img = cadena[0] + '//' + cadena[2] + '/images/' + cadena[cadena.length - 1].substring(1); //desarrollo
      var img =
        cadena[0] +
        '//' +
        cadena[2] +
        '/ODONTOGRAMA/images/' +
        cadena[cadena.length - 1].substring(1); //pruebas

      this.odontChild[i].image.src = img;
      //if (this.odontChild[i].id > 50 && this.odontChild[i].id < 56) this.odontChild[i].y = 410;
      //if (this.odontChild[i].id > 60 && this.odontChild[i].id < 66) this.odontChild[i].y = 410;
      if (this.odontChild[i].id > 50 && this.odontChild[i].id < 56) {
        contador_50_56++;
        this.odontChild[i].y = 410;
        this.odontChild[i].textBox.rect.y = 178 + posicion1;
        if (contador_50_56 == 5) {
          contador_50_56 = 0;
          posicion1 = posicion1 - 20;
        }
      }
      if (this.odontChild[i].id > 60 && this.odontChild[i].id < 66) {
        contador_60_66++;
        this.odontChild[i].y = 410;
        this.odontChild[i].textBox.rect.y = 178 + posicion2;
        if (contador_60_66 == 5) {
          contador_60_66 = 0;
          posicion2 = posicion2 - 20;
        }
      }
      /**/

      this.odontChild[i].moveUpDown(-this.printPreviewPositionChange - 120);
      if (this.odontChild[i].type == 0) {
        this.odontChild[i].textBox.rect.y += this.printPreviewPositionChange;
      } else {
        this.odontChild[i].textBox.rect.y -= this.printPreviewPositionChange;
      }
    }

    for (var i = 0; i < this.odontSpacesChild.length; i++) {
      this.odontSpacesChild[i].moveUpDown(
        -this.printPreviewPositionChange - 120
      );
    }

    for (var i = 0; i < this.odontAdult.length; i++) {
      this.odontAdult[i].refresh();
    }

    for (var i = 0; i < this.odontChild.length; i++) {
      this.odontChild[i].refresh();
    }

    this.update();
  }

  loadPatientData(data: any) {
    this.treatmentData.office = data.office;
    this.treatmentData.patient = data.patient;
    this.treatmentData.number = data.number;
    this.treatmentData.treatmentNumber = data.treatmentNumber;
    this.treatmentData.treatmentDate = data.treatmentDate;
    this.treatmentData.dentist = data.dentist;
    this.treatmentData.observations = data.observations;
    this.treatmentData.specs = data.specs;
    this.treatmentData.plan = data.plan;
    console.log('loadPatientData:' + data.plan);
  }

  createDate() {
    var today: any = new Date();
    var dd: any = today.getDate();
    var mm: any = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;

    return today;
  }

  createHeader() {
    var seperation = 13;

    //this.renderer.renderTextCenter16("Odontograma",
    this.renderer.renderTextCenter16(
      '',
      this.renderer.width / 2,
      seperation,
      '#000000'
    );

    this.renderer.renderText14(
      'Fecha: ' + this.createDate(),
      this.renderer.width / 2 + 200,
      seperation,
      '#000000'
    );


    seperation = 15;

    this.renderer.renderText14('Sede', 4, seperation * 2, '#000000');

    this.renderer.renderText14(
      ': ' + this.treatmentData.office,
      100,
      seperation * 2,
      '#000000'
    );

    this.renderer.renderText14(
      'Nro. HC',
      this.renderer.width / 2 + 50,
      seperation * 2,
      '#000000'
    );

    this.renderer.renderText14(
      ': ' + this.treatmentData.number,
      this.renderer.width / 2 + 200,
      seperation * 2,
      '#000000'
    );

    this.renderer.renderText14('Paciente', 4, seperation * 3, '#000000');

    this.renderer.renderText14(
      ': ' + this.treatmentData.patient,
      100,
      seperation * 3,
      '#000000'
    );

    this.renderer.renderText14('Nro. Consulta', 4, seperation * 4, '#000000');

    this.renderer.renderText14(
      ': ' + this.treatmentData.treatmentNumber,
      100,
      seperation * 4,
      '#000000'
    );

    this.renderer.renderText14(
      'Fecha de consulta',
      this.renderer.width / 2 + 50,
      seperation * 4,
      '#000000'
    );

    this.renderer.renderText14(
      ': ' + this.treatmentData.treatmentDate,
      this.renderer.width / 2 + 200,
      seperation * 4,
      '#000000'
    );

    this.renderer.renderText14('Odont\u00F3logo', 4, seperation * 5, '#000000');

    this.renderer.renderText14(
      ': ' + this.treatmentData.dentist,
      100,
      seperation * 5,
      '#000000'
    );
  }

  printPreview() {
    this.renderer.clear(this.settings, 1);
    var contador_10_19 = 0;
    var contador_20_29 = 0;
    var contador_30_39 = 0;
    var contador_40_49 = 0;
    var contador_50_56 = 0;
    var contador_60_66 = 0;
    var contador_70_76 = 0;
    var contador_80_86 = 0;
    var posicion1 = 0;
    var posicion2 = 0;
    var posicion3 = 0;
    var posicion4 = 0;
    var posicion_1 = 0;
    var posicion_2 = 0;
    var posicion_3 = 0;
    var posicion_4 = 0;
    /**/

    this.createHeader();

    for (var i = 0; i <= this.odontAdult.length - 1; i++) {
      var cadena = this.odontAdult[i].image.src.split('/');
      var img =
        cadena[0] +
        '//' +
        cadena[2] +
        '/ODONTOGRAMA/images/d' +
        cadena[cadena.length - 1]; //pruebas

      this.odontAdult[i].image.src = img;
      if (this.odontAdult[i].id > 10 && this.odontAdult[i].id < 19) {
        contador_10_19++;
        this.odontAdult[i].y = 264;
        this.odontAdult[i].textBox.rect.y = 121 + posicion1;
        if (contador_10_19 == 8) {
          contador_10_19 = 0;
          posicion1 = posicion1 - 20;
        }
        /**/
      }
      if (this.odontAdult[i].id > 20 && this.odontAdult[i].id < 29) {
        contador_20_29++;
        this.odontAdult[i].y = 264;

        if (this.odontAdult[i].surfaces > 0) {
          this.odontAdult[i].textBox.rect.y = 121 + posicion2;
          if (contador_20_29 == 8) {
            contador_20_29 = 0;
            posicion2 = posicion2 - 20;
          }
        } else if (this.odontAdult[i].surfaces == 0 && i > 47 && i < 56) {
          this.odontAdult[i].textBox.rect.y = 121 + posicion2;
          if (contador_20_29 == 8) {
            contador_20_29 = 0;
            posicion2 = posicion2 + 60;
          }
        } else if (this.odontAdult[i].surfaces == 0 && i > 55 && i < 64) {
          this.odontAdult[i].textBox.rect.y = 41 + posicion2;
          if (contador_20_29 == 8) {
            contador_20_29 = 0;
            posicion2 = posicion2 - 40;
          }
        }
        /**/
      }

      if (this.odontAdult[i].id > 30 && this.odontAdult[i].id < 39) {
        contador_30_39++;
        this.odontAdult[i].y = 809;
        this.odontAdult[i].textBox.rect.y = 982 + posicion3;
        if (contador_30_39 == 8) {
          contador_30_39 = 0;
          posicion3 = posicion3 + 20;
        }
      }
      if (this.odontAdult[i].id > 40 && this.odontAdult[i].id < 49) {
        contador_40_49++;
        this.odontAdult[i].y = 809;
        this.odontAdult[i].textBox.rect.y = 982 + posicion4;
        if (contador_40_49 == 8) {
          contador_40_49 = 0;
          posicion4 = posicion4 + 20;
        }
      }
    }

    for (var i = 0; i <= this.odontChild.length - 1; i++) {
      var cadena = this.odontChild[i].image.src.split('/');
      //var img = cadena[0] + '//' + cadena[2] + '/images/d' + cadena[cadena.length - 1]; //desarrollo
      var img =
        cadena[0] +
        '//' +
        cadena[2] +
        '/ODONTOGRAMA/images/d' +
        cadena[cadena.length - 1]; //pruebas

      this.odontChild[i].image.src = img;
      if (this.odontChild[i].id > 50 && this.odontChild[i].id < 56) {
        contador_50_56++;
        this.odontChild[i].y = 454;

        this.odontChild[i].textBox.rect.y = 181 + posicion_1;
        if (contador_50_56 == 5) {
          contador_50_56 = 0;
          posicion_1 = posicion_1 - 20;
        }
        /**/
      }
      if (this.odontChild[i].id > 60 && this.odontChild[i].id < 66) {
        contador_60_66++;
        this.odontChild[i].y = 454;

        this.odontChild[i].textBox.rect.y = 181 + posicion_2;
        if (contador_60_66 == 5) {
          contador_60_66 = 0;
          posicion_2 = posicion_2 - 20;
        }
        /**/
      }

    }
 
    this.renderer.render(this.odontAdult, this.settings, this.constants, 'IMP');
    this.renderer.render(this.odontSpacesAdult, this.settings, this.constants);

    this.renderer.render(this.odontChild, this.settings, this.constants, 'IMP'); 
    this.renderer.render(this.odontSpacesChild, this.settings, this.constants);

    if (this.settings.DEBUG) {
      this.renderer.renderText('DEBUG MODE', 2, 15, '#000000');
      this.renderer.renderText(
        'X: ' + this.cursorX + ', Y: ' + this.cursorY,
        128,
        15,
        '#000000'
      );
    }

    this.renderer.renderText('Especificaciones: ', 4, 1100, '#000000');
    this.renderer.wrapText(
      this.treatmentData.specs,
      8,
      1122,
      this.renderer.width - 8,
      14,
      5
    );
    this.renderer.renderText('Observaciones: ', 4, 1300, '#000000'); //1300
    this.renderer.wrapText(
      this.treatmentData.observations,
      8,
      1322,
      this.renderer.width - 8,
      14,
      5
    );

    this.renderer.renderText('Plan de tratamiento: ', 4, 1500, '#000000');
    this.renderer.wrapText(
      this.treatmentData.plan,
      8,
      1522,
      this.renderer.width - 8,
      14,
      5
    );
    /**/
  }

  print() {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    var dataUrl = canvas.toDataURL();

    var windowContent = '<!DOCTYPE html>';
    windowContent += '<html lang="en">';
    windowContent += '<head>';
    windowContent +=
      '<meta http-equiv="content-type" content="text/html;charset=utf-8" />';
    windowContent += '<title>OIM Odontograma</title>';
    windowContent += '</head>';
    windowContent += '<body style=" margin:0;">';
    windowContent +=
      '<img style="display: block;margin-left: auto;margin-right: auto;" src="' +
      dataUrl +
      '">'; //jjallo 11092020
    windowContent += '</body>';
    windowContent += '</html>';

    var printWin: any = window.open(
      '',
      '',
      'width=' + screen.availWidth + ',height=' + screen.availHeight + 200
    );
    printWin.document.open();
    printWin.document.write(windowContent);

    printWin.document.addEventListener(
      'load',
      function () {
        printWin.focus();
        printWin.print();
        printWin.document.close();
        printWin.close();
      },
      true
    );

    this.preview = false;
    this.hidePrintPreview();
  }

  toggleObserverActivation(b: any) {
    this.observerActivated = b;
  }

  setObserver(obs: any) {
    this.observer = obs;
  }
}
