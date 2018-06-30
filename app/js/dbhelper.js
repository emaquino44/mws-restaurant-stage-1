/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  // set IndexedDB database
  static setIndexedDB() {
    return idb.open('restaurants', 1, db => {
      if (!db.objectStoreNames.contains('restaurants')) {
        db.createObjectStore('restaurants', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('reviews')) {
        const reviews = db.createObjectStore('reviews', { keyPath: 'id' });
        reviews.createIndex('byRestaurant', 'restaurant_id', {unique: false});
        reviews.createIndex('byAuthorName', 'name', {unique: false});
      }
    });
  }

  // get all restaurants stored in indexedDB
  static getAllCachedRestaurants() {
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('restaurants');
      let store = transaction.objectStore('restaurants');
      return store.getAll();
    });
  }

  // get restaurant stored in indexedDB by id
  static getCachedRestaurant(id) {
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction =  db.transaction('restaurants')
      let store = transaction.objectStore('restaurants')
      return store.get(Number(id));
    });
  }

  // get restaurant's reviews stored in indexedDB
  static getCachedRestaurantReviews(restaurant_id) {
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('reviews');
      let store = transaction.objectStore('reviews');
      let index = store.index('byRestaurant');
      return index.get(restaurant_id);
    })
  }

  // add new rewiev
  static addCachedRestaurantReview(restaurant_id, review) {
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('reviews', 'readwrite');
      let store = transaction.objectStore('reviews');
      store.put(review);
      return store.complete;
    })
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getAllCachedRestaurants().then(cachedRestaurants => {
      if (cachedRestaurants.length > 0) return callback(null, cachedRestaurants);
      fetch(`${DBHelper.DATABASE_URL}/restaurants`)
        .then(response => response.json())
        .then(restaurants => {
          let dbPromise = DBHelper.setIndexedDB();
          dbPromise.then(db => {
            if (!db) return callback(null, restaurants);
            let transaction = db.transaction('restaurants', 'readwrite');
            let store = transaction.objectStore('restaurants');
            restaurants.forEach(restaurant => store.put(restaurant));
          });  
          callback(null, restaurants)
        })
        .catch(error => callback(error, null));
    })
  }
  
  static fetchRestaurantById(id, callback) {
    DBHelper.getCachedRestaurant(id).then(cachedRestaurant => {
      if (cachedRestaurant) return callback(null, cachedRestaurant);
      fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}`)
        .then(response => response.json())
        .then(restaurant => {
          let dbPromise = DBHelper.setIndexedDB();
          dbPromise.then(db => {
            if (!db) return callback(null, restaurant);
            let transaction = db.transaction('restaurants', 'readwrite');
            let store = transaction.objectStore('restaurants');
            store.put(restaurant);
          })
          callback(null, restaurant);
        })
        .catch(error => callback(error, null));
    });
  }

  static fetchAllRestaurantReviews(restaurant_id, callback) {
    DBHelper.getCachedRestaurantReviews(restaurant_id).then(cachedReviews => {
      if (cachedReviews > 0) return callback(null, cachedReviews);
      fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurant_id}`)
        .then(response => response.json())
        .then(reviews => {
          let dbPromise = DBHelper.setIndexedDB();
          dbPromise.then(db => {
            if (!db) return callback(null, reviews);
            let transaction = db.transaction('reviews', 'readwrite');
            let store = transaction.objectStore('reviews');
            reviews.forEach(review => store.put(review));
          })
          callback(null, reviews)
        })
        .catch(error => callback(error, null));
    })
  }

  //  static fetchAllRestaurantReviews(restaurant_id, callback) {
  //    fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurant_id}`)
  //      .then(response => response.json())
  //      .then(reviews => {
  //        callback(null, reviews)
  //      })
  //      .catch(error => callback(error, null));
  //  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  static fetchStaticMarkers(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const staticMarkers = [];
        restaurants.forEach(restaurant => {
          staticMarkers.push({
            name: restaurant.name,
            lat: restaurant.latlng.lat,
            lng: restaurant.latlng.lng,
            url: this.urlForRestaurant(restaurant)
          })
        });
        callback(null, staticMarkers);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
