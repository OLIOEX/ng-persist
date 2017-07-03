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

On Android data will be persisted (by default) to internal storage on your device 
(ie bundled within the app and only accessible by your app), however, if you need
to store data externally, set `useExternalStorage = true`.

Inject ```$persist``` into your controller

```js
.controller('MyCtrl', function($persist) {

    // write
    $persist
        .set(namespace, key, val, useExternalStorage)
        .then(function () {
            // saved
        });

    // read
    $persist
        .get(namespace, key, fallback, useExternalStorage)
        .then(function (val) {
            // val is either the value, if exists, or the fallback
        });

    // delete
    $persist
        .remove(namespace, key, useExternalStorage)
        .then(function () {
            // removed
        });

});
```

## License

MIT
