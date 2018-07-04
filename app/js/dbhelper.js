// Common database helper functions.

class DBHelper {

  // Database URL.
  // Change this to restaurants.json file location on your server.
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
      if (!db.objectStoreNames.contains('local-restaurants')) {
        db.createObjectStore('local-restaurants', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('reviews')) {
        const reviews = db.createObjectStore('reviews', { keyPath: 'id' });
        reviews.createIndex('byRestaurant', 'restaurant_id', {unique: false});
      }
      if (!db.objectStoreNames.contains('local-reviews')) {
        db.createObjectStore('local-reviews', { autoIncrement: true });
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

  // update restaurant's data stored in indexed DB
  static updateCachedRestaurant(restaurant, data) {
    restaurant[data.key] = data.value;
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('restaurants', 'readwrite');
      let store = transaction.objectStore('restaurants');
      store.put(restaurant);
      return store.complete;
    })
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
   static addLocalStoredReview(review) {
     let dbPromise = DBHelper.setIndexedDB();
     let date = Date.parse(new Date);
     return dbPromise.then(db => {
       if (!db) return;
       let transaction = db.transaction('local-reviews', 'readwrite');
       let store = transaction.objectStore('local-reviews');
       store.put({...review, createdAt: date, updatedAt: date});
       return store.complete;
     })
   }
   // get reviews stored only in local (cached) DB
   static getLocalStoredReviews(clean = false) {
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('local-reviews', 'readwrite');
      let store = transaction.objectStore('local-reviews');
      let reviews = store.getAll();
      if (clean) store.clear();
      return reviews;
    })
   }

  //  put added review to reviews indexeddb
  static updateCachedReviews(review) {
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('reviews', 'readwrite');
      let store = transaction.objectStore('reviews');
      store.put(review);
      return store.complete;
    })
  }

  // sync data stored locally with the server
  static syncReviews(reviews) {
    reviews.forEach(review => {
      DBHelper.addRestaurantReview(review, (error, response) => {
        if (error) return console.log(error);
        DBHelper.updateCachedReviews(response)
          .then(res => console.log(res))
          .catch(error => console.log(error));
      })
    })
  }

  // Fetch all restaurants.
  static fetchRestaurants(callback) {
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
        callback(null, restaurants);
      })
      .catch(error => {
        console.log(error);
        DBHelper.getAllCachedRestaurants()
          .then(cachedRestaurants => {
            if (cachedRestaurants.length > 0) return callback(null, cachedRestaurants);
          })
          .catch(error => callback(error, null));
      })
  }

  // get restaurant by id from the server
  static fetchRestaurantById(id, callback) {
   fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}`)
    .then(response => response.json())
    .then(restaurant => {
      let dbPromise = DBHelper.setIndexedDB();
      dbPromise.then(db => {
        if (!db) return callback(null, restaurant);
        let transaction = db.transaction('restaurants', 'readwrite');
        let store = transaction.objectStore('restaurants');
        store.put(restaurant);
      });
      callback(null, restaurant);
    })
    .catch(error => {
      DBHelper.getCachedRestaurant(id)
        .then(cachedRestaurant => {
          if (cachedRestaurant) return callback(null, cachedRestaurant)
        })
        .catch(error => callback(error, null))
    })
  }

  // set is_favorite for the restaurant
  static setRestaurantFavorite(id, state, callback) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants/${Number(id)}/?is_favorite=${state}`, {method: 'put'})
      .then(response => callback(null, response))
      .catch(error => callback(error, null));
  }

  // sync information about favorites restaurants stored locally with the server
  static syncFavorites(data) {
    data.forEach(entry => {
      DBHelper.setRestaurantFavorite(entry.id, entry.is_favorite, (error, response) => {
        if (error) return console.log(error);
        console.log(response);
      });
    });
  }

  // store data about favorite restaurants in local (cached) DB
  static setLocalRestaurantFavorite(id, state) {
    let dbPromise = DBHelper.setIndexedDB();
    const data = { id: id, is_favorite: state};
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('local-restaurants', 'readwrite');
      let store = transaction.objectStore('local-restaurants');
      store.put(data);
      return store.complete;
    })
  }
  // get information about modified
  static getLocalRestaurantFavorite() {
    let dbPromise = DBHelper.setIndexedDB();
    return dbPromise.then(db => {
      if (!db) return;
      let transaction = db.transaction('local-restaurants', 'readwrite');
      let store = transaction.objectStore('local-restaurants');
      let data = store.getAll();
      store.clear();
      return data;
    })
  }

  // get all restaurant's reviews
  static fetchAllRestaurantReviews(restaurant_id, callback) {
    fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurant_id}`)
      .then(response => response.json())
      .then(reviews => {
        let dbPromise = DBHelper.setIndexedDB();
        dbPromise.then(db => {
          if (!db) return callback(null, reviews);
          let transaction = db.transaction('reviews', 'readwrite');
          let store = transaction.objectStore('reviews');
          reviews.forEach(review => store.put(review));
        });
        callback(null, reviews);
      })
      .catch(error => {
        console.log(error);
        DBHelper.getCachedRestaurantReviews(restaurant_id)
          .then(cachedReviews => {
            console.log(cachedReviews);
            callback(null, cachedReviews);
          })
          .catch(error => callback(error, null));
      })
  }

  // add new restaurant's review
  static addRestaurantReview(review, callback) {
    fetch(`${DBHelper.DATABASE_URL}/reviews/`, {
      method: 'post',
      body: JSON.stringify(review)
    })
      .then(response => response.json())
      .then(response => callback(null, response))
      .catch(error => callback(error, null))
  }

  // Fetch restaurants by a cuisine type with proper error handling.
  static fetchRestaurantByCuisine(cuisine, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) return callback(error, null);
      const results = restaurants.filter(r => r.cuisine_type == cuisine);
      callback(null, results);
    });
  }

  // Fetch restaurants by a neighborhood with proper error handling.
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) return callback(error, null);
      const results = restaurants.filter(r => r.neighborhood == neighborhood);
      callback(null, results);
    });
  }

  // Fetch restaurants by a cuisine and a neighborhood with proper error handling.
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) return callback(error, null);
      let results = restaurants;
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      callback(null, results);
    });
  }

  // Fetch all neighborhoods with proper error handling.
  static fetchNeighborhoods(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) return callback(error, null);
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      callback(null, uniqueNeighborhoods);
    });
  }

  // Fetch all cuisines with proper error handling.
  static fetchCuisines(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) return callback(error, null);
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
      callback(null, uniqueCuisines);
    });
  }

  // get markers for static map
  static fetchStaticMarkers(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) return callback(error, null);
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
    });
  }

  // Get keyval from LocalStorage
  static getLocalStorage(key) {
    return localStorage.getItem(key);
  }

  // Set keyval in LocalStorage
  static setLocalStorage(key, val) {
    localStorage.setItem(key, val);
  }

  
  // Restaurant page URL.
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  // Restaurant image URL.
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  // Map marker for a restaurant.
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
