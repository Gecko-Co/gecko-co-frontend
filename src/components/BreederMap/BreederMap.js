import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faPencilAlt, faCheck, faPlus, faTrash, faUpload, faLink, faMapPin, faDragon, faLocationArrow, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion, arrayRemove, query, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import supercluster from 'supercluster';
import axios from 'axios';
import './BreederMap.scss';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const libraries = ['places'];

export default function BreederMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  const { currentUser } = useAuth();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [zoom, setZoom] = useState(3);
  const [bounds, setBounds] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMarker, setEditedMarker] = useState(null);
  const [userData, setUserData] = useState(null);
  const [species, setSpecies] = useState(['']);
  const [links, setLinks] = useState(['']);
  const [logo, setLogo] = useState(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cachedBreederLocations, setCachedBreederLocations] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [initialZoom, setInitialZoom] = useState(3);

  const searchInputRef = useRef(null);
  const mapRef = useRef(null);
  const clusterIndexRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const mapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: true,
    clickableIcons: false,
    restriction: {
      latLngBounds: {
        north: 85,
        south: -85,
        west: -180,
        east: 180,
      },
      strictBounds: false,
    },
    minZoom: 2,
    mapId: '3c0cbad635cf86d2',
    gestureHandling: isMobile ? 'greedy' : 'cooperative',
  };
  
  useEffect(() => {
    if (isLoaded && map) {
      map.setOptions({
        zoomControlOptions: {
          position: window.google?.maps.ControlPosition.LEFT_CENTER,
        },
      });
    }
  }, [isLoaded, map]);

  useEffect(() => {
    if (loadError) {
      console.error('Error loading Google Maps:', loadError);
      customToast.error('Failed to load Google Maps. Please try again later.');
    }
  }, [loadError]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          customToast.error('Failed to fetch user data. Please try again later.');
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const getIPBasedLocation = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const { latitude, longitude, country_name } = response.data;
        setCenter({ lat: latitude, lng: longitude });
        
        // Set initial zoom based on country
        if (country_name === "United States") {
          setInitialZoom(4);
        } else {
          setInitialZoom(5);
        }
        
        if (mapRef.current) {
          mapRef.current.panTo({ lat: latitude, lng: longitude });
          mapRef.current.setZoom(initialZoom);
        }
      } catch (error) {
        console.error('Error fetching IP-based location:', error);
        // Fallback to default center and zoom
        setCenter({ lat: 20, lng: 0 });
        setInitialZoom(3);
      }
    };

    getIPBasedLocation();
  }, []);

  const loadCachedBreederLocations = useCallback(() => {
    const cachedData = localStorage.getItem('cachedBreederLocations');
    if (cachedData) {
      const { locations, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setCachedBreederLocations(locations);
        setLastFetchTime(timestamp);
        return locations;
      }
    }
    return null;
  }, []);

  const fetchBreederLocations = useCallback(async () => {
    if (!db) return;
    setIsLoading(true);

    const cachedLocations = loadCachedBreederLocations();
    if (cachedLocations) {
      setMarkers(prevMarkers => [...prevMarkers, ...cachedLocations]);
      setIsLoading(false);
      return;
    }

    try {
      const breederQuery = query(collection(db, 'breeders'), limit(1000));
      const breederSnapshot = await getDocs(breederQuery);
      const breederLocations = breederSnapshot.docs.map(doc => {
        const data = doc.data();
        if (!data.markerPosition || typeof data.markerPosition.lng === 'undefined' || typeof data.markerPosition.lat === 'undefined') {
          console.warn(`Invalid marker position for breeder ${doc.id}:`, data.markerPosition);
          return null;
        }
        return {
          type: 'Feature',
          properties: {
            cluster: false,
            markerId: doc.id,
            ...data,
          },
          geometry: {
            type: 'Point',
            coordinates: [data.markerPosition.lng, data.markerPosition.lat],
          },
        };
      }).filter(location => location !== null);

      setCachedBreederLocations(breederLocations);
      setLastFetchTime(Date.now());
      localStorage.setItem('cachedBreederLocations', JSON.stringify({
        locations: breederLocations,
        timestamp: Date.now()
      }));

      setMarkers(prevMarkers => [...prevMarkers, ...breederLocations]);
    } catch (error) {
      console.error('Error fetching breeder locations:', error);
      customToast.error('Failed to fetch breeder locations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [loadCachedBreederLocations]);

  const fetchUserLocations = useCallback(async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userLocations = usersSnapshot.docs.flatMap(doc => {
        const data = doc.data();
        return (data.breederLocations || []).map((location, index) => ({
          type: 'Feature',
          properties: {
            cluster: false,
            markerId: `${doc.id}_${index}`,
            ...location,
            ownerName: `${data.firstName} ${data.lastName}`,
            ownerId: doc.id,
          },
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
          },
        }));
      });
      setMarkers(userLocations);
    } catch (error) {
      console.error('Error fetching user locations:', error);
      customToast.error('Failed to fetch user locations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchAllLocations = async () => {
      await fetchUserLocations();
      await fetchBreederLocations();
    };

    fetchAllLocations();
  }, [fetchUserLocations, fetchBreederLocations]);

  useEffect(() => {
    if (markers.length > 0) {
      clusterIndexRef.current = new supercluster({
        radius: 75,
        maxZoom: 20,
      });
      clusterIndexRef.current.load(markers);
      if (bounds) {
        const newClusters = clusterIndexRef.current.getClusters(
          [bounds.west, bounds.south, bounds.east, bounds.north],
          Math.floor(zoom)
        );
        setClusters(newClusters);
      }
    }
  }, [markers, bounds, zoom]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
    const initialBounds = map.getBounds();
    if (initialBounds) {
      setBounds(initialBounds.toJSON());
      setZoom(map.getZoom());
    }
    setIsLoading(false);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onIdle = useCallback(() => {
    if (mapRef.current) {
      const newBounds = mapRef.current.getBounds().toJSON();
      const newZoom = mapRef.current.getZoom();
      setZoom(newZoom);
      setBounds(newBounds);
    }
  }, []);

  const handleMapClick = (event) => {
    if (isAddingLocation && currentUser) {
      const userLocations = markers.filter(marker => marker.properties.ownerId === currentUser.uid);
      if (userLocations.length < 5) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setNewPin({ lat, lng });
        setIsModalOpen(true);
        setIsSidePanelOpen(false);
        setSpecies(['']);
        setLinks(['']);
        setLogo(null);
        setIsAddingLocation(false);
      } else {
        customToast.error('You have reached the maximum limit of 5 locations.');
      }
    }
  };

  const handleMarkerClick = (marker) => {
    setActiveMarker(marker);
    setIsSidePanelOpen(true);
    setEditMode(false);
    setEditedMarker(null);
    setSpecies(marker.properties.species || ['']);
    setLinks(marker.properties.links || ['']);
    setLogo(marker.properties.logo || null);
  };

  const handleClusterClick = (clusterId, latitude, longitude) => {
    const expansionZoom = clusterIndexRef.current.getClusterExpansionZoom(clusterId);
    mapRef.current.setZoom(expansionZoom);
    mapRef.current.panTo({ lat: latitude, lng: longitude });
  };

  const handleSearch = () => {
    if (searchInputRef.current && map && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchInputRef.current.value }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          map.setZoom(8);
        } else {
          customToast.error('Search was not successful. Please try a different location.Try adding more details.');
        }
      });
    } else {
      customToast.error('Unable to perform search. Please try again later.');
    }
  };

  const handleShowBreedersAroundMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          setZoom(7);
          if (mapRef.current) {
            mapRef.current.panTo({ lat: latitude, lng: longitude });
            mapRef.current.setZoom(7);
          }
          customToast.success('Showing breeders around your precise location.');
          setIsSearchDropdownOpen(false);
        },
        () => {
          customToast.error('Unable to get your precise location. Please check your browser settings.');
        }
      );
    } else {
      customToast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        customToast.error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        customToast.error('File is too large. Please upload an image smaller than 5MB.');
        return;
      }

      setLogo(file);
      customToast.success('File selected successfully.');
    }
  };

  const uploadLogo = async (file) => {
    if (!file || !currentUser) return null;
    const storageRef = ref(storage, `logos/${currentUser.uid}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const breeder = e.target.breeder.value.trim();
    const ownerName = e.target.ownerName.value.trim();
    const contactInfo = e.target.contactInfo.value.trim();

    if (!breeder || !ownerName) {
      setIsSubmitting(false);
      customToast.error('Please fill in all required fields (Breeder Name and Owner Name).');
      return;
    }

    if (newPin && currentUser) {
      try {
        const logoUrl = logo ? await uploadLogo(logo) : null;
        const newBreederLocation = {
          breeder,
          species: species.filter(s => s.trim() !== ''),
          contactInfo,
          latitude: newPin.lat,
          longitude: newPin.lng,
          logo: logoUrl,
          links: links.filter(link => link.trim() !== ''),
          ownerName,
        };
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          breederLocations: arrayUnion(newBreederLocation)
        });
        const updatedUserData = {
          ...userData,
          breederLocations: [...(userData?.breederLocations || []), newBreederLocation]
        };
        setUserData(updatedUserData);
        const newMarker = {
          type: 'Feature',
          properties: {
            cluster: false,
            markerId: `${currentUser.uid}_${markers.length}`,
            ...newBreederLocation,
            ownerId: currentUser.uid,
          },
          geometry: {
            type: 'Point',
            coordinates: [newPin.lng, newPin.lat],
          },
        };
        setMarkers(prevMarkers => [...prevMarkers, newMarker]);
        clusterIndexRef.current.load([...markers, newMarker]);
        setNewPin(null);
        setIsModalOpen(false);
        setLogo(null);
        setSpecies(['']);
        setLinks(['']);
        customToast.success('Breeder location added successfully!');
      } catch (error) {
        console.error('Error adding breeder location:', error);
        customToast.error('Failed to add breeder location. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      customToast.error('Please select a location on the map.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPin(null);
    setSpecies(['']);
    setLinks(['']);
    setLogo(null);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setActiveMarker(null);
    setEditMode(false);
    setEditedMarker(null);
    setSpecies(['']);
    setLinks(['']);
    setLogo(null);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditedMarker({ ...activeMarker });
    setSpecies(activeMarker.properties.species || ['']);
    setLinks(activeMarker.properties.links || ['']);
    setLogo(activeMarker.properties.logo || null);
  };

  const handleSaveEdit = async () => {
    if (!currentUser || !activeMarker) return;

    try {
      const logoUrl = logo instanceof File ? await uploadLogo(logo) : logo;
      const userRef = doc(db, 'users', activeMarker.properties.ownerId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      if (!userData) throw new Error('User data not found');

      const updatedLocations = userData.breederLocations.map(location =>
        location.latitude === activeMarker.geometry.coordinates[1] && location.longitude === activeMarker.geometry.coordinates[0]
          ? {
            ...location,
            breeder: editedMarker.properties.breeder,
            species: species.filter(s => s.trim() !== ''),
            contactInfo: editedMarker.properties.contactInfo,
            logo: logoUrl,
            links: links.filter(link => link.trim() !== ''),
            ownerName: editedMarker.properties.name || editedMarker.properties.ownerName,
          }
          : location
      );
      await updateDoc(userRef, { breederLocations: updatedLocations });
      const updatedMarker = {
        ...activeMarker,
        properties: {
          ...activeMarker.properties,
          breeder: editedMarker.properties.breeder,
          species: species.filter(s => s.trim() !== ''),
          contactInfo: editedMarker.properties.contactInfo,
          logo: logoUrl,
          links: links.filter(link => link.trim() !== ''),
          ownerName: editedMarker.properties.name || editedMarker.properties.ownerName,
        },
      };
      setMarkers(markers.map(marker =>
        marker.properties.markerId === updatedMarker.properties.markerId ? updatedMarker : marker
      ));
      clusterIndexRef.current.load(markers);
      setActiveMarker(updatedMarker);
      setEditMode(false);
      setLogo(null);
      customToast.success('Breeder information updated successfully!');
    } catch (error) {
      console.error('Error updating breeder information:', error);
      customToast.error('Failed to update breeder information. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setEditedMarker({
      ...editedMarker,
      properties: {
        ...editedMarker.properties,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleAddSpecies = () => {
    setSpecies([...species, '']);
  };

  const handleRemoveSpecies = (index) => {
    setSpecies(species.filter((_, i) => i !== index));
  };

  const handleSpeciesChange = (index, value) => {
    const newSpecies = [...species];
    newSpecies[index] = value;
    setSpecies(newSpecies);
  };

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleRemoveLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleRemoveLocation = async () => {
    if (currentUser && activeMarker && currentUser.uid === activeMarker.properties.ownerId) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        if (!userData) throw new Error('User data not found');

        const locationToRemove = userData.breederLocations.find(
          location => location.latitude === activeMarker.geometry.coordinates[1] && location.longitude === activeMarker.geometry.coordinates[0]
        );

        if (locationToRemove) {
          await updateDoc(userRef, {
            breederLocations: arrayRemove(locationToRemove)
          });

          const updatedMarkers = markers.filter(marker => marker.properties.markerId !== activeMarker.properties.markerId);
          setMarkers(updatedMarkers);
          clusterIndexRef.current.load(updatedMarkers);
          setActiveMarker(null);
          setIsSidePanelOpen(false);
          customToast.success('Location removed successfully!');
        } else {
          customToast.error('Location not found. Please try again.');
        }
      } catch (error) {
        console.error('Error removing location:', error);
        customToast.error('Failed to remove location. Please try again.');
      }
    } else {
      customToast.error('You do not have permission to remove this location.');
    }
  };

  const toggleAddLocationMode = () => {
    if (!currentUser) {
      customToast.error('Please sign in to add a breeder location.');
      return;
    }
    setIsAddingLocation(!isAddingLocation);
    if (!isAddingLocation) {
      customToast.info('Click on the map to add a new breeder location.');
    }
  };

  if (loadError) {
    return (
      <div className="breeder-map__error" role="alert">
        <p>Error loading maps: {loadError.message}</p>
        <p>Please try again later or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="breeder-map">
      <div className={`map-and-panel-container ${isMobile ? 'mobile' : ''}`}>
        <div className={`map-wrapper ${isAddingLocation ? 'adding-location' : ''}`}>
          {!isLoaded || isLoading ? (
            <div className="breeder-map__loading" aria-live="polite">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" />
              <p>Loading map...</p>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={initialZoom}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              onIdle={onIdle}
              options={mapOptions}
            >
              <div className="floating-controls">
                <div className="search-container">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search location"
                    className="search-input"
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)}
                  />
                  <button onClick={handleSearch} className="search-button">
                    <FontAwesomeIcon icon={faSearch} /> Search
                  </button>
                  {isSearchDropdownOpen && (
                    <div className={`search-dropdown ${isSearchDropdownOpen ? 'open' : ''}`}>
                      <button onClick={handleShowBreedersAroundMe} className="show-breeders-around-me-button">
                        <FontAwesomeIcon icon={faLocationArrow} /> Show Breeders Around Me
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleAddLocationMode}
                  className={`add-location-button ${isAddingLocation ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faMapPin} /> {isAddingLocation ? 'Cancel' : 'Add Location'}
                </button>
              </div>
              {clusters.map((cluster) => {
                const [longitude, latitude] = cluster.geometry.coordinates;
                const {
                  cluster: isCluster,
                  point_count: pointCount,
                } = cluster.properties;

                if (isCluster) {
                  return (
                    <OverlayView
                      key={`cluster-${cluster.id}`}
                      position={{ lat: latitude, lng: longitude }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      getPixelPositionOffset={(width, height) => ({
                        x: -(width / 2),
                        y: -(height / 2),
                      })}
                    >
                      <div
                        className="cluster-marker"
                        onClick={() => handleClusterClick(cluster.id, latitude, longitude)}
                      >
                        <div className="cluster-count">{pointCount}</div>
                      </div>
                    </OverlayView>
                  );
                }

                return (
                  <OverlayView
                    key={`marker-${cluster.properties.markerId}`}
                    position={{ lat: latitude, lng: longitude }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={(width, height) => ({
                      x: -(width / 2),
                      y: -(height / 2),
                    })}
                  >
                    <div
                      className="marker-wrapper"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkerClick(cluster);
                      }}
                    >
                      <div className="pulse"></div>
                      <div className="custom-marker">
                        {cluster.properties.logo ? (
                          <img src={cluster.properties.logo} alt={cluster.properties.breeder} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                          <FontAwesomeIcon icon={faDragon} />
                        )}
                      </div>
                    </div>
                  </OverlayView>
                );
              })}
              {newPin && (
                <OverlayView
                  position={newPin}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={(width, height) => ({
                    x: -(width / 2),
                    y: -(height / 2),
                  })}
                >
                  <div className="new-pin-marker">
                    <div className="pulse"></div>
                    <div className="custom-marker">New</div>
                  </div>
                </OverlayView>
              )}
            </GoogleMap>
          )}
        </div>
        {isSidePanelOpen && activeMarker && (
          <div className={`side-panel ${isMobile ? 'mobile' : ''}`}>
            {isMobile && <div className="drag-handle" />}
            <button className="close-button" onClick={handleCloseSidePanel}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="breeder-header">
              {activeMarker.properties.logo && (
                <img src={activeMarker.properties.logo} alt="Breeder logo" className="breeder-logo" />
              )}
              <h3>{activeMarker.properties.breeder}</h3>
            </div>
            {editMode ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="edit-form">
                <div className="info-item">
                  <label htmlFor="breeder">Breeder Name:</label>
                  <input
                    type="text"
                    id="breeder"
                    name="breeder"
                    value={editedMarker.properties.breeder}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="info-item">
                  <label htmlFor="ownerName">Owner Name:</label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={editedMarker.properties.name || editedMarker.properties.ownerName}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="info-item">
                    <label>Species:</label>
                    {species.map((s, index) => (
                      <div key={index} className="species-input">
                        <input
                          type="text"
                          value={s}
                          onChange={(e) => handleSpeciesChange(index, e.target.value)}
                          placeholder="Gecko Species"
                          className="form-input"
                        />
                        <button type="button" onClick={() => handleRemoveSpecies(index)} className="btn-icon">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddSpecies} className="add-species-button">
                      <FontAwesomeIcon icon={faPlus} /> Add Species
                    </button>
                  </div>
                  <div className="info-item">
                    <label htmlFor="contactInfo">Contact:</label>
                    <input
                      type="text"
                      id="contactInfo"
                      name="contactInfo"
                      value={editedMarker.properties.contactInfo}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="info-item">
                    <label>Links:</label>
                    {links.map((link, index) => (
                      <div key={index} className="link-input">
                        <input
                        type="url"
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        placeholder="Website or Social Media Link"
                        className="form-input"
                      />
                      <button type="button" onClick={() => handleRemoveLink(index)} className="btn-icon">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddLink} className="add-link-button">
                    <FontAwesomeIcon icon={faPlus} /> Add Link
                  </button>
                </div>
                <div className="info-item">
                  <label htmlFor="logo" className="file-input-label">
                    <FontAwesomeIcon icon={faUpload} /> Upload Logo (JPEG, PNG, or GIF, max 5MB)
                  </label>
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {(logo || editedMarker.properties.logo) && (
                    <img
                      src={logo instanceof File ? URL.createObjectURL(logo) : editedMarker.properties.logo}
                      alt="Logo preview"
                      className="logo-preview"
                    />
                  )}
                </div>
                <button type="submit" className="save-button">
                  <FontAwesomeIcon icon={faCheck} /> Save
                </button>
            </form>
          ) : (
            <>
                            <div className="info-item">
                  <strong>Breeder Name:</strong>
                  <span>{activeMarker.properties.breeder}</span>
                </div>
              <div className="info-item">
                <strong>Owner:</strong>
                <span>{activeMarker.properties.name || activeMarker.properties.ownerName}</span>
              </div>
              <div className="info-item">
                  <strong>Species:</strong>
                  <ul className="species-list">
                    {activeMarker.properties.species && activeMarker.properties.species.map((s, index) => (
                      <li key={index}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="info-item">
                  <strong>Contact:</strong>
                  <span>{activeMarker.properties.contactInfo}</span>
                </div>
                <div className="info-item">
                  <strong>Links:</strong>
                  <ul className="links-list">
                    {activeMarker.properties.links && activeMarker.properties.links.map((link, index) => (
                      <li key={index}>
                        <a href={link} target="_blank" rel="noopener noreferrer" title={link}>
                          <FontAwesomeIcon icon={faLink} /> {link.length > 30 ? link.substring(0, 20) + '...' : link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                {currentUser && currentUser.uid === activeMarker.properties.ownerId && (
                  <div className="button-group">
                    <button className="edit-button" onClick={handleEditClick}>
                      <FontAwesomeIcon icon={faPencilAlt} /> Edit
                    </button>
                    <button className="remove-button" onClick={handleRemoveLocation}>
                      <FontAwesomeIcon icon={faTrash} /> Remove
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="modal-inner-content">
              <h3>Add Your Breeder Location</h3>
              <form onSubmit={handlePinSubmit} className="add-location-form">
                <div className="form-group">
                  <label htmlFor="breeder">
                    Breeder Name: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="breeder"
                    name="breeder"
                    placeholder="Breeder Name"
                    required
                    className="form-input required-field"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ownerName">
                    Owner Name: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    placeholder="Owner Name"
                    required
                    className="form-input required-field"
                  />
                </div>
                <div className="form-group">
                  <label>Species:</label>
                  {species.map((s, index) => (
                    <div key={index} className="species-input">
                      <input
                        type="text"
                        value={s}
                        onChange={(e) => handleSpeciesChange(index, e.target.value)}
                        placeholder="Gecko Species"
                        className="form-input"
                      />
                      <button type="button" onClick={() => handleRemoveSpecies(index)} className="btn-icon btn-remove">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddSpecies} className="btn-add">
                    <FontAwesomeIcon icon={faPlus} /> Add Species
                  </button>
                </div>
                <div className="form-group">
                  <label htmlFor="contactInfo">Contact Info:</label>
                  <input
                    type="text"
                    id="contactInfo"
                    name="contactInfo"
                    placeholder="Contact Info"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Links:</label>
                  {links.map((link, index) => (
                    <div key={index} className="link-input">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        placeholder="Website or Social Media Link"
                        className="form-input"
                      />
                      <button type="button" onClick={() => handleRemoveLink(index)} className="btn-icon btn-remove">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddLink} className="btn-add">
                    <FontAwesomeIcon icon={faPlus} /> Add Link
                  </button>
                </div>
                <div className="form-group">
                  <label htmlFor="logo" className="file-input-label">
                    <FontAwesomeIcon icon={faUpload} /> Upload Logo (JPEG, PNG, or GIF, max 5MB)
                  </label>
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {logo && (
                    <img
                      src={URL.createObjectURL(logo)}
                      alt="Logo preview"
                      className="logo-preview"
                    />
                  )}
                </div>
                <div className="button-group">
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Submitting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} /> Submit
                </>
              )}
            </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}