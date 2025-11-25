import axiosClient from './axiosClient';

const mapStation = (station) => {
  if (!station) return null;
  return {
    id: station.id,
    name: station.name,
    address: station.address ?? station.location ?? '',
    province: station.province ?? '',
  };
};

const mapBusCompany = (company) => {
  if (!company) return null;
  return {
    id: company.id,
    name: company.companyName || company.name,
    image: company.image || '',
  };
};

const mapBus = (bus) => {
  if (!bus) return null;
  return {
    id: bus.id,
    name: bus.name,
    licensePlate: bus.licensePlate || bus.license_plate,
    capacity: bus.capacity,
    floors: bus.floors,
    company: mapBusCompany(bus.company),
  };
};

const mapRoute = (route) => {
  if (!route) return null;
  return {
    id: route.id,
    price: route.price,
    duration: route.duration,
    distance: route.distance,
    busCompanyId: route.busCompanyId,
    departureStation: mapStation(route.departureStation),
    arrivalStation: mapStation(route.arrivalStation),
    busCompany: mapBusCompany(route.busCompany),
  };
};

const mapSchedule = (schedule) => ({
  id: schedule.id,
  routeId: schedule.routeId,
  busId: schedule.busId,
  startDate: schedule.startDate,
  endDate: schedule.endDate,
  departureTime: schedule.departureTime,
  arrivalTime: schedule.arrivalTime,
  availableSeat: schedule.availableSeat,
  totalSeats: schedule.totalSeats,
  status: schedule.status,
  createdAt: schedule.createdAt,
  updatedAt: schedule.updatedAt,
  route: mapRoute(schedule.route),
  bus: mapBus(schedule.bus),
});

export const getSchedules = async (params = {}) => {
  try {
    const response = await axiosClient.get('/schedules', { params });

    if (response?.success && response?.data) {
      const { items = [], total = 0, page = params.page || 1, limit = params.limit || 10, totalPages = 1 } =
        response.data;

      return {
        items: Array.isArray(items) ? items.map(mapSchedule) : [],
        total,
        page,
        totalPages,
        limit,
      };
    }

    if (Array.isArray(response)) {
      return {
        items: response.map(mapSchedule),
        total: response.length,
        page: 1,
        totalPages: 1,
        limit: response.length,
      };
    }

    return {
      items: [],
      total: 0,
      page: params.page || 1,
      totalPages: 1,
      limit: params.limit || 10,
    };
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const getScheduleById = async (id) => {
  if (!id) return null;
  try {
    const response = await axiosClient.get(`/schedules/${id}`);
    if (response?.success && response?.data) {
      return mapSchedule(response.data);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching schedule ${id}:`, error);
    throw error;
  }
};


