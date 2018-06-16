let restaurant,map;window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map),fetchReviewsForRestaurant())})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,r)=>{self.restaurant=r,r?(fillRestaurantHTML(),e(null,r)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fetchReviewsForRestaurant=(()=>{if(self.reviews)return self.reviews;const e=getParameterByName("id");if(!e)return console.error("No restaurant id in URL");DBHelper.fetchAllRestaurantReviews(e,(e,t)=>(self.reviews=t,t?(fillReviewsHTML(),t):console.error(e)))}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.src=DBHelper.imageUrlForRestaurant(e),t.setAttribute("alt",`Picture of ${e.name}`),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.querySelector("#restaurant-hours tbody");for(let r in e){const n=document.createElement("tr"),a=document.createElement("td");a.setAttribute("tabindex","0"),a.innerHTML=r,n.appendChild(a);const l=document.createElement("td");l.setAttribute("tabindex","0"),l.setAttribute("aria-label",r),l.innerHTML=e[r],n.appendChild(l),t.appendChild(n)}}),fillReviewsHTML=((e=self.reviews)=>{const t=document.getElementById("reviews-container"),r=document.createElement("h3");if(r.innerHTML="Reviews",t.appendChild(r),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const n=document.getElementById("reviews-list");n.setAttribute("role","group"),e.forEach(e=>{n.appendChild(createReviewHTML(e))}),t.appendChild(n)}),createReviewHTML=(e=>{const t=document.createElement("li");t.setAttribute("role","article"),t.setAttribute("tabindex","0");const r=document.createElement("p");r.innerHTML=e.name,t.appendChild(r);const n=new Date(e.updatedAt),a=document.createElement("p");a.innerHTML=`${n.getDate()}/${n.getMonth()}/${n.getFullYear()} ${n.getHours()}:${n.getMinutes()}`,t.appendChild(a);const l=document.createElement("p");l.innerHTML=`Rating: ${e.rating}`,t.appendChild(l);const s=document.createElement("p");return s.innerHTML=e.comments,t.appendChild(s),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),r=document.createElement("li");r.innerHTML=e.name,r.setAttribute("aria-current","page"),t.appendChild(r)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const r=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return r?r[2]?decodeURIComponent(r[2].replace(/\+/g," ")):"":null});