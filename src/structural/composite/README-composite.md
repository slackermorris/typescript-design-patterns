# Composite Pattern

## Overview

The Composite Pattern is used to compose objects into tree structures to represent part-whole hierarchies[^1]. Some objects are individual (_primitives_ or _leaves_), while some are _composite_ or _containers_ and contain collections of other objects, themselves composite or individual.

The benefit of this pattern is that clients interact with a common interface and therefore do not have to be aware of different object types. The pattern handles this complexity by ensuring all clients treat all objects uniformly as they share the same interface. Because the client doesn’t know whether it’s working with a simple object or a composite one, it can work with very complex object structures without being coupled to concrete classes that form that structure.

This is achieved through class inheritance: objects inherit from a common ancestor and therefore expose the same interface to clients.

## When to Use

- When dealing with a tree structure made up of part-whole hierarchies of objects.
- When you want clients to ignore the difference between complex compositions of objects and simple individual objects. The client should not worry about the concrete class of objects it works with [^2].

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

Imagine we have two types of objects: Products and Boxes. A Box can contain several Products as well as a number of smaller Boxes. These little Boxes can also hold some Products or even smaller Boxes, and so on. It is worth noting that a Box delegates most of its work to its sub-elements, passing any request it receives recursively to all its children which it then processes the intermediate results of.

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

There are some important design decisions worth drawing attention to. The main tension is between _transparency_—how little the client needs to know when handling these objects—and what constitutes good class hierarchy design. This tension plays out most notably when considering how we access and manage children for composite objects.

As mentioned, one of the main motivations for using the Composite pattern is to simplify our clients. The goal is to minimise the knowledge clients need when handling these objects, as they can treat them uniformly given they inherit from a common ancestor. This simplifies the accommodations needed in client code. If we follow this as intended behaviour, it needs to be reflected in our design—which is why we try to maximise the Component interface[^3].

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

However, there is tension here. A principle of class hierarchy design is that classes only define operations that are meaningful to their subclasses[^3]. Product objects are childless by nature—they have no use for any child-related operations. So, how do we achieve a balance?

### Accessing Children Safely

Accessing children is a safe operation—we do not gain much by hiding it from our Product primitive. With a little creativity, we can define it as part of the Component interface, inheritable by both Box and Product classes. We provide a default implementation that is overridden by the Box composite class but kept intact for the Product primitive.

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

This preserves the desired behaviour: the client can ignore any difference between the supported classes.

### Managing Children: Transparency vs Safety

Managing children is different—it involves mutating state. This is an inherently riskier operation, so safety becomes a top consideration. Here the principle of class hierarchy design takes precedence: we choose not to support meaningless operations on the Product class, which cannot keep children. This is a deliberate choice against the intended benefit of the Composite pattern, as the client must now be aware of the distinction between different object types in the hierarchy.

This is a trade-off between:

- **Transparency**: Treating all components uniformly—the proposed benefit of this pattern.
- **Safety**: Operations are defined and implemented only where they are applicable.

We diverge from the previous design decision of maximising the Component interface:

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

Because we are now supporting two different interfaces, we have lost transparency. At times we will lose type information of the objects we are working with. We therefore need a way to distinguish between object types before taking an appropriate action—performing `add` or `remove` safely on the composite Box class.

We achieve this by declaring a `getBox` operation on the Component interface. It provides a default implementation returning a null pointer (0), which the Product primitive inherits. The Box class redefines this to return itself via the `this` pointer.

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
- [ ] Create a complex test scenario of deeply nested structures.
- [ ] Use a Map instead of an Array for storing the children on the Box object.

## References

[^1]: Design Patterns: Elements of Reusable Object-Oriented Software, page 163.
[^2]: Design Patterns: Elements of Reusable Object-Oriented Software, page 164.
[^3]: Design Patterns: Elements of Reusable Object-Oriented Software, page 167 > Implementation > 3. Maximizing the Component interface.
