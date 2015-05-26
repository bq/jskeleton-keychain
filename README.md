Jskeleton-Keychain
==================

Simple and easy local/session storage system for JSkeleton projects.


<h2 id="installation">Installation</h2>

<h4 id="installation-via-bower">via bower</h4>

```bash
$ bower install jskeleton-keychain
```

<h4 id="installation-via-npm">via npm</h4>

```bash
$ npm install jskeleton-keychain
```

<h4 id="installation-manual">manual</h4>

Simply download the zip file [HERE](https://github.com/bq/jskeleton-keychain/archive/master.zip) and include `dist/jskeleton-keychain.min.js` in your project.


<h2 id="usage">Usage</h2>

<h3 id="usage-adding-to-your-project">Adding to your project</h3>

Add `jskeleton-keychain` as a dependency

```js
JSkeleton.ViewController.factory('FooBar', ['Keychain'], function(Keychain) {
    return {
        onFoo: function(bar){
            Keychain.put('fooKey', ['data1', 'data2']);
        }
    }
}
```

Configure via `JSkeleton.common.setConfig` (*optional*)

```js
<script>

    JSkeleton.common.setConfig({
        'Keychain' : {

            driver : 'local',
            namespace: 'Keychain',
            eventsEnabled:  true,
            separator: '.',
            extend: {}
        }
    });

</script>
```

----------------------------

<h3 id="usage-switching-storage-drivers">Switching storage drivers</h3>

There may be times where you will want to dynamically switch between using local and session storage.
To achieve this, simply chain the `driver()` setter to specify what storage driver you want to use, as follows:

```js
// put an item into session storage
keychain.driver('session').put('sessionKey', ['some', 'session', 'data']);

// this time use local storage
keychain.driver('local').put('localKey', ['some', 'persistent', 'things']);
```

<h3 id="usage-switching-namespace">Switching namespace</h3>

```js
// add an item within a different namespace
keychain.namespace('otherNamespace').put('foo', 'bar');
```

Omitting the driver or namespace setters will respect whatever default was specified via `keychainProvider`.

----------------------------

<h3 id="usage-adding-items-to-keychain">Adding items to keychain</h3>

there are several ways to add something to keychain:

You can add Objects, Arrays, whatever :)

keychain will automatically serialize your objects/arrays in local/session storage

```js
keychain.put('someString', 'anyDataType');
keychain.put('someObject', { foo: 'I will be serialized', bar: 'pretty cool eh' });
keychain.put('someArray', ['foo', 'bar', 'baz']);
// etc
```

<h4 id="usage-adding-items-to-keychain-adding-via-value-function-param">adding via value function param</h4>

Inserts specified key and return value of function

```js
keychain.put('someKey', function() {
    var obj = { foo: 'bar', bar: 'baz' };
    // some other logic
    return obj;
});
```

The current value will be passed into the function so you can perform logic on the current value, before returning it. e.g.

```js
keychain.put('someKey', ['foo', 'bar']);

keychain.put('someKey', function(current) {
    current.push('baz');

    return current
});

keychain.get('someKey') // = ['foo', 'bar', 'baz']
```

<h4 id="usage-adding-items-to-keychain-adding-multiple-items-at-once-by-passing-a-single-object">adding multiple items at once by passing a single object</h4>

This will add each key/value pair as a **separate** item in storage

```js
keychain.put({
    someKey: 'johndoe',
    anotherKey: ['some', 'random', 'array'],
    boolKey: true
});
```

<h4 id="usage-adding-items-to-keychain-adding-via-key-function-param">adding via key function param</h4>

Inserts each item from the returned Object, similar to above

```js
keychain.put(function() {
    // some logic
    return {
        foo: ['lorem', 'ipsum', 'dolor'],
        user: {
            username: 'johndoe',
            displayName: 'Johnny Doe',
            active: true,
            role: 'user'
        }
    };
});
```

<h4 id="usage-adding-items-to-keychain-conditionally-adding-an-item-if-it-doesn-t-already-exist">conditionally adding an item if it doesn't already exist</h4>

For this functionality you can use the `add()` method.

If the key already exists then no action will be taken and `false` will be returned

```js
keychain.add('someKey', 'someVal'); // true or false - whether the item was added or not
```

----------------------------

<h3 id="usage-retrieving-items-from-keychain">Retrieving items from keychain</h3>

```js
// keychain.put('fooArray', ['bar', 'baz', 'bob']);

keychain.get('fooArray'); // ['bar', 'baz', 'bob']
```

<h4 id="usage-retrieving-items-from-keychain-setting-a-default-value">setting a default value</h4>

if the key does not exist then, if specified the default will be returned

