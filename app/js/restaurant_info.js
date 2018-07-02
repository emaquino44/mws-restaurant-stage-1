let restaurant;
let map;

document.addEventListener('DOMContentLoaded', event => {
  initHoverHint();
  initRating();
  watchOffline();
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      renderStaticMap(restaurant);
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      fetchReviewsForRestaurant();
      fetchLocalReviewsForRestaurant();
    }
  });
}

switchMaps = () => {
  const mapContainer = document.getElementById('map-container');
  const staticMap = document.getElementById('static-map');
  const interactiveMap = document.getElementById('map');
  if (interactiveMap.style.display === 'none') {
    interactiveMap.style.display = 'block';
    staticMap.style.display = 'none';
    if (mapContainer.onmouseover) mapContainer.removeAttribute('onmouseover');
    if (mapContainer.onmouseout) mapContainer.removeAttribute('onmouseout');
  }
}

renderStaticMap = (restaurant) => {
  const staticMap = document.getElementById('static-map');
  const container = getMapContainer();
  const map = {
    lat: restaurant.latlng.lat,
    lng: restaurant.latlng.lng,
    zoom: 16,
    scale: 2
  }
  const marker = `&markers=size:mid%7Ccolor:0xff0000%7Clabel:${restaurant.name}%7C${restaurant.latlng.lat},+${restaurant.latlng.lng}`;
  staticMap.setAttribute('alt', `Google Map - location of ${restaurant.name}`);
  staticMap.setAttribute('src', `https://maps.googleapis.com/maps/api/staticmap?center=${map.lat},+${map.lng}&zoom=${map.zoom}&scale=${map.scale}&size=${container.width}x${container.height}&maptype=roadmap&key=AIzaSyAtBLZYA9PuOhi-9XwPzQI-wsAfNDrOp4U&format=jpg&visual_refresh=true${marker}`);

}

getMapContainer = () => {
  const mapContainer = document.getElementById('map-container');
  return {
    id: mapContainer.getAttribute('id'),
    height: mapContainer.clientHeight,
    width: mapContainer.clientWidth
  }
}

showHoverHint = () => {
  const map = document.getElementById('map');
  if (map.style.display !== 'none') return;
  const hoverHint = document.getElementById('hover-hint');
  if (hoverHint.style.display === 'none') {
    hoverHint.style.display = 'flex';
  }
}

hideHoverHint = () => {
  const map = document.getElementById('map');
  if (map.style.display !== 'none') return;
  const hoverHint = document.getElementById('hover-hint');
  if (hoverHint.style.display !== 'none') {
    hoverHint.style.display = 'none';
  }
}

initHoverHint = () => {
  const container = document.getElementById('map-container');
  container.setAttribute('onmouseover', 'showHoverHint()');
  container.setAttribute('onmouseout', 'hideHoverHint()');
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) return console.error(error);
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

fetchReviewsForRestaurant = () => {
  if (self.reviews) return self.reviews;
  const id = getParameterByName('id');
  if (!id) return console.error('No restaurant id in URL');
  DBHelper.fetchAllRestaurantReviews(id, (error, reviews) => {
    self.reviews = reviews;
    if (!reviews) return console.error(error);
    fillReviewsHTML();
    return reviews;
  });
}

fetchLocalReviewsForRestaurant = () => {
  DBHelper.getLocalStoredReviews()
    .then(reviews => fillReviewsHTML(reviews))
    .catch(error => console.log(error));
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt', `Picture of ${restaurant.name}`);
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  
  // fill favorite status
  const button = document.getElementById('restaurant-favorite');
  const status = document.getElementById('social-status');
  if (restaurant.is_favorite) {
    button.classList.add('isfavorite');
    button.innerHTML = 'Remove from favorites';
    status.innerHTML = 'Restaurant marked as favorite.';
    status.classList.add('isfavorite');
    notifyUser('This restaurant is one of your favorites', 'info');
  } else {
    button.classList.remove('isfavorite');
    button.innerHTML = 'Add to favorites';
    status.innerHTML = '';
    status.classList.remove('isfavorite');
  }

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  // const hours = document.getElementById('restaurant-hours');
  const hours = document.querySelector('#restaurant-hours tbody');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.setAttribute('tabindex', '0');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.setAttribute('tabindex', '0');
    time.setAttribute('aria-label', key);
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.setAttribute('role', 'group');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('role', 'article');
  li.setAttribute('tabindex', '0');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);
  const date = document.createElement('p');
  date.innerHTML = formatDate(new Date(review.updatedAt));
  li.appendChild(date);

  const ratingContainer = document.createElement('p');
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('i');
    star.classList.add('star');
    if (i <= review.rating) star.classList.add('orange');
    ratingContainer.appendChild(star);
  };
  // rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(ratingContainer);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

