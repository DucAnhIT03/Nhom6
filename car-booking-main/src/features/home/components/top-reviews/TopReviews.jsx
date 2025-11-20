import './TopReviews.css';

const TopReviews = () => {
  const cities = [
    { name: 'Sài Gòn', articles: 287, image: '/saigon.png' },
    { name: 'Vũng Tàu', articles: 156, image: '/saigon.png' },
    { name: 'Đà Lạt', articles: 203, image: '/saigon.png' },
    { name: 'Quy Nhơn', articles: 98, image: '/saigon.png' },
    { name: 'Hà Nội', articles: 245, image: '/saigon.png' },
    { name: 'Đà Nẵng', articles: 189, image: '/saigon.png' },
    { name: 'Nha Trang', articles: 167, image: '/saigon.png' },
    { name: 'Phan Thiết', articles: 134, image: '/saigon.png' },
  ];

  return (
    <section className="top-reviews">
      <div className="section-container">
        <h2 className="section-title">Top Reviews</h2>
        <div className="reviews-grid">
          {cities.map((city, index) => (
            <div
              key={index}
              className={`review-card city-${index + 1}`}
              style={{ backgroundImage: `url(${city.image})` }}
            >
              <div className="review-overlay">
                <h3 className="city-name">{city.name}</h3>
                <p className="article-count">{city.articles} bài viết</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopReviews;

