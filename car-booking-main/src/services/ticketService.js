import axiosClient from './axiosClient';

const ticketService = {
  // Lấy danh sách vé của user hiện tại
  getMyTickets: () => {
    return axiosClient.get('/tickets/my-tickets');
  },

  // Tra cứu vé bằng mã vé và số điện thoại (không cần đăng nhập)
  lookupTicket: (ticketCode, phone) => {
    return axiosClient.get('/tickets/lookup', {
      params: { ticketCode, phone },
    });
  },

  // Xem chi tiết vé
  getTicketById: (id) => {
    return axiosClient.get(`/tickets/${id}`);
  },

  // Hủy vé
  cancelTicket: (id) => {
    return axiosClient.post(`/tickets/${id}/cancel`);
  },
};

export default ticketService;



