import idb from 'idb';

idb.open('restaurantsReviewDB', 1, function(upgradeDB) {
    let store = upgradeDB.createObjectStore('restaurants');
});