```js
keychain.get('keyDoesNotExist', 'a default value'); // 'a default value'
```

<h4 id="usage-retrieving-items-from-keychain-retrieving-multiple-items-at-once">retrieving multiple items at once</h4>

You may pass an array to the `get()` method to return an Object containing the specified keys (if they exist)

```js
keychain.get(['someKey', 'anotherKey', 'foo']);

// will return something like...
{
    someKey: 'someValue',
    anotherKey: true,
    foo: 'bar'
}
```

<h4 id="usage-retrieving-items-from-keychain-deleting-afterwards">deleting afterwards</h4>

You can also retrieve an item and then delete it via the `pull()` method

```js
// keychain.put('someKey', { foo: 'bar', baz: 'bob' });

keychain.pull('someKey', 'defaultVal'); // { foo: 'bar', baz: 'bob' }

// then...

keychain.get('someKey', 'defaultVal'); // 'defaultVal'
```

<h4 id="usage-retrieving-items-from-keychain-all-items">all items</h4>

You can retrieve all items within the current namespace

This will return an object containing all the key/value pairs in storage

```js
keychain.all();
// or
keychain.namespace('somethingElse').all();
```

<h4 id="usage-retrieving-items-from-keychain-counting-items">counting items</h4>

To count the number of items within a given namespace:

```js
keychain.count();
// or
keychain.namespace('somethingElse').count();
```

----------------------------

<h3 id="usage-checking-item-exists-in-keychain">Checking item exists in keychain</h3>

You can determine whether an item exists in the current namespace via

```js
keychain.has('someKey') // true or false
// or
keychain.namespace('foo').has('bar');

// e.g.
if (keychain.has('user.authToken') ) {
    // we're logged in
} else {
    // go to login page or something
}
```

----------------------------

<h3 id="usage-removing-items-from-keychain">Removing items from keychain</h3>

The simplest way to remove an item is to pass the key to the `forget()` method

```js
keychain.forget('keyToRemove');
// or
keychain.driver('session').forget('sessionKey');
// etc..
```

<h4 id="usage-removing-items-from-keychain-removing-multiple-items-at-once">removing multiple items at once</h4>

You can also pass an array.

```js
keychain.forget(['keyToRemove', 'anotherKeyToRemove', 'something', 'else']);
```

<h4 id="usage-removing-items-from-keychain-removing-all-within-namespace">removing all within namespace</h4>

you can remove all the items within the currently set namespace via the `clean()` method

```js
keychain.clean();
// or
keychain.namespace('someOtherNamespace').clean();
```
<h4 id="usage-removing-items-from-keychain-removing-all-items-within-the-currently-set-storage-driver">removing all items within the currently set storage driver</h4>

```js
keychain.empty();
```

----------------------------

<h3 id="usage-events">Events</h3>

There are 3 events that can be fired during various operations, these are:

```js
// fired when a new item is added to storage
Keychain.on('MyNamespace.item.added', function (e, payload) {
    // payload is equal to:
    {
        driver: 'local', // the driver that was set when the event was fired
        namespace: 'keychain', // the namespace that was set when the event was fired
        key: 'foo', // the key that was added
        value: 'bar' // the value that was added
    }
});
```

```js
// fired when an item is removed from storage
Keychain.on('MyNamespace.item.forgotten', function (e, payload) {
    // payload is equal to:
    {
        driver: 'local', // the driver that was set when the event was fired
        namespace: 'keychain', // the namespace that was set when the event was fired
        key: 'foo', // the key that was removed
    }
});
```

```js
// fired when an item's value changes to something new
Keychain.on('MyNamespace.item.updated', function (e, payload) {
    // payload is equal to:
    {
        driver: 'local', // the driver that was set when the event was fired
        namespace: 'keychain', // the namespace that was set when the event was fired
        key: 'foo', // the key that was updated
        oldValue: 'bar', // the value that was set before the item was updated
        newValue: 'baz' // the new value that the item was updated to
    }
});
```

----------------------------


<h2 id="browser-compatibility">Browser Compatibility</h2>

IE8 is not supported because I am utilising `Object.keys()`

To check if the browser natively supports local and session storage, you can do the following:

```js
if (! keychain.supported()) {
    // load a polyfill?
}
```

I would recommend using [Remy's Storage polyfill](https://gist.github.com/remy/350433) if you want to support older browsers.

For the latest browser compatibility chart see [HERE](http://caniuse.com/namevalue-storage)

<h2 id="contributing">Contributing</h2>

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using Gulp.

<h2 id="development">Development</h2>

```bash
$ npm install
$ bower install
$ gulp
```

<h2 id="license">License</h2>

The MIT License (MIT)

Copyright (c) 2014 Sean Tymon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
