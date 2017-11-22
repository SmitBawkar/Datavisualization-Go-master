# Data Model Visualization Using GoJs

This project was built to visualize the underlying data model of IVP Reference Master product. The visualization is intened to closely represent ER diagram and preferably use ERD notation.

### Reference Master

Reference Master is a product which allows you to manage reference data for your needs by maintaining a single version of the truth with a time series support and audit trails. It allows you to create a dynamic data model with all the constraints(unique, mandatory, primary, lookups, etc) which can be changed as and when required.

### Problem Statement

Since Reference master uses dynamic data model, All the constraints are modeled in a logical layer and not as physical constraints/keys in the database. Thus one cannot generate a database diagram given the constraints are not present in the physical layer.

### Visualization using Go Js

GoJS is a feature-rich JavaScript library for implementing custom interactive diagrams and complex visualizations across modern web browsers and platforms. GoJS makes constructing JavaScript diagrams of complex nodes, links, and groups easy with customizable templates and layouts.

** more about GOJS - https://gojs.net/latest/index.html

A custom visualization tool to visualize underlying data model was built on top of the logical layer using GOJs by identifying the metadata that was generated while modeling entities from UI. The results was a beautiful interactive ER diagram with all the constraints, relationships, integrity checks, cardinalities visualized


### Screen Shots

[![mutt dark](https://github.com/SmitBawkar/Datavisualization-Go-master/edit/master/image.png)](https://github.com/SmitBawkar/Datavisualization-Go-master/edit/master/image.png)

[![mutt light](https://github.com/SmitBawkar/Datavisualization-Go-master/edit/master/image(1).png)](https://github.com/SmitBawkar/Datavisualization-Go-master/edit/master/image(1).png)
