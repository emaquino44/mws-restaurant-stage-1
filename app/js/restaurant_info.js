let restaurant;
let map;

// run funcions when content is loaded
document.addEventListener('DOMContentLoaded', event => {
  initHoverHint();
  initRating();
  watchOffline();
});

// Initialize Google map, called from HTML.
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

// switch static map to interactive map
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

// render static map
renderStaticMap = (restaurant) => {
  const staticMap = document.getElementById('static-map');
  const container = getMapContainer();
  const map = {
    lat: restaurant.latlng.lat,
    lng: restaurant.latlng.lng,
    zoom: 16,
    scale: 2,
    type: 'roadmap',
    api: 'AIzaSyAtBLZYA9PuOhi-9XwPzQI-wsAfNDrOp4U',
    format: 'jpg'
  }
  const marker = `&markers=size:mid%7Ccolor:0xff0000%7Clabel:${restaurant.name}%7C${restaurant.latlng.lat},+${restaurant.latlng.lng}`;
  staticMap.setAttribute('alt', `Google Map - location of ${restaurant.name}`);
  staticMap.setAttribute('src', `https://maps.googleapis.com/maps/api/staticmap?center=${map.lat},+${map.lng}&zoom=${map.zoom}&scale=${map.scale}&size=${container.width}x${container.height}&maptype=${map.type}&key=${map.api}&format=${map.format}&visual_refresh=true${marker}`);

}

// get details about map container inluding id and dimensions
getMapContainer = () => {
  const mapContainer = document.getElementById('map-container');
  return {
    id: mapContainer.getAttribute('id'),
    height: mapContainer.clientHeight,
    width: mapContainer.clientWidth
  }
}

// show hover hint for map switching
showHoverHint = () => {
  const map = document.getElementById('map');
  if (map.style.display !== 'none') return;
  const hoverHint = document.getElementById('hover-hint');
  if (hoverHint.style.display === 'none') {
    hoverHint.style.display = 'flex';
  }
}

// hide hover hint for map switching
hideHoverHint = () => {
  const map = document.getElementById('map');
  if (map.style.display !== 'none') return;
  const hoverHint = document.getElementById('hover-hint');
  if (hoverHint.style.display !== 'none') {
    hoverHint.style.display = 'none';
  }
}

// initiate hover hints (static map)
initHoverHint = () => {
  const container = document.getElementById('map-container');
  container.setAttribute('onmouseover', 'showHoverHint()');
  container.setAttribute('onmouseout', 'hideHoverHint()');
}

// Get current restaurant from page URL.
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

// fetch all reviews from the server and render the content
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

// get all reviews stored locally and render content
fetchLocalReviewsForRestaurant = () => {
  DBHelper.getLocalStoredReviews()
    .then(reviews => fillReviewsHTML(reviews))
    .catch(error => console.log(error));
}

// Create restaurant HTML and add it to the webpage
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
  if (restaurant.is_favorite === 'true') {
    button.classList.add('isfavorite');
    button.innerHTML = 'Remove from favorites';
    notifyUser('This restaurant is one of your favorites', 'info');
  } else {
    button.classList.remove('isfavorite');
    button.innerHTML = 'Add to favorites';
  }

}

// Create restaurant operating hours HTML table and add it to the webpage.
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

// Create all reviews HTML and add them to the webpage.
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

// Create review HTML and add it to the webpage.
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

// format date as day/month/year hours:minutes
formatDate = (date) => {
  let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours();
  let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${day}/${month}/${year} ${hour}:${minutes}`;
}

// Add restaurant name to the breadcrumb navigation menu
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

// Get a parameter by name from page URL.
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

// initiate rating field (stars)
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

// fill rating star (style) by the given value
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

// remove rating (it's for mouseover events)
clearRating = () => {
  const items = document.querySelectorAll('label.star');
  items.forEach(item => item.classList.remove('orange'));
}

// set rating input value (rating) by the given value
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

// add new review (put data to database and render it on the screen)
addReview = (e, restaurant = self.restaurant) => {
  e.preventDefault();

  // set new review object
  const review = {
    name : secureInput(document.querySelector('input[name=user-name]').value),
    rating : Number(document.querySelector('input[name=user-rating][checked=checked]').value),
    comments : secureInput(document.querySelector('textarea[name=user-review]').value),
    restaurant_id : restaurant.id
  }
  
  // add new review to the server or indexedDB if error
  DBHelper.addRestaurantReview(review, (error, response) => {
    if (error) {
      // if review is not put on the server, add it to local (cached) DB
      DBHelper.addLocalStoredReview(review).then(() => {
        notifyUser('Internet connection not detected. New review stored locally.', 'alert');
      });
    } else {
      // update cached reviews for offline usage
      DBHelper.updateCachedReviews(response)
        .then(() => notifyUser('New review added', 'success'))
        .catch(err => console.log(err));
    }
  });

  // render review for the client
  clearReviewForm();
  const date = Date.parse(new Date);
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML({...review, createdAt: date, updatedAt: date}));
}

// replace html to text in inputed values to secure the form
secureInput = (value) => {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// clear the form 
clearReviewForm = () => {
  document.querySelector('input[name=user-name]').value = '';
  let labels = document.querySelectorAll('label.star')
  labels.forEach(label => {
    label.classList.remove('checked')
    label.removeAttribute('checked');
  });
  document.querySelector('textarea[name=user-review').value = '';
};

// set or unset restaurant as favorite
setFavorite = (e, restaurant = self.restaurant) => {
  const button = document.getElementById('restaurant-favorite');
  const data = {key: 'is_favorite', value: 'false'};
  if (restaurant.is_favorite === 'true') {
    data.value = 'false';
    button.innerHTML = 'Add to favorites';
    button.setAttribute('aria-label', 'Add to favorites');
    button.classList.remove('isfavorite');
    notifyUser('Restaurant removed from favorites', 'success');
  } else {
    data.value = 'true';
    button.innerHTML = 'Remove from favorites';
    button.setAttribute('aria-label', 'Remove from favorites');
    button.classList.add('isfavorite');
    notifyUser('Restaurant added to favorites', 'success');
  }
  DBHelper.updateCachedRestaurant(restaurant, data);
  DBHelper.setRestaurantFavorite(restaurant.id, data.value, (error, response) => {
    if (error) {
      DBHelper.setLocalRestaurantFavorite(restaurant.id, data.value)
        .then(res => console.log(res))
        .catch(error => console.log(error));
    } else {
      console.log(response);
    }

  })
}

// pops up message for the user
notifyUser = (message, type) => {
  const messageBox = document.getElementById('app-status');
  messageBox.innerHTML = message;
  messageBox.classList.add(type);
  messageBox.style.display = 'block';
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 3000);
}

// monitor if the user is online
watchOffline = () => {
    window.addEventListener('online', e => {
      // notify the user
      notifyUser('You are online again. Syncing data...', 'info')
      
      // sync reviews
      DBHelper.getLocalStoredReviews(true)
      .then(localReviews => DBHelper.syncReviews(localReviews))
      .catch(error => console.log(error));
    
      // sync restarants
      DBHelper.getLocalRestaurantFavorite()
      .then(data => DBHelper.syncFavorites(data))
      .catch(error => console.log(error));

    });
    window.addEventListener('offline', e => {
      notifyUser('No Internet connection detected', 'alert');
    })

}