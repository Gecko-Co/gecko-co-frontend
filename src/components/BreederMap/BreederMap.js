import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClusterer } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faPencilAlt, faCheck, faPlus, faTrash, faUpload, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './BreederMap.scss';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 20,
  lng: 0
};

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
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
};

const createClusterIcon = (count) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
      <circle cx="25" cy="25" r="22" fill="#bd692d" stroke="#ffffff" stroke-width="2" />
      <text x="25" y="30" font-size="14" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">${count}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function BreederMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const { currentUser } = useAuth();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMarker, setEditedMarker] = useState(null);
  const [userData, setUserData] = useState(null);
  const [species, setSpecies] = useState(['']);
  const [logo, setLogo] = useState(null);
  const searchInputRef = useRef(null);
  const mapRef = useRef(null);

  const createCustomMarker = useCallback((marker) => {
    console.log('Creating custom marker:', marker);
    const size = 40;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw circular background
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#bd692d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (marker.logo) {
      console.log('Marker has logo:', marker.logo);
      // Load the logo image
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = marker.logo;
      img.onload = () => {
        console.log('Logo image loaded');
        // Create a circular clipping path
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI);
        ctx.clip();

        // Draw the logo image
        ctx.drawImage(img, 0, 0, size, size);
        ctx.restore();

        // Update the marker icon
        if (marker.marker) {
          console.log('Updating marker icon');
          marker.marker.setIcon({
            url: canvas.toDataURL(),
            scaledSize: new window.google.maps.Size(size, size),
          });
        }
      };
      img.onerror = (error) => {
        console.error('Error loading logo image:', error);
        // Draw 'G' text as fallback
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G', size / 2, size / 2);

        if (marker.marker) {
          marker.marker.setIcon({
            url: canvas.toDataURL(),
            scaledSize: new window.google.maps.Size(size, size),
          });
        }
      };
    } else {
      console.log('Marker does not have logo, using default');
      // Draw 'G' text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('G', size / 2, size / 2);
    }

    const icon = {
      url: canvas.toDataURL(),
      scaledSize: new window.google.maps.Size(size, size),
    };
    console.log('Returning icon:', icon);
    return icon;
  }, []);

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

  const fetchBreederLocations = useCallback(async () => {
    if (!db) return;
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const fetchedMarkers = usersSnapshot.docs.flatMap(doc => {
        const data = doc.data();
        return (data.breederLocations || []).map((location, index) => ({
          id: `${doc.id}_${index}`,
          ...location,
          position: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
          ownerName: `${data.firstName} ${data.lastName}`,
          ownerId: doc.id,
        }));
      });
      setMarkers(fetchedMarkers);
    } catch (error) {
      console.error('Error fetching breeder locations:', error);
      customToast.error('Failed to fetch breeder locations. Please try again later.');
    }
  }, [createCustomMarker]);

  useEffect(() => {
    fetchBreederLocations();
  }, [fetchBreederLocations]);

  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(-85, -180),
      new window.google.maps.LatLng(85, 180)
    );
    map.fitBounds(bounds);
    setMap(map);
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);


  const handleMapClick = (event) => {
    if (currentUser) {
      const userLocations = markers.filter(marker => marker.ownerId === currentUser.uid);
      if (userLocations.length < 5) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setNewPin({ lat, lng });
        setIsModalOpen(true);
        setIsSidePanelOpen(false);
        setSpecies(['']);
        setLogo(null);
      } else {
        customToast.error('You have reached the maximum limit of 5 locations.');
      }
    } else {
      customToast.error('Please sign in to add a breeder location.');
    }
  };

  const handleMarkerClick = (marker) => {
    try {
      console.log('Marker clicked:', marker);
      setActiveMarker(marker);
      setIsSidePanelOpen(true);
      setEditMode(false);
      setEditedMarker(null);
      setSpecies(marker.species || ['']);
      setLogo(marker.logo || null);
    } catch (error) {
      console.error('Error in handleMarkerClick:', error);
      customToast.error('An error occurred. Please try again.');
    }
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
          let errorMessage = 'Search was not successful.';
          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage += ' No results found for the given search term. Maybe add city/county to be more specific';
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage += ' You have exceeded your quota for Geocoding requests.';
              break;
            case 'REQUEST_DENIED':
              errorMessage += ' The request was denied. Please check your API key configuration.';
              break;
            case 'INVALID_REQUEST':
              errorMessage += ' The request was invalid. Please try a different search term.';
              break;
            default:
              errorMessage += ` Error: ${status}`;
          }
          console.error(errorMessage);
          customToast.error(errorMessage);
        }
      });
    } else {
      console.error('Google Maps not loaded or map not initialized');
      customToast.error('Unable to perform search. Please try again later.');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogo(file);
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
    const breeder = e.target.breeder.value;
    const contactInfo = e.target.contactInfo.value;

    if (breeder && contactInfo && newPin && currentUser) {
      try {
        const logoUrl = logo ? await uploadLogo(logo) : null;
        const newBreederLocation = {
          breeder,
          species: species.filter(s => s.trim() !== ''),
          contactInfo,
          latitude: newPin.lat,
          longitude: newPin.lng,
          logo: logoUrl,
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
          id: `${currentUser.uid}_${markers.length}`,
          ...newBreederLocation,
          position: { lat: newPin.lat, lng: newPin.lng },
          ownerName: `${userData?.firstName} ${userData?.lastName}`,
          ownerId: currentUser.uid,
        };
        setMarkers([...markers, newMarker]);
        setNewPin(null);
        setIsModalOpen(false);
        setLogo(null);
        setSpecies(['']);
        customToast.success('Breeder location added successfully!');
      } catch (error) {
        console.error('Error adding breeder location:', error);
        customToast.error('Failed to add breeder location. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPin(null);
    setSpecies(['']);
    setLogo(null);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setActiveMarker(null);
    setEditMode(false);
    setEditedMarker(null);
    setSpecies(['']);
    setLogo(null);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditedMarker({ ...activeMarker });
    setSpecies(activeMarker.species || ['']);
    setLogo(activeMarker.logo || null);
  };

  const handleSaveEdit = async () => {
    if (!currentUser || !activeMarker) return;

    try {
      const logoUrl = logo instanceof File ? await uploadLogo(logo) : logo;
      const userRef = doc(db, 'users', activeMarker.ownerId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      if (!userData) throw new Error('User data not found');

      const updatedLocations = userData.breederLocations.map(location =>
        location.latitude === activeMarker.position.lat && location.longitude === activeMarker.position.lng
          ? {
            ...location,
            breeder: editedMarker.breeder,
            species: species.filter(s => s.trim() !== ''),
            contactInfo: editedMarker.contactInfo,
            logo: logoUrl,
          }
          : location
      );
      await updateDoc(userRef, { breederLocations: updatedLocations });
      const updatedMarker = {
        ...editedMarker,
        species: species.filter(s => s.trim() !== ''),
        logo: logoUrl,
      };
      setMarkers(markers.map(marker =>
        marker.id === updatedMarker.id ? updatedMarker : marker
      ));
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
    setEditedMarker({ ...editedMarker, [e.target.name]: e.target.value });
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

  const handleRemoveLocation = async () => {
    if (currentUser && activeMarker && currentUser.uid === activeMarker.ownerId) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        if (!userData) throw new Error('User data not found');

        const locationToRemove = userData.breederLocations.find(
          location => location.latitude === activeMarker.position.lat && location.longitude === activeMarker.position.lng
        );

        if (locationToRemove) {
          await updateDoc(userRef, {
            breederLocations: arrayRemove(locationToRemove)
          });

          setMarkers(markers.filter(marker => marker.id !== activeMarker.id));
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

  if (loadError) {
    return <div className="breeder-map__error">Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div className="breeder-map__loading">Loading...</div>;
  }

  return (
    <div className="breeder-map">
      <h1 className="section-title">Breeder Map</h1>
      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for a location"
        />
        <button onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} /> Search
        </button>
      </div>
      <div className="map-wrapper">
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={2}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={mapOptions}
          >
            <MarkerClusterer
              options={{
                imagePath:
                  'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                styles: [
                  {
                    url: createClusterIcon(1),
                    height: 50,
                    width: 50,
                    textColor: '#ffffff',
                    textSize: 14,
                  },
                  {
                    url: createClusterIcon(10),
                    height: 50,
                    width: 50,
                    textColor: '#ffffff',
                    textSize: 14,
                  },
                  {
                    url: createClusterIcon(100),
                    height: 50,
                    width: 50,
                    textColor: '#ffffff',
                    textSize: 14,
                  },
                ],
              }}
            >
              {(clusterer) =>
                markers.map((marker) => (
                  <MarkerF
                    key={marker.id}
                    position={marker.position}
                    onClick={() => handleMarkerClick(marker)}
                    clusterer={clusterer}
                    icon={createCustomMarker(marker)}
                    onLoad={(markerInstance) => {
                      console.log('Marker loaded:', marker.id);
                      marker.marker = markerInstance;
                      const icon = createCustomMarker(marker);
                      console.log('Setting icon for marker:', marker.id, icon);
                      markerInstance.setIcon(icon);
                    }}
                  />
                ))
              }
            </MarkerClusterer>
            {newPin && (
              <MarkerF
                position={newPin}
                icon={createCustomMarker({ logo: null })}
                onLoad={(markerInstance) => {
                  console.log('New pin marker loaded');
                  const icon = createCustomMarker({ logo: null });
                  console.log('Setting icon for new pin:', icon);
                  markerInstance.setIcon(icon);
                }}
              />
            )}
          </GoogleMap>
        </div>
        {isSidePanelOpen && activeMarker && (
          <div className="side-panel">
            <button className="close-button" onClick={handleCloseSidePanel}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="breeder-header">
              {activeMarker.logo && (
                <img src={activeMarker.logo} alt="Breeder logo" className="breeder-logo" />
              )}
              <h3>{activeMarker.breeder}</h3>
            </div>
            {editMode ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                <div className="info-item">
                  <label htmlFor="breeder">Breeder:</label>
                  <input
                    type="text"
                    id="breeder"
                    name="breeder"
                    value={editedMarker.breeder}
                    onChange={handleInputChange}
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
                      />
                      <button type="button" onClick={() => handleRemoveSpecies(index)} className="btn-icon">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddSpecies} className="btn-secondary">
                    <FontAwesomeIcon icon={faPlus} /> Add Species
                  </button>
                </div>
                <div className="info-item">
                  <label htmlFor="contactInfo">Contact:</label>
                  <input
                    type="text"
                    id="contactInfo"
                    name="contactInfo"
                    value={editedMarker.contactInfo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="info-item">
                  <label htmlFor="logo" className="file-input-label">
                    <FontAwesomeIcon icon={faUpload} /> Upload Logo
                  </label>
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {(logo || editedMarker.logo) && (
                    <img
                      src={logo instanceof File ? URL.createObjectURL(logo) : editedMarker.logo}
                      alt="Logo preview"
                      className="logo-preview"
                    />
                  )}
                </div>
                <button type="submit" className="btn btn-primary">
                  <FontAwesomeIcon icon={faCheck} /> Save
                </button>
              </form>
            ) : (
              <>
                <div className="info-item">
                  <strong>Owner:</strong>
                  <span>{activeMarker.ownerName}</span>
                </div>
                <div className="info-item">
                  <strong>Species:</strong>
                  <ul>
                    {activeMarker.species && activeMarker.species.map((s, index) => (
                      <li key={index}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="info-item">
                  <strong>Contact:</strong>
                  <span>{activeMarker.contactInfo}</span>
                </div>
                {currentUser && currentUser.uid === activeMarker.ownerId && (
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
            <h3>Add Your Breeder Location</h3>
            <form onSubmit={handlePinSubmit} className="add-location-form">
              <div className="info-item">
                <label htmlFor="breeder">Breeder Name:</label>
                <input
                  type="text"
                  id="breeder"
                  name="breeder"
                  placeholder="Breeder Name"
                  required
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
                    />
                    <button type="button" onClick={() => handleRemoveSpecies(index)} className="btn-icon">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddSpecies} className="btn-secondary">
                  <FontAwesomeIcon icon={faPlus} /> Add Species
                </button>
              </div>
              <div className="info-item">
                <label htmlFor="contactInfo">Contact Info:</label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  placeholder="Contact Info"
                  required
                />
              </div>
              <div className="info-item">
                <label htmlFor="logo" className="file-input-label">
                  <FontAwesomeIcon icon={faUpload} /> Upload Logo
                </label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {logo && (
                  <img src={URL.createObjectURL(logo)} alt="Logo preview" className="logo-preview" />
                )}
              </div>
              <button type="submit" className="save-button">
                <FontAwesomeIcon icon={faCheck} /> Add Location
              </button>
            </form>
            <button className="btn btn-icon btn-secondary close-button" onClick={handleCloseModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}