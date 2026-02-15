// inventory.js
class Inventory {
  constructor(slotCount = 3) {
    this.slotCount = slotCount;
    this.slots = new Array(slotCount).fill(null); // store item ids/objects later
    this.selected = 0;
  }

  select(index) {
    if (index < 0 || index >= this.slotCount) return;
    this.selected = index;
  }

  getSelectedIndex() {
    return this.selected;
  }

  getSelectedItem() {
    return this.slots[this.selected];
  }

  setItem(index, item) {
    if (index < 0 || index >= this.slotCount) return false;
    this.slots[index] = item;
    return true;
  }

  addItem(item) {
    const i = this.slots.findIndex((s) => s === null);
    if (i === -1) return false;
    this.slots[i] = item;
    return true;
  }

  removeItem(index) {
    if (index < 0 || index >= this.slotCount) return null;
    const item = this.slots[index];
    this.slots[index] = null;
    return item;
  }

  clear() {
    for (let i = 0; i < this.slotCount; i++) this.slots[i] = null;
    this.selected = 0;
  }
}