import './styles.css';

// js code kamu di sini


const BASE_URL = 'https://story-api.dicoding.dev/v1';
const DEFAULT_MAP_CENTER = [-6.2088, 106.8456]; 
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';


let map;
let marker;
let stream;
let userData = null;
let token = localStorage.getItem('token');
let userId = localStorage.getItem('userId');
let userName = localStorage.getItem('name');
let pushSubscription = null;


const StoryModel = {

  async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      localStorage.setItem('token', data.loginResult.token);
      localStorage.setItem('userId', data.loginResult.userId);
      localStorage.setItem('name', data.loginResult.name);
      
      token = data.loginResult.token;
      userId = data.loginResult.userId;
      userName = data.loginResult.name;
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async register(name, email, password) {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    token = null;
    userId = null;
    userName = null;
  },
  
  
  async getAllStories(page = 1, size = 10, location = 0) {
    try {
      let url = `${BASE_URL}/stories?page=${page}&size=${size}&location=${location}`;
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data.listStory;
    } catch (error) {
      throw error;
    }
  },
  
  async getStoryDetail(id) {
    try {
      const response = await fetch(`${BASE_URL}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data.story;
    } catch (error) {
      throw error;
    }
  },
  
  async addStory(description, photoBlob, lat, lon) {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoBlob);
      
      if (lat && lon) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }
      
      let url = `${BASE_URL}/stories`;
      const headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        url = `${BASE_URL}/stories/guest`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  
  async subscribeNotification(subscription) {
    try {
      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
          },
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async unsubscribeNotification(subscription) {
    try {
      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
};


const StoryPresenter = {
  init() {
    this.initRouter();
    this.initEventListeners();
    this.updateAuthUI();
  },
  
  initRouter() {
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    this.handleRouteChange();
  },
  
  handleRouteChange() {
    const hash = window.location.hash || '#/';
    const routes = {
      '#/': this.renderHome.bind(this),
      '#/add-story': this.renderAddStory.bind(this),
      '#/profile': this.renderProfile.bind(this),
    };
    
    
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        const render = routes[hash] || routes['#/'];
        render();
        
        
        document.querySelectorAll('.nav-item').forEach(item => {
          if (item.getAttribute('href') === hash) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      });
    } else {
      const render = routes[hash] || routes['#/'];
      render();
      
     
      document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === hash) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  },
  
  initEventListeners() {

    document.getElementById('login-button').addEventListener('click', () => {
      document.getElementById('login-modal').style.display = 'block';
    });
    
    document.getElementById('register-button').addEventListener('click', () => {
      document.getElementById('register-modal').style.display = 'block';
    });
    
    document.getElementById('logout-button').addEventListener('click', () => {
      StoryModel.logout();
      this.updateAuthUI();
      this.showNotification('Logged out successfully');
      window.location.hash = '#/';
    });
    
   
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        await StoryModel.login(email, password);
        document.getElementById('login-modal').style.display = 'none';
        this.updateAuthUI();
        this.showNotification('Logged in successfully');
        window.location.hash = '#/';
      } catch (error) {
        this.showNotification(error.message, true);
      }
    });
    
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      
      try {
        await StoryModel.register(name, email, password);
        document.getElementById('register-modal').style.display = 'none';
        this.showNotification('Registration successful. Please login.');
      } catch (error) {
        this.showNotification(error.message, true);
      }
    });
    
    
    document.querySelectorAll('.close').forEach(close => {
      close.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
          modal.style.display = 'none';
        });
        
       
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
        }
      });
    });
    
    
    window.addEventListener('click', (e) => {
      document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
          modal.style.display = 'none';
          
          
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
          }
        }
      });
    });
  },
  
  updateAuthUI() {
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');
    const profileLink = document.getElementById('profile-link');
    
    if (token) {
      loginButton.classList.add('hidden');
      registerButton.classList.add('hidden');
      logoutButton.classList.remove('hidden');
      profileLink.classList.remove('hidden');
    } else {
      loginButton.classList.remove('hidden');
      registerButton.classList.remove('hidden');
      logoutButton.classList.add('hidden');
      profileLink.classList.add('hidden');
    }
  },
  
  async renderHome() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
      <h2>Recent Stories</h2>
      <div class="loader">
        <div class="spinner"></div>
      </div>
      <div class="stories-container"></div>
    `;
    
    try {
      const stories = await StoryModel.getAllStories(1, 20, 1);
      const storiesContainer = document.querySelector('.stories-container');
      
      if (stories.length === 0) {
        storiesContainer.innerHTML = '<p>No stories found. Be the first to share a story!</p>';
      } else {
        storiesContainer.innerHTML = stories.map(story => `
          <article class="story-card">
            <img src="${story.photoUrl}" alt="Photo for story by ${story.name}" class="story-image">
            <div class="story-content">
              <div class="story-author">
                <i class="fas fa-user author-icon"></i>
                <span>${story.name}</span>
              </div>
              <h3 class="story-title">Story by ${story.name}</h3>
              <p class="story-description">${story.description}</p>
              <div class="story-meta">
                <span><i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString()}</span>
                <button class="story-detail-button" data-id="${story.id}">View Details</button>
              </div>
            </div>
          </article>
        `).join('');
        
        
        document.querySelectorAll('.story-detail-button').forEach(button => {
            button.addEventListener('click', async () => {
              const storyId = button.getAttribute('data-id');
              this.showStoryDetail(storyId);
            });
          });
        }
        
        document.querySelector('.loader').remove();
      } catch (error) {
        document.querySelector('.loader').remove();
        this.showNotification(error.message, true);
      }
    },
    
    async showStoryDetail(storyId) {
      const modal = document.getElementById('story-detail-modal');
      const container = document.getElementById('story-detail-container');
      
      container.innerHTML = `
        <div class="loader">
          <div class="spinner"></div>
        </div>
      `;
      
      modal.style.display = 'block';
      
      try {
        const story = await StoryModel.getStoryDetail(storyId);
        
        container.innerHTML = `
          <div class="story-detail">
            <img src="${story.photoUrl}" alt="Photo for story by ${story.name}" class="story-detail-image">
            <div class="story-detail-info">
              <div>
                <h3>${story.name}'s Story</h3>
                <p><i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <p>${story.description}</p>
            ${story.lat && story.lon ? `<div id="detail-map" class="story-map"></div>` : ''}
          </div>
        `;
        
        
        if (story.lat && story.lon) {
          setTimeout(() => {
            const detailMap = L.map('detail-map').setView([story.lat, story.lon], 13);
            
            
            const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
            
            const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
              maxZoom: 20,
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
              attribution: '&copy; Google Maps'
            });
            
            const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
            });
            
            
            const baseLayers = {
              "Street": streetLayer,
              "Satellite": satelliteLayer,
              "Topographic": topoLayer
            };
            
           
            streetLayer.addTo(detailMap);
            
           
            L.control.layers(baseLayers).addTo(detailMap);
            
            
            L.marker([story.lat, story.lon])
              .addTo(detailMap)
              .bindPopup(`<strong>${story.name}'s Story</strong><br>${story.description.substring(0, 100)}...`)
              .openPopup();
          }, 100);
        }
      } catch (error) {
        container.innerHTML = `<p class="error">Error loading story details: ${error.message}</p>`;
      }
    },
    
    async renderAddStory() {
      const appContainer = document.getElementById('app');
      
      appContainer.innerHTML = `
        <div class="form-container">
          <h2 class="form-title">Share Your Story</h2>
          <form id="add-story-form">
            <div class="camera-container">
              <label>Take a Photo</label>
              <div class="camera-preview" id="camera-preview">
                <i class="fas fa-camera fa-3x"></i>
              </div>
              <div class="camera-buttons">
                <button type="button" id="start-camera" class="btn btn-secondary">
                  <i class="fas fa-camera"></i> Start Camera
                </button>
                <button type="button" id="capture-photo" class="btn btn-primary" disabled>
                  <i class="fas fa-camera-retro"></i> Capture
                </button>
                <button type="button" id="retry-photo" class="btn btn-danger" disabled>
                  <i class="fas fa-redo"></i> Retry
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label for="story-description">Description</label>
              <textarea id="story-description" rows="4" required></textarea>
            </div>
            
            <div>
              <label>Select Location (Click on the map)</label>
              <div id="add-map" class="add-map"></div>
              <div class="form-group">
                <label for="story-location">Selected Location</label>
                <input type="text" id="story-location" readonly>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> Share Story
            </button>
          </form>
        </div>
      `;
      
      
      setTimeout(() => {
        map = L.map('add-map').setView(DEFAULT_MAP_CENTER, 13);
        
        
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        
        const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps'
        });
        
        const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
        });
        
        
        const baseLayers = {
          "Street": streetLayer,
          "Satellite": satelliteLayer,
          "Topographic": topoLayer
        };
        
       
        streetLayer.addTo(map);
        
        
        L.control.layers(baseLayers).addTo(map);
        
        
        map.on('click', (e) => {
          
          if (marker) {
            map.removeLayer(marker);
          }
          
          
          marker = L.marker(e.latlng).addTo(map);
          
          
          document.getElementById('story-location').value = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`;
        });
      }, 100);
      
      
      let capturedPhoto = null;
      const startCameraButton = document.getElementById('start-camera');
      const capturePhotoButton = document.getElementById('capture-photo');
      const retryPhotoButton = document.getElementById('retry-photo');
      const cameraPreview = document.getElementById('camera-preview');
      
      startCameraButton.addEventListener('click', async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
          
          const videoElement = document.createElement('video');
          videoElement.srcObject = stream;
          videoElement.autoplay = true;
          videoElement.id = 'camera-stream';
          
          cameraPreview.innerHTML = '';
          cameraPreview.appendChild(videoElement);
          
          startCameraButton.disabled = true;
          capturePhotoButton.disabled = false;
        } catch (error) {
          this.showNotification('Failed to access camera: ' + error.message, true);
        }
      });
      
      capturePhotoButton.addEventListener('click', () => {
        const videoElement = document.getElementById('camera-stream');
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
       
        const capturedImage = document.createElement('img');
        capturedImage.src = canvas.toDataURL('image/jpeg');
        capturedImage.id = 'captured-image';
        
        
        canvas.toBlob(blob => {
          capturedPhoto = blob;
        }, 'image/jpeg');
        
        
        cameraPreview.innerHTML = '';
        cameraPreview.appendChild(capturedImage);
        
        
        capturePhotoButton.disabled = true;
        retryPhotoButton.disabled = false;
        
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
      
      retryPhotoButton.addEventListener('click', () => {
        
        capturedPhoto = null;
        
        
        cameraPreview.innerHTML = '<i class="fas fa-camera fa-3x"></i>';
        
       
        startCameraButton.disabled = false;
        capturePhotoButton.disabled = true;
        retryPhotoButton.disabled = true;
      });
      
      
      document.getElementById('add-story-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!capturedPhoto) {
          this.showNotification('Please take a photo first', true);
          return;
        }
        
        const description = document.getElementById('story-description').value;
        let latitude = null;
        let longitude = null;
        
        if (marker) {
          latitude = marker.getLatLng().lat;
          longitude = marker.getLatLng().lng;
        }
        
        try {
          const result = await StoryModel.addStory(description, capturedPhoto, latitude, longitude);
          
          
          this.showNotification('Story shared successfully!');
          
          
          if (pushSubscription && token) {
            
          }
          
          
          document.getElementById('add-story-form').reset();
          cameraPreview.innerHTML = '<i class="fas fa-camera fa-3x"></i>';
          capturedPhoto = null;
          
          if (marker) {
            map.removeLayer(marker);
            marker = null;
          }
          
         
          startCameraButton.disabled = false;
          capturePhotoButton.disabled = true;
          retryPhotoButton.disabled = true;
          
          
          setTimeout(() => {
            window.location.hash = '#/';
          }, 1500);
        } catch (error) {
          this.showNotification(error.message, true);
        }
      });
    },
    
    renderProfile() {
      if (!token) {
        this.showNotification('Please login to view your profile', true);
        window.location.hash = '#/';
        return;
      }
      
      const appContainer = document.getElementById('app');
      
      
      const initials = userName ? userName.charAt(0).toUpperCase() : 'U';
      
      appContainer.innerHTML = `
        <div class="profile-container">
          <div class="profile-header">
            <div class="profile-avatar">${initials}</div>
            <h2 class="profile-name">${userName || 'User'}</h2>
            <p class="profile-email">User ID: ${userId || 'Unknown'}</p>
          </div>
          
          <div class="notifications-section">
            <h3>Push Notifications</h3>
            <p>Get notified when your stories are published.</p>
            
            <div class="toggle-container">
              <label class="toggle-switch">
                <input type="checkbox" id="notifications-toggle">
                <span class="slider"></span>
              </label>
              <span>Enable Push Notifications</span>
            </div>
          </div>
        </div>
      `;
      
      
      const notificationsToggle = document.getElementById('notifications-toggle');
      
      
      if ('serviceWorker' in navigator && 'PushManager' in window) {
       
        navigator.serviceWorker.register('./service-worker.js')
          .then(async (registration) => {
           
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
              pushSubscription = subscription;
              notificationsToggle.checked = true;
            }
            
         
            notificationsToggle.addEventListener('change', async () => {
              if (notificationsToggle.checked) {
                try {
                  
                  const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                  });
                  
                  pushSubscription = subscription;
                  
                 
                  await StoryModel.subscribeNotification(subscription);
                  
                  this.showNotification('Push notifications enabled');
                } catch (error) {
                  notificationsToggle.checked = false;
                  this.showNotification('Failed to enable push notifications: ' + error.message, true);
                }
              } else {
                try {
                  if (pushSubscription) {
                    
                    await StoryModel.unsubscribeNotification(pushSubscription);
                    await pushSubscription.unsubscribe();
                    
                    pushSubscription = null;
                    this.showNotification('Push notifications disabled');
                  }
                } catch (error) {
                  this.showNotification('Failed to disable push notifications: ' + error.message, true);
                }
              }
            });
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
            notificationsToggle.disabled = true;
            notificationsToggle.parentElement.nextElementSibling.textContent = 'Push notifications not available';
          });
      } else {
        notificationsToggle.disabled = true;
        notificationsToggle.parentElement.nextElementSibling.textContent = 'Push notifications not supported on this browser';
      }
    },
    
    showNotification(message, isError = false) {
      const notification = document.getElementById('notification');
      const notificationMessage = document.getElementById('notification-message');
      
      notification.classList.remove('hidden', 'error');
      
      if (isError) {
        notification.classList.add('error');
      }
      
      notificationMessage.textContent = message;
      
     
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    },
    
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      
      return outputArray;
    }
  };
  
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
  
 
  document.addEventListener('DOMContentLoaded', () => {
    StoryPresenter.init();
  });