formatDate = (date) => {
  let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours();
  let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${day}/${month}/${year} ${hour}:${minutes}`;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

initRating = () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', e => addReview(e));
  const container = document.querySelector('#user-rating div');
  container.addEventListener('mouseout', () => clearRating());
  container.addEventListener('focusout', () => clearRating());
  const items = document.querySelectorAll('label.star');
  items.forEach(item => {
    item.addEventListener('mouseover', () => fillRating(item.firstChild.value));
    item.addEventListener('focusin', () => fillRating(item.firstChild.value));
    item.addEventListener('click', () => setRating(item.firstChild.value));
    item.addEventListener('keypress', e => {
      e.preventDefault();
      if (e.key == 'Enter' || e.key == ' ') setRating(`${item.firstChild.value}`);
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `set rating ${item.firstChild.value} of 5`);
  })
}

fillRating = (val) => {
  const items = document.querySelectorAll('label.star');
  items.forEach(item => {
    if (Number(item.firstChild.value) < Number(val)+1) {
      item.classList.add('orange')
    } else {
      item.classList.remove('orange');
    }
  })
}

clearRating = () => {
  const items = document.querySelectorAll('label.star');
  items.forEach(item => item.classList.remove('orange'));
}

setRating = (val) => {
  const items = document.querySelectorAll('label.star');
  items.forEach(item => {
    if (Number(item.firstChild.value) < Number(val)+1) {
      item.classList.add('checked');
    } else {
      item.classList.remove('checked');
    }
  });
  items.forEach(item => item.firstChild.removeAttribute('checked'));
  items[Number(val)-1].firstChild.setAttribute('checked', 'checked');
}

addReview = (e, restaurant = self.restaurant) => {
  e.preventDefault();

  const review = {
    name : secureInput(document.querySelector('input[name=user-name]').value),
    rating : Number(document.querySelector('input[name=user-rating][checked=checked]').value),
    comments : secureInput(document.querySelector('textarea[name=user-review]').value),
    restaurant_id : restaurant.id
  }
  // try to add review to database
  // if possible, fetch new review and store in indexeddb (reviews) and render new review for the client
  // if not possible, store new review in indexeddb (local-reviews) set eventlistener for online event 
  // to send new reviews to the server as soon as possible and render new review for the client

  DBHelper.addRestaurantReview(review, (error, response) => {
    if (error) {
      DBHelper.addLocalStoredReview(review)
        .then(() => {
          if (!navigator.onLine) {
            window.addEventListener('online', e => {
              console.log('online again!');
              DBHelper.getLocalStoredReviews(true)
                .then(localReviews => DBHelper.syncReviews(localReviews))
                .catch(error => console.log(error))
            })
          } else {
            console.log('addCachedRestaurantReview-else')
            return console.log(error);
          }
        })
    } else {
      console.log(response);
      DBHelper.updateCachedReviews(response)
        .then(() => console.log('cachedReviews updated'))
        .catch(err => console.log(err));
    }
  })

  // render review for the client
  clearReviewForm();
  const date = Date.parse(new Date);
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML({...review, createdAt: date, updatedAt: date}));
}

secureInput = (value) => {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

clearReviewForm = () => {
  document.querySelector('input[name=user-name]').value = '';
  let labels = document.querySelectorAll('label.star')
  labels.forEach(label => {
    label.classList.remove('checked')
    label.removeAttribute('checked');
  });
  document.querySelector('textarea[name=user-review').value = '';
};

setFavorite = (e, restaurant = self.restaurant) => {
  const button = document.getElementById('restaurant-favorite');
  const status = document.getElementById('social-status');
  const data = {key: 'is_favorite', value: false};
  if (restaurant.is_favorite) {
    data.value = false;
    button.innerHTML = 'Add to favorites';
    button.setAttribute('aria-label', 'Add to favorites');
    status.classList.remove('isfavorite');
    status.innerHTML = '';
    notifyUser('Restaurant removed from favorites', 'info');
  } else {
    data.value = true;
    button.innerHTML = 'Remove from favorites';
    button.setAttribute('aria-label', 'Remove from favorites');
    status.classList.add('isfavorite');
    status.innerHTML = 'Restaurant marked as favorite.';
    notifyUser('Restaurant set as favorite', 'info');
  }
  DBHelper.updateCachedRestaurant(restaurant, data);
}

notifyUser = (message, type) => {
  const messageBox = document.getElementById('app-status');
  messageBox.innerHTML = message;
  messageBox.classList.add(type);
  messageBox.style.display = 'block';
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 3000);
}

watchOffline = () => {
  if (!navigator.onLine) {
    window.addEventListener('online', e => {
    
      // sync reviews
      DBHelper.getLocalStoredReviews(true)
      .then(localReviews => DBHelper.syncReviews(localReviews))
      .catch(error => console.log(error));
    
    })
  }
}