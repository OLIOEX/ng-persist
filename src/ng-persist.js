(() => {

    'use strict';

    angular.module('ng-persist', []);

    const $persist = ($q, $localStorage) => {

        let isBrowser = false;
        let isIos     = false;
        let isAndroid = false;

        if (!window.cordova && !window.device && (typeof Keychain === 'undefined')) {
            isBrowser = true;
        } else {
            isAndroid = (window.device.platform === 'Android');
            isIos     = (window.device.platform === 'iOS');
        }

        class LocalStorageAdapter {
            read(namespace, key) {
                const deferred = $q.defer();
                const val = $localStorage[`${namespace}_${key}`];
                deferred.resolve(val);
                return deferred.promise;
            }
            write(namespace, key, val) {
                const deferred = $q.defer();
                $localStorage[`${namespace}_${key}`] = val;
                deferred.resolve();
                return deferred.promise;
            }
            remove(namespace, key) {
                const deferred = $q.defer();
                delete $localStorage[`${namespace}_${key}`];
                deferred.resolve();
                return deferred.promise;
            }
        }

        class IosKeychainAdapter {
            read(namespace, key) {
                const deferred = $q.defer();
                Keychain.get((val) => {
                        if (val !== "") {
                            val = JSON.parse(val)
                        } else {
                            val = null;
                        }
                        deferred.resolve(val);
                    }, (err) => {
                        deferred.reject(err);
                    }, key, '');
                return deferred.promise;
            }
            write(namespace, key, val) {
                const deferred = $q.defer();
                val = JSON.stringify(val);
                Keychain.set(() => {
                    deferred.resolve();
                }, (err) => {
                    deferred.reject(err);
                }, key, val, false);
                return deferred.promise;
            }
            remove(namespace, key) {
                const deferred = $q.defer();
                Keychain.remove(() => {
                        deferred.resolve();
                    }, (err) => {
                        deferred.reject(err);
                    }, key);
                return deferred.promise;
            }
        }

        class AndroidStorageAdapter {
            read(namespace, key) {
                const deferred = $q.defer();
                const filename = `${namespace}_${key}`;
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory  + filename, (fileEntry) => {
                    fileEntry.file((file) => {
                        const reader = new FileReader();
                        reader.onloadend = (evt) => {
                            var res = evt.target.result;
                            if (res !== "") {
                                res = JSON.parse(res)
                            } else {
                                res = null;
                            }
                            deferred.resolve(res);
                        };
                        reader.readAsText(file);
                    });
                }, (err) => {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
            write(namespace, key, val) {
                const deferred = $q.defer();
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory , (dir) => {
                    const filename = `${namespace}_${key}`;
                    dir.getFile(filename, { create : true }, (file) => {
                        if (!file) {
                            deferred.reject();
                        }
                        file.createWriter((fileWriter) => {
                            // fileWriter.seek(fileWriter.length);
                            const blob = new Blob([JSON.stringify(val)], { type:'text/plain' });
                            fileWriter.write(blob);
                            deferred.resolve();
                        }, (err) => {
                            deferred.reject(err);
                        });
                    });
                });
                return deferred.promise;
            }
            remove(namespace, key) {
                const deferred = $q.defer();
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory , (dir) => {
                    const filename = `${namespace}_${key}`;
                    dir.getFile(filename, { create : true }, (file) => {
                        if (!file) {
                            deferred.reject();
                        }
                        file.createWriter((fileWriter) => {
                            // fileWriter.seek(fileWriter.length);
                            const blob = new Blob([''], { type:'text/plain' });
                            fileWriter.write(blob);
                            deferred.resolve();
                        }, (err) => {
                            deferred.reject(err);
                        });
                    });
                });
                return deferred.promise;
            }
        }

        const getAdapter = () => {
            if (isBrowser) {
                return new LocalStorageAdapter();
            } else if (isIos) {
                return new IosKeychainAdapter();
            } else if (isAndroid) {
                return new AndroidStorageAdapter();
            }
        };

        return {
            set(namespace = '', key = null, val = '') {
                const deferred = $q.defer();
                const adapter = getAdapter();
                adapter
                    .write(namespace, key, val)
                    .then(() => {
                        deferred.resolve(val);
                    })
                    .catch((err) => {
                        // if not browser, write to local storage
                        // otherwise reject
                        if (!isBrowser) {
                            const localStorageAdapter = new LocalStorageAdapter();
                            return localStorageAdapter.write(namespace, key, val);
                        } else {
                            deferred.reject(err);
                        }
                    });
                return deferred.promise;
            },
            get(namespace = '', key = null, fallback = '') {
                const deferred = $q.defer();
                const adapter = getAdapter();
                adapter
                    .read(namespace, key)
                    .then((val) => {
                        if (val) {
                            deferred.resolve(val);
                        } else {
                            deferred.resolve(fallback);
                        }
                    })
                    .catch(() => {
                        // always resolve with the fallback value
                        deferred.resolve(fallback);
                    });
                return deferred.promise;
            },
            remove(namespace, key) {
                const adapter = getAdapter();
                return adapter.remove(namespace, key);
            },
        };
    };
    $persist.$inject = ['$q', '$localStorage'];
    angular.module('ng-persist').factory('$persist', $persist);

}());
