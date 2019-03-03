export default class {
  guest = true;

  constructor() {
    this.nickname = 'guest';
  }
  isGuest() {
    return this.guest;
  }
}
