import "./PlatformFeatures.css";

const PlatformFeatures = () => {
  const features = [
    {
      image: "/thumb.png",
      title: "ĐÁP ỨNG MỌI NHU CẦU TÌM KIẾM",
      description:
        "Với hơn 5000+ tuyến đường và 1500+ nhà xe trên khắp cả nước",
    },
    {
      image: "/thumb.png",
      title: "ĐẢM BẢO CÓ VÉ",
      description:
        "Hoàn ngay 150% nếu không có vé, mang đến hành trình trọn vẹn",
    },
    {
      image: "/thumb.png",
      title: "CAM KẾT GIỮ VÉ",
      description: "Vivutoday cam kết hoàn 150% nếu nhà xe không giữ vé",
    },
    {
      image: "/thumb.png",
      title: "TỔNG ĐÀI HỖ TRỢ KHÁCH HÀNG 24/7",
      description:
        "Giải quyết kịp thời vấn đề của khách hàng một cách nhanh chóng",
    },
  ];

  return (
    <section className="platform-features">
      <div className="section-container">
        <h2 className="section-title">Nền Tảng Kết Nối Người Dùng Và Nhà Xe</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <img src={feature.image} alt="" />
              </div>
              <div>
                <h3 className="feature-title">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;

