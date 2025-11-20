import './MediaMentions.css';

const MediaMentions = () => {
  const media = [
    '/24h.png',
    '/vtcnews.png',
    '/24h.png',
    '/vtcnews.png',
    '/24h.png',
  ];

  return (
    <section className="media-mentions">
      <div className="section-container">
        <h2 className="section-title">Vivutoday Được Nhắc Tên Trên</h2>
        <div className="media-logos">
          {media.map((image, index) => (
            <div key={index} className="media-logo">
              <img src={image} alt="" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaMentions;


