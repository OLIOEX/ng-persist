# ng-persist

- returns $q promises
- works in the browser with [local storage](https://github.com/gsklee/ngStorage)

## Install

```
$ bower install ng-persist ngstorage --save
```

For ios, [KeychainPlugin](https://github.com/driftyco/cordova-plugin-ios-keychain) is required:

```
$ cordova plugin add https://github.com/driftyco/cordova-plugin-ios-keychain.git
```

For Android, [cordova-plugin-file](https://github.com/apache/cordova-plugin-file) is required:

```
$ cordova plugin add cordova-plugin-file
```

## Usage

Require ng-persist and ngstorage

```js
angular.module('myApp', [
    'ngStorage',
    'ng-persist'
]);
```

On Android data will be persisted (by default) to external storage on your device
however, if you need to store data internally, set `internalStorage = true`.
Internal storage means any related data bundled within the app and only accessible
by your app.

Inject ```$persist``` into your controller

```js
.controller('MyCtrl', function($persist) {

    // write
    $persist
        .set(namespace, key, val, internalStorage)
        .then(function () {
            // saved
        });

    // read
    $persist
        .get(namespace, key, fallback, internalStorage)
        .then(function (val) {
            // val is either the value, if exists, or the fallback
        });

    // delete
    $persist
        .remove(namespace, key, internalStorage)
        .then(function () {
            // removed
        });

});
```

## License

MIT
