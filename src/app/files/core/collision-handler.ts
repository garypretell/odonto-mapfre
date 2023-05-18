export class CollisionHandler {
  constants: any = null;

  setConstants(constants: any) {
    this.constants = constants;
  }

  handleCollision(
    tooth: any,
    argument: any,
    direction?: any,
    state?: any,
    statetext?: any,
    posicion?: any,
    contador?: any
  ) {
    var newArg;

    try {
      newArg = Number(argument);
    } catch (e: any) {
      console.log('Handle Collision Exception: ' + e.message);
    }

    if (newArg == 0) {
      console.log('handleCollision->');
      tooth.toggleDamage(newArg, direction, state, statetext);
    }

    if (newArg !== 0 && newArg !== undefined && !isNaN(newArg)) {
      if (
        newArg !== this.constants.CARIES &&
        newArg !== this.constants.CURACION
      ) {
        tooth.toggleDamage(
          newArg,
          direction,
          state,
          statetext,
          posicion,
          contador
        );
      }
    }
  }

  handleCollisionCheckBox(checkBox: any, argument: any) {
    var newArg;

    try {
      newArg = Number(argument);
    } catch (e: any) {
      console.log('Handle Collision Exception: ' + e.message);
    }

    if (newArg == this.constants.CARIES) {
      if (checkBox.state == 1) {
        checkBox.state = 0;
      } else {
        checkBox.state = 1;
      }
    } else if (newArg == this.constants.CURACION) {
      if (checkBox.state == 11) {
        checkBox.state = 0;
      } else {
        checkBox.state = 11;
      }
    } else if (newArg == this.constants.TRATAMIENTO_TEMPORAL) {
      if (checkBox.state == 39) {
        checkBox.state = 0;
      } else {
        checkBox.state = 39;
      }
    } else if (newArg == this.constants.SELLANTES) {
      if (checkBox.state == 40 || checkBox.state == 0) {
        checkBox.state = 40;
      } else {
        checkBox.state = -40;
      }
    } else if (newArg === this.constants.PULPOTOMIA) {
      if (checkBox.state === 46 || checkBox.state === 0) {
        checkBox.state = 46;
      } else {
        checkBox.state = -46;
      }
    }
  }
}
