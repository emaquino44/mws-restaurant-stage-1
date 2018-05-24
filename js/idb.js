// based on idb module documentation (https://www.npmjs.com/package/idb)

const name = "restaurantsDB";
const version = 1;
const store = "restaurants";

if (checkIndexedDbSupport()) {
    const dbPromise = initDB(name, version, store);

    function getIndexedDBItemByKey(key, callback) {
        return dbPromise.then(db => {
            return db.transaction(store).objectStore(store).get(key);
        })
            .then(item => callback(null, item))
            .catch(err => callback(err, null));
    };

    function getAllIndexedDBItems(callback) {
        return dbPromise.then(db => {
            return db.transaction(store).objectStore(store).getAll();
        })
            .then(allItems => callback(null, allItems))
            .catch(err => callback(err, null));
    };

    function setIndexedDBItem(key, val) {
        return dbPromise.then(db => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).put(val, key);
            return tx.complete;
        })
    };

    function deleteIndexedDBItem(key) {
        return dbPromise.then(db => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).delete(key);
            return tx.complete;
        })
    }

    function checkIndexedDBStorageExists() {
        return idb.open(name, version, function (upgradeDB) {
            if(upgradeDB.objectStoreNames.constains(store)) {
                
            }
        });
    };

    function checkIndexedDBStorageLength(callback) {
        return dbPromise.then(db => {
            return db.transaction(store).objectStore(store).count()
        })
            .then(quantity => callback(null, quantity))
            .catch(err => callback(err, null));
    }

}
    
// create new indexedDB and new storage 
function initDB(dbName, dbVersion, storageName) {
    return idb.open(dbName, dbVersion, function (upgradeDB) {
        if (!upgradeDB.objectStoreNames.contains(storageName)) {
            upgradeDB.createObjectStore(storageName);
        }
    });
};

// check if indexedDB is supported
function checkIndexedDbSupport() {
    if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        return false;
    };
    return true;
};

// const name = "restaurantsDB";
// const version = 1;
// const store = "restaurants";
// const dbPromise = initDB(name, version, store);
// const indexedDB = {
//     get(key, callback) {
//         return dbPromise.then(db => {
//             return db.transaction(store).objectStore(store).get(key);
//         })
//             .then(item => callback(null, item))
//             .catch(err => callback(err, null));
//     },
//     getAll(callback) {
//         return dbPromise.then(db => {
//             return db.transaction(store).objectStore(store).getAll();
//         })
//             .then(allItems => callback(null, allItems))
//             .catch(err => callback(err, null));
//     },
//     set(key, val) {
//         return dbPromise.then(db => {
//             const tx = db.transaction(store, 'readwrite');
//             tx.objectStore(store).put(val, key);
//             return tx.complete;
//         })
//     }
// }
//     }