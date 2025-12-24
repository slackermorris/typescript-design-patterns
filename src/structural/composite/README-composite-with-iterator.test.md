# Composite Pattern

## Overview

## When to Use

- ...

## Structure

### Class Diagram

...

### Conceptual Object Structure

...

## Implementation

I added a NullPointer as the default implementation of the getIterator function. This getIterator is what we declare on the Aggregate as part of the Iterator pattern but now it forms part of the Component as used by both primitive and container components in the Composite pattern.

there is a bit of tension here because in the Iterator pattern I use the Aggregate and this declares the append and remove functions. I made a conscious decision to not include these are part of the talking about [managing children on the Composite]('./README-composite.md').

The Box is both the composite class and the aggregate class so I morphed everything I had

I decided against providing a default implementation for the iterator on the base Component

not entirely sure how I make use of the iterator in the composite... given that it needs to be internal and not external

decided to use an internal iterator because of the nature of the deeply nested composite structure. i don't really have the benefit of being able to use an external one where the client would be the composite class and i do not want to have to include a bunch of iterator client code in this class

The aggregate class (collection) holds the collection of items and provides an iterator for traversal.

pg 171 - give an implementation of calculating the netPrice using an iterator on the composite which is also the aggregate or the collection

https://stackoverflow.com/questions/26948400/typescript-how-to-extend-two-classes

...

## Key Principles

-

## TODO

- [ ] Does the Iterator concrete class depend on the Aggregate concrete class exposing member functions like getItems and getCount?
- [ ] Add TS generic support

## References
