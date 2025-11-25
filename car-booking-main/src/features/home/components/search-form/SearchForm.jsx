import "./SearchForm.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoutes } from "../../../../services/routeService";

const SearchForm = ({ initialValues }) => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [formValues, setFormValues] = useState(() => ({
    departureId: initialValues?.departureId || "",
    arrivalId: initialValues?.arrivalId || "",
    date: initialValues?.date || "",
  }));

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      departureId: initialValues?.departureId || "",
      arrivalId: initialValues?.arrivalId || "",
      date: initialValues?.date || "",
    }));
  }, [
    initialValues?.departureId,
    initialValues?.arrivalId,
    initialValues?.date,
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchRoutesData = async () => {
      setLoadingRoutes(true);
      setFetchError("");
      try {
        const response = await getRoutes({ limit: 500 });
        if (!isMounted) return;
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
          ? response
          : [];
        setRoutes(items);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch routes for search form:", error);
        setRoutes([]);
        setFetchError("Không thể tải danh sách tuyến đường. Vui lòng thử lại.");
      } finally {
        if (isMounted) {
          setLoadingRoutes(false);
        }
      }
    };

    fetchRoutesData();

    return () => {
      isMounted = false;
    };
  }, []);

  const uniqueStations = (list, selector) => {
    const map = new Map();
    list.forEach((route) => {
      const station = selector(route);
      if (station?.id && !map.has(String(station.id))) {
        map.set(String(station.id), {
          id: station.id,
          name: station.name,
        });
      }
    });
    return Array.from(map.values());
  };

  const departureOptions = useMemo(
    () => uniqueStations(routes, (route) => route?.departureStation),
    [routes]
  );

  const arrivalOptions = useMemo(() => {
    if (!formValues.departureId) return [];
    const filteredRoutes = routes.filter(
      (route) =>
        String(route?.departureStation?.id) ===
        String(formValues.departureId)
    );
    return uniqueStations(filteredRoutes, (route) => route?.arrivalStation);
  }, [routes, formValues.departureId]);

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;
    setValidationError("");
    setFormValues((prev) => {
      if (field === "departureId") {
        return {
          ...prev,
          departureId: value,
          arrivalId: "",
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const today = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.departureId) {
      setValidationError("Vui lòng chọn điểm khởi hành.");
      return;
    }
    if (!formValues.arrivalId) {
      setValidationError("Vui lòng chọn điểm đến.");
      return;
    }
    if (!formValues.date) {
      setValidationError("Vui lòng chọn ngày khởi hành.");
      return;
    }
    const departureStation = departureOptions.find(
      (station) => String(station.id) === String(formValues.departureId)
    );
    const arrivalStation = arrivalOptions.find(
      (station) => String(station.id) === String(formValues.arrivalId)
    );

    const params = new URLSearchParams({
      departureId: formValues.departureId,
      arrivalId: formValues.arrivalId,
      date: formValues.date,
    });

    if (departureStation?.name) {
      params.append("departureName", departureStation.name);
    }
    if (arrivalStation?.name) {
      params.append("arrivalName", arrivalStation.name);
    }

    navigate(`/book-ticket?${params.toString()}`);
  };

  const isArrivalDisabled =
    !formValues.departureId || arrivalOptions.length === 0;

  return (
    <div className="search-form-wrapper">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-fields">
          <div className="search-field">
            <label className="search-label">Điểm Khởi Hành</label>
            <select
              className="search-control"
              value={formValues.departureId}
              onChange={handleFieldChange("departureId")}
              disabled={loadingRoutes}
            >
              <option value="">
                {loadingRoutes ? "Đang tải..." : "Chọn điểm khởi hành"}
              </option>
              {departureOptions.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label className="search-label">Điểm Đến</label>
            <select
              className="search-control"
              value={formValues.arrivalId}
              onChange={handleFieldChange("arrivalId")}
              disabled={isArrivalDisabled}
            >
              <option value="">
                {!formValues.departureId
                  ? "Chọn điểm khởi hành trước"
                  : arrivalOptions.length === 0
                  ? "Chưa có tuyến phù hợp"
                  : "Chọn điểm đến"}
              </option>
              {arrivalOptions.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label className="search-label">Ngày Khởi Hành</label>
            <div className="search-date-picker">
              <FaCalendarAlt style={{ marginRight: "10px", color: "#000" }} />
              <input
                type="date"
                className="search-control date-input"
                value={formValues.date}
                min={today}
                onChange={handleFieldChange("date")}
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="search-button"
          disabled={loadingRoutes || isArrivalDisabled}
        >
          <IoIosSearch size={24} />
          <span>TÌM CHUYẾN XE</span>
        </button>
      </form>
      {(fetchError || validationError) && (
        <p className="search-error">{fetchError || validationError}</p>
      )}
    </div>
  );
};

export default SearchForm;

