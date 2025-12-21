export abstract class Component {
  public getBox(): Box | 0 {
    return 0;
  }

  public getChild(index: number): Component | void {
    return;
  }

  public abstract operation(): string;
}

export class Box extends Component {
  protected children: Array<Component> = [];

  public getBox() {
    return this;
  }

  public getChild(index: number) {
    return this.children[index];
  }

  public add(component: Component) {
    this.children.push(component);
  }

  public remove(component: Component) {
    const componentIndex = this.children.indexOf(component);
    this.children.splice(componentIndex, 1);
  }

  public operation() {
    return "Box";
  }
}

export class Product extends Component {
  public operation() {
    return "Product";
  }
}
