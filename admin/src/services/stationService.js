import axiosClient from './axiosClient';

export async function getBusStations() {
  try {
    const response = await axiosClient.get('/stations');
    if (response && response.success && response.data) {
      // Backend có thể trả về { items: [...] } hoặc array trực tiếp
      const stations = response.data.items || response.data;
      
      if (Array.isArray(stations)) {
        return stations.map(station => ({
          id: station.id,
          name: station.name,
          image: station.image || '',
          wallpaper: station.wallpaper || '',
          descriptions: station.descriptions || '',
          location: station.location || '',
          created_at: station.createdAt ? new Date(station.createdAt).toLocaleDateString('vi-VN') : '',
          updated_at: station.updatedAt ? new Date(station.updatedAt).toLocaleDateString('vi-VN') : '',
        }));
      }
    }
    console.warn('Unexpected stations response format:', response);
    return [];
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
}

export async function addBusStation(stationData) {
  try {
    const response = await axiosClient.post('/stations', {
      name: stationData.name,
      image: stationData.image || undefined,
      wallpaper: stationData.wallpaper || undefined,
      descriptions: stationData.descriptions || undefined,
      location: stationData.location || undefined,
    });
    return response;
  } catch (error) {
    console.error('Error adding station:', error);
    throw error;
  }
}

export async function updateBusStation(updatedStation) {
  try {
    const response = await axiosClient.put(`/stations/${updatedStation.id}`, {
      name: updatedStation.name,
      image: updatedStation.image || undefined,
      wallpaper: updatedStation.wallpaper || undefined,
      descriptions: updatedStation.descriptions || undefined,
      location: updatedStation.location || undefined,
    });
    return response;
  } catch (error) {
    console.error('Error updating station:', error);
    throw error;
  }
}

export async function deleteBusStation(id) {
  try {
    const response = await axiosClient.delete(`/stations/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  }
}
