## Description

The Composite Pattern is used to compose objects into tree structures to represent part-whole hierarchies^[1]. Some objects are individual, _primitives_, while some are _composite_ or _containers_ and contain collections of other objects, themselves _composite_ or _individual_.

The benefit of this pattern is that clients interact with a common interface and therefore do not have to be aware of there being different types of objects. The pattern handles this complexity. Clients do not have to make a distinction when handling these objects. They treat the objects the same as they have the same interface. Clients ign

The pattern achieves this by leveraging a common interface and class inheritance. Objects inherit from a common ancestor and therefore make use of the same interface.

## Use Case

- When dealing with a tree structure made up of part-whole hierachies of objects.
- When you want clients to ignore the difference between compositions of objects and individual objects^[2].

## Example

I took this scenario from [Refactoring Guru](https://refactoring.guru/design-patterns/composite), specifically, the [TypeScript example of this design pattern](https://refactoring.guru/design-patterns/composite/typescript/example#lang-features).

Imagine we have two types of objects: Products and Boxes. A Box can contain several Products as well as a number of smaller Boxes. These little Boxes can also hold some Products or even smaller Boxes, and so on.

[INSERT ASCII DIAGRAM]()

pg 167

I should maximise the component interface and make clients unaware of the specific Leaf or Composite classes. So, the getBox function is leaking details of the concrete classes to the client which is not great.

component class can usually provide default implementations of the common operations.

class hierarchy design = class only define operations that are meaningful to its sub classes.

composite objects always delegate to their children

## Design Decisions

There are some important design decisions that are worth drawing attention to. Mostly, the distinction is in how we access and manage children for the composite objects. One of the main motivations for using the Composite pattern is to simplify our clients, its purpose or consequence is to minimise the amount of knowledge the clients needs to consider when handling these objects as they can treat them uniformly, given they inherit from a common ancestor. This simplifies the accommodations that need to be done in the client code. And if we follow this as a preferred or intended behaviour then that needs to be reflected in our design. This is why we try to maximise the Component interface^[3].

To achieve this end, the common Component class should define as many common operations for Box, composite, and Product, primitive, classes as possible.

```typescript
export abstract class Component {
  public getChild(index: number) {}

  public add(component: Component) {}

  public remove(component: Component) {}

  public abstract operation(): string;
}
```

And the subclasses, Box and Product provide their own implementation of the interface. However, there is some tension here. A principle of class hierachy design is that classes only define operations that are meaningful to its sub classes^[3]. How do we achieve a balance? Lets start with functionality to access children. Accessing state is a safe operation and with a little creativity we can make it an operation defined as part of the Component interface, inheritable by both Box and Product classes and provide a default implementation that is overriden by the Box composite class but kept in tact for the Product primitive class.

```typescript
export abstract class Component {
  public getChild(index: number): Component | void {
    return;
  }

  public abstract operation(): string;
}

export class Box extends Component {
  protected children: Array<Component> = [];

  public getChild(index: number) {
    return this.children[index];
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

const childIndex = 1;

const product = new Product();
product.getChild(childIndex); // undefined

const box = new Box();
box.getChild(childIndex); // Component | undefined
```

With this we preserve a desired behaviour of making sure the client can ignore any difference between the supported classes. But what about managing children? This is a little different as it involves mutating state about children. It is an inherently more risky operation and so safety becomes a top consideration. This is where that principle of class hierachy design becomes more prominent. Preferably, we would only declare the management operations on the Box class and prevent, as a safety mechanism, supporting meaningless operations on the Product class, a class that does not support keeping children. This of course is a trade-off between transparency for the client as we cannot treat all components uniformly, and safety whereby operations are defined on the interface for where they are applicable. This is where we diverge from the previous design decision of maximising the Component interface.

```typescript
export abstract class Component {
  public getChild(index: number): Component | void {
    return;
  }

  public abstract operation(): string;
}

export class Box extends Component {
  protected children: Array<Component> = [];

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
```

Unfortunately, because we are now supporting two different interfaces we have lost transparency, which means at times we will lose type information of the objects we are using. We therefore need a way to distinguish between the different object types before taking an appropriate action, performing `add` or `remove` safely on the composite Box class. We can achieve this by declaring a `getBox` operation on the Component interface which provides a default implementation that returns a null pointer. The Box class then redefines this operation to return itself through the this pointer, while the Product primitive class inherits what is declared and implemented in the base class.

```typescript
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
```

## TODO

- [ ] Make composite class delete its children from memory when it itself is destroyed.
- [ ] The indexOf logic for deleting does not seem reliable.
- [ ] Create a complex test scenario of deeply nested structures.

## References

^[1]: Design Patterns Elements of Reusable Object-Oriented Software page 163.
^[2]: Design Patterns Elements of Reusable Object-Oriented Software page 164.
^[3]: Design Patterns Elements of Reusable Object-Oriented Software page 167 > #Implementation > 3. Maximimizing the Component interface.
