# Composite With Iterator Pattern

## Overview

In the Composite pattern the Composite class contains collections of other objects of the same interface. It is therefore the responsibility of this class to manage access to its children and all the children that are recursively nested below it. Access to children is expressed as traversal logic or algorithm. Sometimes this logic can be complicated and can distract from the intention or responsibility of this Composite class. It can therefore be of benefit to introduce or combine the Composite pattern with the Iterator pattern and use an Iterator to manage the traversal logic used by the Composite class to access its children.

## When to Use

- When the traversal algorithm used to access children on the Composite class is either complicated or as a concept varies the most (e.g., most of the access can be achieved as a simple list traversal or we want to leverage the performance accuracy of a breadth first search) can benefit most from being encapsulated.

## Structure

### Class Diagram

```ascii
┌─────────────────────────────────┐      ┌──────────────────────────────┐
│    <<abstract>> Component       │      │   <<interface>> Aggregate    │
├─────────────────────────────────┤      ├──────────────────────────────┤
│ + getBox(): Box | 0             │      │ + getIterator(): Iterator    │
│ + getChild(index): Component    │      │ + append(item): void         │
│ + netPrice(): number {abstract} │      │ + remove(item): void         │
└─────────────────────────────────┘      └──────────────────────────────┘
              △                                       △
              │ extends                               │ implements
    ┌─────────┴─────────┐                             │
    │                   │                             │
┌───┴───────────────────┴─────────────────────────────┴───┐
│                        Box                              │
│                 (Composite + Aggregate)                 │
├─────────────────────────────────────────────────────────┤
│ - children: Component[]                                 │
├─────────────────────────────────────────────────────────┤
│ + getBox(): this                                        │
│ + getChild(index): Component                            │
│ + append(component): void                               │
│ + remove(component): void                               │
│ + getItems(): Component[]                               │
│ + getCount(): number                                    │
│ + getIterator(): Iterator                               │
│ + netPrice(): number                                    │
└─────────────────────────────────────────────────────────┘
         ◇                            ◆
         │ contains                   │ creates
         ▼                            ▼
   Component[]              ┌──────────────────────────────┐
                            │       ListIterator           │
┌───────────────────┐       ├──────────────────────────────┤
│     Product       │       │ - current: number            │
│    (Primitive)    │       │ - collection: Box            │
├───────────────────┤       ├──────────────────────────────┤
│ + netPrice()      │       │ + first(): Component         │
└───────────────────┘       │ + next(): Component          │
        △                   │ + isDone(): boolean          │
        │ extends           │ + currentItem(): Component   │
        │                   └──────────────────────────────┘
┌───────┴─────────────────┐               △
│   <<abstract>> Component │               │ implements
└─────────────────────────┘               │
                            ┌─────────────┴────────────────┐
                            │    <<interface>> Iterator    │
                            ├──────────────────────────────┤
                            │ + first(): unknown           │
                            │ + next(): unknown            │
                            │ + isDone(): boolean          │
                            │ + currentItem(): unknown     │
                            └──────────────────────────────┘
                                          △
                                          │ implements
                            ┌─────────────┴────────────────┐
                            │        NullIterator          │
                            ├──────────────────────────────┤
                            │ + first(): void              │
                            │ + next(): void               │
                            │ + isDone(): true             │
                            │ + currentItem(): void        │
                            └──────────────────────────────┘
```

### Conceptual Object Structure

When a Box (composite) needs to calculate its `netPrice`, it delegates to an Iterator to traverse its children. The Iterator encapsulates the traversal algorithm, allowing the Box to focus on its core responsibility of aggregating results. Each Box creates its own iterator, enabling nested traversals.

```ascii
                    ┌─────────────────────────────────────┐
                    │               Box                   │
                    │  ┌─────────┬─────────┬─────────┐    │
                    │  │ Product │   Box   │ Product │    │──────┐
                    │  │  ($20)  │         │  ($20)  │    │      │
                    │  └─────────┴────┬────┴─────────┘    │      │
                    └─────────────────┼───────────────────┘      │
                                      │                          │
                              ┌───────┴───────┐            ┌─────▼─────────────┐
                              ▼               ▼            │   ListIterator    │
                         ┌─────────┐     ┌─────────┐       │   current: 0      │
                         │ Product │     │ Product │       │   collection: Box │
                         │  ($20)  │     │  ($20)  │       └───────────────────┘
                         └─────────┘     └─────────┘

    Box.netPrice() Execution:
    ┌──────────────────────────────────────────────────────────────────────┐
    │  1. Box creates ListIterator                                         │
    │  2. iterator.first() → current = 0                                   │
    │  3. Loop: while !iterator.isDone()                                   │
    │     │  ├─ iterator.currentItem() → Product ($20)                     │
    │     │  ├─ totalNetPrice += 20                                        │
    │     │  └─ iterator.next() → current++                                │
    │  4. Returns totalNetPrice = 80 (sum of all nested Products)          │
    └──────────────────────────────────────────────────────────────────────┘

Legend:
  Box          = Composite (container, implements both Component and Aggregate)
  Product      = Primitive (leaf, no children)
  ListIterator = Concrete Iterator (traverses Box's children)
  NullIterator = Null Object (used when no traversal is needed)
```

