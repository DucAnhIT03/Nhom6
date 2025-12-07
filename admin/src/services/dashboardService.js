import axiosClient from './axiosClient';

export async function getDashboardStats() {
  try {
    const response = await axiosClient.get('/dashboard/stats');
    if (response && response.success && response.data) {
      return {
        totalUsers: response.data.totalUsers || 0,
        totalStations: response.data.totalStations || 0,
        totalCompanies: response.data.totalCompanies || 0,
        totalBuses: response.data.totalBuses || 0,
        totalRoutes: response.data.totalRoutes || 0,
        totalPosts: response.data.totalPosts || 0,
      };
    }
    return {
      totalUsers: 0,
      totalStations: 0,
      totalCompanies: 0,
      totalBuses: 0,
      totalRoutes: 0,
      totalPosts: 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalStations: 0,
      totalCompanies: 0,
      totalBuses: 0,
      totalRoutes: 0,
      totalPosts: 0,
    };
  }
}

/**
 * Lấy dữ liệu doanh thu theo khoảng thời gian
 * @param {string} period - 'day', 'month', 'year'
 * @param {Date} startDate - Ngày bắt đầu (optional)
 * @param {Date} endDate - Ngày kết thúc (optional)
 * @param {string|number} companyId - ID nhà xe để filter (optional)
 * @param {Array} schedules - Danh sách schedules để filter theo company (optional)
 * @returns {Promise<Array>} Mảng dữ liệu doanh thu
 */
export async function getRevenueData(period = 'day', startDate = null, endDate = null, companyId = null, schedules = []) {
  try {
    const params = { period };
    if (startDate) {
      params.startDate = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
      params.endDate = endDate.toISOString().split('T')[0];
    }
    if (companyId) {
      params.companyId = companyId;
    }
    
    const response = await axiosClient.get('/dashboard/revenue', { params });
    
    if (response && response.success && response.data) {
      return response.data;
    }
    
    // Nếu backend chưa có endpoint, tính toán từ tickets
    return await getRevenueFromTickets(period, startDate, endDate, companyId, schedules);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    // Fallback: tính toán từ tickets
    return await getRevenueFromTickets(period, startDate, endDate, companyId, schedules);
  }
}

/**
 * Tính toán doanh thu từ danh sách vé (fallback nếu backend chưa có endpoint)
 */
async function getRevenueFromTickets(period, startDate, endDate, companyId = null, schedules = []) {
  try {
    const { getTickets } = await import('./ticketService');
    const tickets = await getTickets({ page: 1, limit: 10000 });
    
    console.log('Total tickets fetched:', tickets.length);
    
    // Lọc vé đã thanh toán thành công
    let paidTickets = tickets.filter(t => {
      const status = t.status || '';
      const isPaid = ['COMPLETED', 'SUCCESS', 'PAID', 'BOOKED'].includes(status);
      if (isPaid) {
        console.log('Paid ticket found:', {
          id: t.id,
          status: status,
          price: t.price || t.ticketPrice,
          date: t.createdAt || t.created_at || t.bookingDate || t.booking_date,
          scheduleId: t.scheduleId || t.schedule_id
        });
      }
      return isPaid;
    });
    
    // Filter theo nhà xe nếu có
    if (companyId && schedules.length > 0) {
      // Lấy danh sách schedule IDs của nhà xe
      const companyScheduleIds = schedules
        .filter(s => {
          const busCompanyId = s.bus?.company_id || s.route?.bus_company_id || s.busCompanyId || s.bus_company_id;
          return Number(busCompanyId) === Number(companyId);
        })
        .map(s => s.id);
      
      console.log('Company schedule IDs:', companyScheduleIds);
      
      // Filter tickets theo schedule IDs
      paidTickets = paidTickets.filter(t => {
        const ticketScheduleId = t.scheduleId || t.schedule_id;
        return companyScheduleIds.includes(ticketScheduleId);
      });
      
      console.log('Paid tickets after company filter:', paidTickets.length);
    }
    
    console.log('Paid tickets count:', paidTickets.length);
    
    // Nhóm theo period
    const grouped = {};
    
    paidTickets.forEach(ticket => {
      // Thử nhiều field để lấy ngày
      const dateStr = ticket.createdAt || ticket.created_at || ticket.bookingDate || ticket.booking_date || ticket.createdAtDate || ticket.created_at_date;
      
      if (!dateStr) {
        console.warn('Ticket missing date:', ticket.id);
        return;
      }
      
      const ticketDate = new Date(dateStr);
      
      // Kiểm tra nếu date không hợp lệ
      if (isNaN(ticketDate.getTime())) {
        console.warn('Invalid date for ticket:', ticket.id, dateStr);
        return;
      }
      
      // Kiểm tra nếu có filter date (chỉ so sánh ngày, không so sánh giờ)
      if (startDate) {
        const ticketDateOnly = new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (ticketDateOnly < startDateOnly) {
          console.log('Ticket before startDate:', ticket.id, ticketDateOnly, startDateOnly);
          return;
        }
      }
      if (endDate) {
        // So sánh chỉ ngày, không so sánh giờ
        const ticketDateOnly = new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        if (ticketDateOnly > endDateOnly) {
          console.log('Ticket after endDate:', ticket.id, ticketDateOnly, endDateOnly);
          return;
        }
      }
      
      let key = '';
      if (period === 'day') {
        key = ticketDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'month') {
        const month = ticketDate.getMonth() + 1;
        key = `${ticketDate.getFullYear()}-${month < 10 ? '0' + month : month}`; // YYYY-MM
      } else if (period === 'year') {
        key = String(ticketDate.getFullYear()); // YYYY
      }
      
      if (!grouped[key]) {
        grouped[key] = { date: key, revenue: 0, count: 0 };
      }
      
      const price = Number(ticket.price || ticket.ticketPrice || ticket.priceForSeatType || 0);
      grouped[key].revenue += price;
      grouped[key].count += 1;
      
      console.log('Added ticket to group:', {
        key: key,
        price: price,
        ticketId: ticket.id
      });
    });
    
    // Chuyển thành mảng và sắp xếp
    const result = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log('Revenue data result:', result);
    console.log('Total groups:', result.length);
    
    return result;
  } catch (error) {
    console.error('Error calculating revenue from tickets:', error);
    return [];
  }
}


