interface Iterator<T> {
  /**
   * Positions the iterator to the first element by setting the current element as the first element in the collection.
   */
  first(): T;

  /**
   * Advance the current element to the next element.
   */
  next(): T;

  /**
   * Test whether we have advanced beyond the last element and so finished the traversal.
   */
  isDone(): boolean;

  /**
   * Return the current element in the collection.
   */
  currentItem(): T;
}

abstract class Aggregate<T> {
  public abstract getIterator(): Iterator<T>;

  public abstract append(item: T): void;

  public abstract remove(item: T): void;
}

export class ListIterator<T> implements Iterator<T> {
  private current: number;
  protected collection: List<T>;

  public constructor(collection: List<T>) {
    this.current = 0;
    this.collection = collection;
  }

  public first() {
    this.current = 0;
    return this.collection.getItems()[this.current];
  }

  public next() {
    this.current++;
    return this.collection.getItems()[this.current];
  }

  public currentItem() {
    return this.collection.getItems()[this.current];
  }

  public isDone() {
    if (this.current === this.collection.getCount() - 1) {
      return true;
    }
    return false;
  }
}

export class List<T> extends Aggregate<T> {
  protected items: Array<T> = [];

  public append(item: T) {
    this.items.push(item);
  }

  public remove(item: T) {
    this.items.splice(this.items.indexOf(item), 1);
  }

  public getItems(): Array<T> {
    return this.items;
  }

  public getCount() {
    return this.items.length;
  }

  public getIterator(): Iterator<T> {
    return new ListIterator(this);
  }
}
