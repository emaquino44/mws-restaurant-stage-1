# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Backend server (prerequisites)
Repository of the backend server can be found here: https://github.com/21010/mws-restaurant-stage-3.git

### How to install backend server?
Server depends on [node.js LTS Version: v6.11.2 ](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/get-npm), and [sails.js](http://sailsjs.com/)
Please make sure you have these installed before proceeding forward.

Great, you are ready to proceed forward; awesome!

Let's start with running commands in your terminal, known as command line interface (CLI)

###### Clone the repository
```Clone server repository
# git clone https://github.com/21010/mws-restaurant-stage-3.git
```

###### Install project dependancies
```Install project dependancies
# npm i
```
###### Install Sails.js globally
```Install sails global
# npm i sails -g
```
###### Start the server
```Start server
# node server
```
### You should now have access to your API server environment
debug: Environment : development
debug: Port        : 1337

### Usage
####Endpoints
#####GET Endpoints
Get all restaurants

```
http://localhost:1337/restaurants/
```

Get favorite restaurants 

```
http://localhost:1337/restaurants/?is_favorite=true
```

Get a restaurant by id

```
http://localhost:1337/restaurants/<restaurant_id>
```

Get all reviews for a restaurant

```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

Get all restaurant reviews

```
http://localhost:1337/reviews/
```

Get a restaurant review by id

```
http://localhost:1337/reviews/<review_id>
```

Get all reviews for a restaurant

```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

#####POST Endpoints
Create a new restaurant review

```javascript
http://localhost:1337/reviews/
```

Parameters

```json
{
    "restaurant_id": <restaurant_id>,
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```



#####PUT Endpoints
Favorite a restaurant

```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
```

Unfavorite a restaurant

```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false
```

Update a restaurant review

```
http://localhost:1337/reviews/<review_id>
```

Parameters

```
{
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```

#####DELETE Endpoints
Delete a restaurant review

```
http://localhost:1337/reviews/<review_id>
```


### Architecture
Local server
- Node.js
- Sails.js

### Contributors

- [Brandy Lee Camacho - Technical Project Manager](mailto:brandy.camacho@udacity.com)
- [David Harris - Web Services Lead](mailto:david.harris@udacity.com)
- [Omar Albeik - Frontend engineer](mailto:omaralbeik@gmail.com)


## Client App
### How to prepare?
1. clone the repository:
```
# git clone https://github.com/21010/mws-restaurant-stage-1.git
```
2. Install required modules
```
# npm install
```

3. if 'dist' directory is missing or is empty run gulp setup command
```
# gulp setup
```
4. Run gulp serve to run the server
```
# gulp serve
```

You can also run 'gulp' command to prepare the app and run the server at once.



## Project Overview: Stage 3

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 


### Who wrote this?
Hi! My name is Greg and I'm a happy participant of Google Schoolarship program. I'm on Mobile Web Specialist Nanodegree provided by Udacity and Google.
I love to code, especially Web apps. I live in Poland, have a dog and like to going out with him and friends. I also playing guitar and piano in a spare time.
