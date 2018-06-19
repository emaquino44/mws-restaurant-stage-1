let restaurant;
let map;

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
    }
  });
}

switchMaps = () => {
  const staticMap = document.getElementById('static-map');
  const interactiveMap = document.getElementById('map');
  if (interactiveMap.style.display === 'none') {
    interactiveMap.style.display = 'block';
    staticMap.style.display = 'none';
  }
}

showMap = () => {
  const button = document.getElementById('showMap');
  const mapContainer = document.getElementById('map-container');
  if (mapContainer.style.display === 'none') {
    mapContainer.style.display = 'block';
    button.innerHTML = 'Hide Map';
  } else {
    mapContainer.style.display = 'none';
    button.innerHTML = 'Show Map';
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
      if (!restaurant) {
        console.error(error);
        return;
      }
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
  // fill reviews
  // fillReviewsHTML();
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
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

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

  const updateDate = new Date(review.updatedAt);
  const date = document.createElement('p');
  date.innerHTML = `${updateDate.getDate()}/${updateDate.getMonth()}/${updateDate.getFullYear()} ${updateDate.getHours()}:${updateDate.getMinutes()}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
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