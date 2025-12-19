I am going to use the example of Products and Boxes. 


I think it would also make sense to draw a diagram that I could include here. A class diagram. 

https://refactoring.guru/design-patterns/composite

https://refactoring.guru/design-patterns/composite/typescript/example#lang-features


For example, imagine that you have two types of objects: Products and Boxes. A Box can contain several Products as well as a number of smaller Boxes. These little Boxes can also hold some Products or even smaller Boxes, and so on.


pg 163
compose objects into tree structures to represent part-whole hierachies

user treats the objects the same. make them use the same interface. recursive composition so that clients do not have to make the distinction. 

pg 164
abstract class represents both primitives and containers. composite operations = accessing and managing children. 

clients IGNORE the difference between compositions of objects and individual objects


pg 167

I should maximise the component interface and make clients unaware of the specific Leaf or Composite classes. So, the getBox function is leaking details of the concrete classes to the client which is not great. 

component class can usually provide default implementations of the common operations.

class hierarchy design = class only define operations that are meaningful to its sub classes. 


## Design Decisions

I only want to declare the child management operations on the Box component. This means there is a trade-off between safety and transparency. 

By not declaring the child management interface at the root of the class hierarchy we lose transparency because we cannot treat all components uniformly. But we have safety because the client can no longer try to do meaningless operations on the individual Product components like add and remove. Products and Boxes now have a different interface. But we need the type information so this is where the `getBox` function comes into place. Box redefines the operation to return itself.

This way we can query a component to see if it is a composite. We can perform add and remove safely on the composite, Box, it returns. 

Maximised the component interface by having accessing children operations defined on the root Component class. But then management operations I scoped to the Box component? This seems like a bit of a conflict. Then composite classes will reimplment the logic for child access functions. 

This is the difference in how I approached accessing the children versus managing the children. 