_This combines the Composite pattern structure with the Iterator pattern for traversal._

## Implementation

The most important conceptual join is that the Composite class from the [Composite pattern]('./README-composite.md') is now also the Aggregate class from the [Iterator pattern]('../../../../behavioural/iterator/README-iterator.md'). Fundamentally, The aggregate class (collection) holds the collection of items and provides an iterator for traversal.

For our use case, we want to be able to calculate the net price of a Box. Remember, a Box may contain Products which have a definite price ($20) or other Boxes that themselves contain either more Boxes or Products. So, calculating the total in any one Box becomes an exercise in traversing all children and adding the cost of all Products up. Say something about delegating the work of computing the cost to the outermost primitives, the Products, in our graph of objects. We could achieve this functionality by declaring it in the Box class, but it is better to encapsulate it so we may have greater flexibility in what method or approach we take to traversal by using an Iterator.

To first change we introduce is extending the common Component interface for the Composite classes by adding a `netPrice` method.

```typescript
abstract class Component {
  ...,

  public abstract netPrice(): number;
}
```

Next, we diverge a little from how we implemented the Composite pattern where methods for managing the children on the Composite object were `add` and `remove`. We preserve declaring the methods on the class where they are relevant, of prioritising safety over transparency, but we change their signature to reflect what is used by the Aggregate class and our Iterator pattern to be the more generic `append` and `remove`. In addition to this the Box now exposes a `getIterator` function which matches the interface and responsibility of the Aggregate interface. This design decision is in line with what I chose as outlined in [Composite Pattern > Managing Children]('./README-composite.md')

```typescript
class Box extends Component implements Aggregate {
  protected children: Array<Component> = [];

  //   <COMPOSITE_METHODS>...

  public append(component: Component) {}

  public remove(component: Component) {}

  public getIterator(): Iterator {}

  public netPrice() {}
}
```

In the Iterator pattern, the `getIterator` function exposes an external iterator that can be used by the client, whereever the class is instantiated, to traverse the collection, the data structure, contained by the Aggregate class. In combining the two patterns, we don't actually make use of exposing the iterator like this. Instead, this method is called from inside of the Box class in the netPrice method. In fact, it feels a little strange and leaky to have the client write logic specific to using the iterator so I don't know exatly why we expose the `getIterator` function externally. Anyway, now that our Composite class supports the signature and behaviour of the Iterator Aggregate class, we can make use of an iterator to compute the total price of items inside a given Box and the nested children (Boxes and Products) below it^[1].

```typescript
class Box extends Component implements Aggregate {
  protected children: Array<Component> = [];

  //   <COMPOSITE_METHODS>...

  public append(component: Component) {}

  public remove(component: Component) {}

  public getIterator(): Iterator {
    return new ListIterator(this);
  }

  public netPrice() {
    const iterator = this.getIterator();

    let totalNetPrice = 0;

    for (iterator.first(); !iterator.isDone(); iterator.next()) {
      const nextItem = iterator.currentItem();
      totalNetPrice += nextItem.netPrice();
    }

    delete iterator;
    return totalNetPrice;
  }
}
```

### Accessing Children: Transparency vs Safety

Similar to the design decision we made in the Composite pattern, here we have chosen to prioritise maximising the component interface, the common root interface used by the Composite pattern classes, and maximise transparency so clients of the classes do not need to worry or accommodate there being a difference and we provide a default implementation of the `getIterator` method. Again, this default implementation will be used by the primitive Product class, and the container Box class will override it and provide it own implementation.

```typescript
abstract class Component {
  public getBox(): Box | 0 {
    return 0;
  }

  public getChild(index: number): Component | void {
    return;
  }

  public getIterator(): Iterator {
    return new NullIterator();
  }

  public abstract netPrice(): number;
}
```

## Key Principles

-

## TODO

- [ ] Does the Iterator concrete class depend on the Aggregate concrete class exposing member functions like getItems and getCount?
- [ ] Add TS generic support

## References

[^1]: Design Patterns: Elements of Reusable Object-Oriented Software, page 171.
