let restaurants,
  neighborhoods,
  cuisines;
let map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  renderStaticMapAndMarkers();
  fetchNeighborhoods();
  fetchCuisines();
  toggleFilterOptions();
  accessibility();
  registerServiceWorker();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  select.setAttribute('tabindex', 0);
  select.setAttribute('aria-label', 'Select neighborhood');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  select.setAttribute('tabindex', 0);
  select.setAttribute('aria-label', 'Select cuisine');
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
 window.initMap = () => {
  let loc = { lat: 40.722216, lng: -73.987501 };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
  }
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  loadImages();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'restaurants-list-item';

  const name = document.createElement('h3');
  name.className = 'restaurant-name';
  name.innerHTML = restaurant.name;
  name.setAttribute('aria-label', `Restaurant ${restaurant.name}`)
  li.append(name);

  const picture = document.createElement('picture');
  picture.className = 'restaurant-image';
  li.append(picture);

  const img = document.createElement('img');
  img.classList.add('restaurant-img');
  img.classList.add('lazy');
  img.src = '../img/place-holder.jpg';
  img.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
  img.setAttribute('alt', `Picture of ${restaurant.name}`);
  picture.append(img);
  
  const section = document.createElement('section');
  section.className = 'restaurant-description';
  section.setAttribute('aria-label', `Information about ${restaurant.name} restaurant`)
  li.append(section);

  const neighborhood = document.createElement('p');
  neighborhood.className = 'restaurant-neighborhood';
  neighborhood.innerHTML = restaurant.neighborhood;
  section.append(neighborhood);

  const address = document.createElement('p');
  address.className = 'restaurant-address';
  address.innerHTML = restaurant.address;
  section.append(address);

  const more = document.createElement('a');
  more.className = 'restaurant-details';
  more.setAttribute('aria-label', `View more details about ${restaurant.name} restaurant`);
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

switchMaps = () => {
  const staticMap = document.getElementById('static-map');
  const interactiveMap = document.getElementById('map');
  if (interactiveMap.style.display === 'none') {
    interactiveMap.style.display = 'block';
    updateRestaurants();
    staticMap.style.display = 'none';
  }
}

// render static map
renderStaticMap = (markers) => { 
  const staticMap = document.getElementById('static-map');
  const container = getMapContainer();
  const map = {
    lat: 40.722216,
    lng: -73.987501,
    zoom: 12,
    scale: false
  }
  
  staticMap.setAttribute('tabindex', '0');
  staticMap.setAttribute('alt', 'Google Map - locations of restaurants');
  staticMap.setAttribute('width', container.width);
  staticMap.setAttribute('height', container.height);
  staticMap.setAttribute('src', `https://maps.googleapis.com/maps/api/staticmap?center=${map.lat},+${map.lng}&zoom=${map.zoom}&scale=${map.scale}&size=${container.width}x${container.height}&maptype=roadmap&key=AIzaSyAtBLZYA9PuOhi-9XwPzQI-wsAfNDrOp4U&format=jpg&visual_refresh=true${markers.join('')}`);
}

renderStaticMapAndMarkers = () => {
  DBHelper.fetchStaticMarkers((error, staticMarkers) => {
    if (error) return console.error(error);
    let markers = staticMarkers.map(marker => {
      return `&markers=size:mid%7Ccolor:0xff0000%7Clabel:${marker.name}%7C${marker.lat},+${marker.lng}`;
    });
    renderStaticMap(markers);
  });
}

getMapContainer = () => {
  const mapContainer = document.getElementById('map-container');
  return {
    id: mapContainer.getAttribute('id'),
    height: mapContainer.clientHeight,
    width: mapContainer.clientWidth
  }
}

// Show/hide filter options
toggleFilterOptions = () => {
  const filterButton = document.querySelector('.filter-options button');
  const filterButtonLabel = filterButton.querySelector('span');
  const filterForm = document.querySelector('.filter-options form');

  filterButton.setAttribute('aria-label', 'Hide map filter options');
  filterButton.addEventListener('click', () => {
    if (filterForm.classList.contains('hidden')) {
      filterForm.classList.remove('hidden');
      filterButtonLabel.textContent = 'Hide';
      filterButton.setAttribute('aria-label', 'Hide map filter options');
    } else {
      filterForm.classList.add('hidden');
      filterButtonLabel.textContent = 'Show';
      filterButton.setAttribute('aria-label', 'Show map filter options');
    }
  });
}

// Add accessibility features (WAI-ARIA)
accessibility = () => {
  // map section
  const map = document.getElementById('map');
  map.setAttribute('aria-label', 'Map of Neighborhoods');
  // show list button
  document.querySelector('aside a').setAttribute('aria-label', 'Show filtered restaurants');
}

// lazy loading images to improve preformance - based on https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/
loadImages = () => {
  let lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
  if ("IntersectionObserver" in window) {
    console.log("IntersectionObserver works!");
    let lazyImageObserver = new IntersectionObserver((images, observer) => {
      images.forEach(image => {
        if (image.isIntersecting) {
          let lazyImage = image.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    lazyImages.forEach(lazyImage => lazyImageObserver.observe(lazyImage));
  }
}

// Register Service Worker
registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then( () => {
      console.log('Service Worker registered.');
    }).catch( () => {
      console.warn('Service Worker not registered');
    });
  }
}