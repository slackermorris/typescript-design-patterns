abstract class Iterator {
  public first(): void {
    throw new Error("Method not implemented.");
  }
  public next(): void {
    throw new Error("Method not implemented.");
  }
  public isDone(): boolean {
    throw new Error("Method not implemented.");
  }
  public currentItem(): void {
    throw new Error("Method not implemented.");
  }
}

abstract class Aggregate {
  public abstract getIterator(): Iterator;
}

export class ListIterator implements Iterator {
  protected collection: Collection;

  public constructor(collection: Collection) {
    this.collection = collection;
  }

  public first(): void {
    throw new Error("Method not implemented.");
  }
  public next(): void {
    throw new Error("Method not implemented.");
  }
  public isDone(): boolean {
    throw new Error("Method not implemented.");
  }
  public currentItem(): void {
    throw new Error("Method not implemented.");
  }
}

export class Collection implements Aggregate {
  protected items: Array<string> = [];

  public add(item: string) {
    this.items.push(item);
  }

  public remove(item: string) {
    this.items.splice(this.items.indexOf(item), 1);
  }

  public getItems(): Array<string> {
    return this.items;
  }

  public getIterator(): Iterator {
    return new ListIterator(this);
  }
}
