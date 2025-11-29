import axiosClient from './axiosClient';

const mapSeat = (seat) => ({
  id: seat.id,
  busId: seat.busId,
  seatNumber: seat.seatNumber,
  seatType: seat.seatType,
  status: seat.status,
  priceForSeatType: seat.priceForSeatType,
  isHidden: Boolean(seat.isHidden),
  bus: seat.bus ? {
    id: seat.bus.id,
    name: seat.bus.name,
    licensePlate: seat.bus.licensePlate,
    capacity: seat.bus.capacity,
    floors: seat.bus.floors || 1,
  } : null,
});

export const getSeatsByBus = async (busId, scheduleId = null) => {
  if (!busId) return { seats: [], seatMap: {}, busName: '', busFloors: 1 };
  try {
    const params = scheduleId ? { scheduleId } : {};
    const response = await axiosClient.get(`/seats/bus/${busId}`, { params });
    if (response?.success && response?.data) {
      const seats = Array.isArray(response.data.seats)
        ? response.data.seats.map(mapSeat)
        : [];
      const busFloors = seats[0]?.bus?.floors || response.data.bus?.floors || 1;
      return {
        busId: response.data.busId,
        busName: response.data.busName || '',
        busFloors,
        seats,
        seatMap: response.data.seatMap || {},
        layoutConfig: response.data.layoutConfig || null,
      };
    }
    if (Array.isArray(response)) {
      const seats = response.map(mapSeat);
      const busFloors = seats[0]?.bus?.floors || 1;
      return {
        busId,
        busName: '',
        busFloors,
        seats,
        seatMap: {},
      };
    }
    return { seats: [], seatMap: {}, busName: '', busFloors: 1 };
  } catch (error) {
    console.error('Error fetching seats:', error);
    throw error;
  }
};


