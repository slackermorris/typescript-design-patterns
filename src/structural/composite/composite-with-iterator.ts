export abstract class Component {
  public getBox(): Box | 0 {
    return 0;
  }

  public getChild(index: number): Component | void {
    return;
  }

  public abstract netPrice(): number;
}

export interface Aggregate {
  getIterator(): Iterator;

  append(item: unknown): void;

  remove(item: unknown): void;
}

export interface Iterator {
  /**
   * Positions the iterator to the first element by setting the current element as the first element in the collection.
   */
  first(): unknown;

  /**
   * Advance the current element to the next element.
   */
  next(): unknown;

  /**
   * Test whether we have advanced beyond the last element and so finished the traversal.
   */
  isDone(): boolean;

  /**
   * Return the current element in the collection.
   */
  currentItem(): unknown;
}

/**
 * A concrete class that implements the interfaces of both the Composite (Component) and Iterator (Aggregate) class patterns.
 */
export class Box extends Component implements Aggregate {
  protected children: Array<Component> = [];

  public getBox() {
    return this;
  }

  public getChild(index: number) {
    return this.children[index];
  }

  public append(component: Component) {
    this.children.push(component);
  }

  public remove(component: Component) {
    const componentIndex = this.children.indexOf(component);
    if (componentIndex == -1) {
      return;
    }

    this.children.splice(componentIndex, 1);
  }

  public getItems() {
    return this.children;
  }

  public getCount() {
    return this.children.length;
  }

  public getIterator(): Iterator {
    return new ListIterator(this);
  }

  public netPrice() {
    const iterator = this.getIterator();

    let totalNetPrice = 0;

    for (iterator.first(); !iterator.isDone(); iterator.next()) {
      const nextItem = iterator.currentItem();
      // @ts-ignore - [ ] Fix the typing to make use of generics.
      totalNetPrice += nextItem.netPrice();
    }

    // [ ] Be sure to clean up and delete the iterator.
    // delete iterator;
    return totalNetPrice;
  }
}

/**
 * A concrete class that inherits from the Component base class used in the Composite pattern.
 */
export class Product extends Component {
  public netPrice() {
    return 20;
  }
}

/**
 * A concrete class that defines an Iterator algorithm.
 */
export class ListIterator implements Iterator {
  private current: number;
  protected collection: Box;

  public constructor(collection: Box) {
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
    if (this.isDone()) {
      throw new IteratorOutOfBoundsError();
    }
    return this.collection.getItems()[this.current];
  }

  public isDone() {
    const collectionCount = this.collection.getCount();
    if (this.current >= collectionCount) {
      return true;
    }
    return false;
  }
}

export class IteratorOutOfBoundsError extends Error {
  constructor(message = "The iteration has already terminated") {
    super(message);
    this.name = "IteratorOutOfBoundsError";
  }
}

export class NullIterator implements Iterator {
  public first() {
    return;
  }

  public next() {
    return;
  }

  public currentItem() {
    return;
  }

  public isDone() {
    return true;
  }
}
