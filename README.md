ApplicationModel
=================

A Model class on top of CoffeeScript and Object.defineProperty()

This is an implementation of Model class.

It provides:
* simple API to instantiate some class instance
* simple API to manage all property changes by using getter and setter functions
* simple API to format instance by using formatter functions.

The idea is based on some cool features of different projects:
* classes from CoffeeScript
* parsers/formatters from AngularJS
* accessors from Eloquent model in Laravel.

## Parsers
Parsers should be useful when instantiating some
class with predefined data that is not in proper form.

For example, server returns you some data with some properties
representing dates. If that dates are stored in ISO, datetime or timestamp format,
but you want to operate with Date instances, parsers would help you.

You should simply create a parser function in your object's prototype.
The value, returned by that function, will be assigned to your instance property.

A parser function should be named <code>parseSomeCoolAttribute</code>.
In this case the result of running that function will be assigned to
<code>some_cool</code> property of your class instance.

Everything between <code>parse</code> and <code>Attribute</code>
will be converted to snake_case in the resulting property.

So an example for date will be:
<pre><code class="coffee">
class MyClass extends ApplicationModel
  constructor: (params) ->
    super(params)
    
  parseDateAttribute: (date) ->
    return new Date(date)
    
instance = new MyClass({date: '2014-12-31'})
instance.date # Wed Dec 31 2014 00:00:00 GMT
</code>
</pre>

__Note__: Sometimes you may need to get some parsed properties within a parser, when that properties have not been parsed yet.
For that cases you can use <code>parseAttribute(attribute_name)</code> method. The reason is to allow getting parsed values when parsing phase has not been completed yet.
It may be useful for getting some default values for your properties.

## Getters
Getters are functions that are being called when someone reads object property.
The result of such function will be returned to the user.

For getters (and setters) ApplicationModel uses JavaScript's <code>Object.defineProperty()</code> API.
Such as with parsers you can create function named <code>getSomeCoolAttribute</code>.
And your instance will have property <code>some_cool</code>
which will always have the value computed by using your function.

Each time you read that value the function will run implicitly.

**Warning!** You can not define both parser and getter/setter for the same property.
If you have already defined parser, the getter/setter will be ignored.
But your parser function will be used as setter one too.

Getters are useful for calculated properties:
<pre><code class="coffee">
class Product extends ApplicationModel
  default_product =
    title: ''
    price: 0
    quantity: 1
    total: 0
  constructor: (params) ->
    super(params, default_product)
    
  getTotalAttribute: ->
    return @price * @quantity
    
apple = new Product({
  title: 'Apple'
  quantity: 15
  price: 2
})
apple.total # 30
</code>
</pre>

## Setters
Setters are functions that are being called when you set some property value.
In setter you can do any logic whatever you want.
The common thing is to set another property values.

For setters ApplicationModel uses JavaScript's <code>Object.defineProperty()</code>.
Such as with parsers and getters you can create a function named
<code>setSomeCoolAttribute</code>. Any time someone tries to set value to
<code>some_cool</code> property the setter will run implicitly.

**Warning!** You can not define both parser and getter/setter for the same property.
If you have already defined parser, the getter/setter will be ignored.
But your parser function will be used as setter one too.

For the example with <code>Product</code> class we can define setter for
<code>total</code> attribute:
<pre><code class="coffee">
setTotalAttribute: (total) ->
  @quantity = total / @price
</code>
</pre>

Now when you will try to set value on <code>total</code> property of your apple,
the <code>quantity</code> will also update:
<pre><code class="coffee">
apple.total = 100
apple.quantity # 50
</code>
</pre>

## Formatters
Formatters are useful for operations opposite to that parsers do.
If you want to send your data to server,
but server accepts the data not in format you have your model,
formatters will help you to solve that problem.

Formatters in ApplicationModel should be defined with syntax similar to parsers/getters/setters.
You simply need to define function named
<code>formatSomeCoolAttribute</code> and call some special function named <code>format()</code>.
That function creates copy of your instance but for every property having formatter,
the latter runs and the result of that run will be passed to resulting property.
**None of original instance properties will be changed**.
The instance will be the same.

For example with dates we can create formatter:
<pre><code class="coffee">
class MyClass extends ApplicationModel
  constructor: (params) ->
    super(params)
    
  parseDateAttribute: (date) ->
    return new Date(date)
    
  formatDateAttribute: ->
    return @date.toISOString()
    
instance = new MyClass({date: '2014-12-31'})
instance.format() # {date: '2014-12-31T00:00:00.000Z'}
</code>
</pre>

## Other features
ApplicationModel has at least one more feature. This feature is called
<code>toPlainObject()</code>.

This is a method which have all model instances. This method does the same as
<code>format()</code> does, but without running formatters.
It returns new object with all own public properties of your model and actual values.

## Cascade
ApplicationModel is designed to work with nested ApplicationModels.
So if your model property is an instance of ApplicationModel,
all processes such as <code>format()</code> or <code>toPlainObject()</code>
will be invoked during cycle. Their results will be assigned to resulting property.

So if you have a property that is an instance of ApplicationModel,
you don't need to set formatter for that property. But no one restricts you to.

## Installation

For the moment installation is available only by using <code>bower</code>.
To install you should write in your command line:
<pre>
<code>$ bower install https://github.com/Antontelesh/application_model.git --save</code>
</pre>

## Usage

Package consists of 4 distributive files:
* <code>model.standalone.js</code> — a script which provides <code>ApplicationModel</code> object in the global scope. It requires [lodash](http://lodash.com/) to be loaded before it instantiates.
* <code>model.angular.js</code> — ApplicationModel superclass wrapped with AngularJS's factory of the same name. As the above requires lodash to be loaded before it instantiates.
* ...and minified versions of the above

To use standalone version you should load dependencies (lodash) and the file you need (minified or not) and then you can extend any coffee-script class from ApplicationModel superclass.

To use angularjs version you need to load scripts as for standalone version but use file named with <code>angular</code> word in it.
Then ensure you put <code>ApplicationModel</code> to your module dependencies and to your controller/service dependencies.

