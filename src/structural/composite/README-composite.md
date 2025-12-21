# Composite Pattern

## Overview

The Composite Pattern is used to compose objects into tree structures to represent part-whole hierarchies[^1]. Some objects are individual (_primitives_ or _leaves_), while some are _composite_ or _containers_ and contain collections of other objects, themselves composite or individual.

The benefit of this pattern is that clients interact with a common interface and therefore do not have to be aware of there being different types of objects. The pattern handles this complexity. Clients do not have to make a distinction when handling these objects—they treat them uniformly as they share the same interface.

The pattern achieves this by leveraging a common interface and class inheritance. Objects inherit from a common ancestor and therefore make use of the same interface.

## When to Use

- When dealing with a tree structure made up of part-whole hierarchies of objects.
- When you want clients to ignore the difference between compositions of objects and individual objects[^2].

## Structure

### Class Diagram

```
┌─────────────────────────────────┐
│      <<abstract>> Component     │
├─────────────────────────────────┤
│ + getBox(): Box | 0             │
│ + getChild(index): Component    │
│ + operation(): string {abstract}│
└─────────────────────────────────┘
              △
              │
    ┌─────────┴─────────┐
    │                   │
┌───┴───────────────┐  ┌┴──────────────┐
│       Box         │  │    Product    │
│    (Composite)    │  │   (Primitive) │
├───────────────────┤  ├───────────────┤
│ - children: []    │  │               │
├───────────────────┤  ├───────────────┤
│ + getBox(): this  │  │ + operation() │
│ + getChild(i)     │  └───────────────┘
│ + add(component)  │
│ + remove(component)│
│ + operation()     │
└───────────────────┘
        ◇
        │ contains
        ▼
   Component[]
```

### Conceptual Object Structure

Imagine we have two types of objects: Products and Boxes. A Box can contain several Products as well as a number of smaller Boxes. These little Boxes can also hold some Products or even smaller Boxes, and so on.

```
                    ┌─────────┐
                    │   Box   │
                    └────┬────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     ┌─────────┐    ┌─────────┐    ┌─────────┐
     │ Product │    │   Box   │    │ Product │
     └─────────┘    └────┬────┘    └─────────┘
                   ┌─────┴─────┐
                   ▼           ▼
              ┌─────────┐ ┌─────────┐
              │ Product │ │   Box   │
              └─────────┘ └────┬────┘
                               │
                               ▼
                          ┌─────────┐
                          │ Product │
                          └─────────┘

Legend:
  Box     = Composite (can contain children)
  Product = Leaf (no children)
```

_This scenario is adapted from [Refactoring Guru's Composite Pattern](https://refactoring.guru/design-patterns/composite)._

## Implementation

There are some important design decisions worth drawing attention to. The main tension is between how we minimise how much the client needs to know when handling these objects, the _transparency_, and what constitutes good class hierarchy design. This tension plays out most notably when considering how we access and manage children for composite objects.

As has been mentioned, one of the main motivations for using the Composite pattern is to simplify our clients. Its purpose is to minimise the amount of knowledge clients need when handling these objects, as they can treat them uniformly given they inherit from a common ancestor. This simplifies the accommodations needed in client code. If we follow this as intended behaviour, it needs to be reflected in our design. This is why we try to maximise the Component interface[^3].

### Maximising the Component Interface

To achieve this end, the common Component class should define as many common operations for Box (composite) and Product (primitive) classes as possible.

```typescript
export abstract class Component {
  public getChild(index: number) {}

  public add(component: Component) {}

  public remove(component: Component) {}

  public abstract operation(): string;
}
```

However, there is tension here. A principle of class hierarchy design is that classes only define operations that are meaningful to their subclasses[^3]. Product objects are childless by their nature. They therefore have no use for any child related operations. So, how do we achieve a balance?

### Accessing Children Safely

Accessing children state is a safe operation. We do not gain much in the way of safety if we expose it on our Product primitive. With a little creativity we can make it an operation defined as part of the Component interface, inheritable by both Box and Product classes. We provide a default implementation that is overridden by the Box composite class but kept intact for the Product primitive class.

```typescript
export abstract class Component {
  public getChild(index: number): Component | void {
    return;
  }

  ...,
}

export class Box extends Component {
  protected children: Array<Component> = [];

  public getChild(index: number) {
    return this.children[index];
  }

  ...,
}

export class Product extends Component {
  ...,
}

const childIndex = 1;

const product = new Product();
product.getChild(childIndex); // undefined

const box = new Box();
box.getChild(childIndex); // Component | undefined
```

With this we preserve the desired behaviour of making sure the client can ignore any difference between the supported classes.

### Managing Children: Transparency vs Safety

Managing children is different as it involves mutating state. It is an inherently more risky operation, so safety becomes a top consideration. This is where the principle of class hierarchy design and choose to not supporting meaningless operations on the Product class (which does not support keeping children) becomes more prominent and where we make a choice against the intended design or benefit of the Composite pattern proper of not making the client have to be aware of distinguishing the different objects involved in the hierarchy.

This is a trade-off between:

- **Transparency**: Treating all components uniformly: the proposed benefit of this pattern.
- **Safety**: Operations are defined (and implemented) only where they are applicable.

Here we diverge from the previous design decision of maximising the Component interface:

```typescript
export abstract class Component {
  ...,
}

export class Box extends Component {
  protected children: Array<Component> = [];

  public add(component: Component) {
    this.children.push(component);
  }

  public remove(component: Component) {
    const componentIndex = this.children.indexOf(component);
    this.children.splice(componentIndex, 1);
  }

  ...,
}

export class Product extends Component {
  ...,
}
```

### Type Discrimination with `getBox()`

Because we are now supporting two different interfaces, we have lost transparency. At times we will lose type information of the objects we are using. We therefore need a way to distinguish between the different object types before taking an appropriate action—performing `add` or `remove` safely on the composite Box class.

We can achieve this by declaring a `getBox` operation on the Component interface which provides a default implementation that returns a null pointer (0), which is the implementation inherited by the Product primitive class. The Box class then redefines this operation to return itself through the `this` pointer.

> **Note:** The `getBox` function does leak details of the concrete classes to the client, which is a compromise on transparency.

```typescript
export abstract class Component {
  public getBox(): Box | 0 {
    return 0;
  }

  ...,
}

export class Box extends Component {
  public getBox() {
    return this;
  }

  ...,
}

export class Product extends Component {
  ...,
}
```

## Key Principles

- **Component classes can usually provide default implementations** of the common operations.
- **Class hierarchy design**: Classes should only define operations that are meaningful to their subclasses.
- **Composite objects always delegate to their children** when performing operations.

## TODO

- [ ] Make composite class delete its children from memory when it itself is destroyed.
- [ ] The `indexOf` logic for deleting does not seem reliable.
- [ ] Create a complex test scenario of deeply nested structures.

## References

[^1]: Design Patterns: Elements of Reusable Object-Oriented Software, page 163.
[^2]: Design Patterns: Elements of Reusable Object-Oriented Software, page 164.
[^3]: Design Patterns: Elements of Reusable Object-Oriented Software, page 167 > Implementation > 3. Maximizing the Component interface.
