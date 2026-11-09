
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  CalendarDays,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Activity,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

import { getServices } from "../services/serviceApi";
import "../../../styles/services.css";

const getServiceIcon = (name = "") => {
  const value = name.toLowerCase();

  if (value.includes("heart") || value.includes("cardio")) {
    return HeartPulse;
  }

  if (value.includes("health") || value.includes("check")) {
    return Activity;
  }

  if (value.includes("consult")) {
    return Stethoscope;
  }

  return ShieldCheck;
};

const ServicesPage = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getServices();

      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    let result = services.filter((service) => {
      const searchText = search.toLowerCase();

      return (
        service.name?.toLowerCase().includes(searchText) ||
        service.description?.toLowerCase().includes(searchText)
      );
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === "duration") {
      result.sort(
        (a, b) =>
          Number(a.duration_minutes) -
          Number(b.duration_minutes)
      );
    }

    return result;
  }, [services, search, sortBy]);

  const handleBooking = (service) => {
    navigate("/book", {
      state: { service },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price) || 0);
  };

  return (
    <main className="services-page">

      {/* Page Heading */}
      <section className="services-heading">
        <div>
          <div className="services-eyebrow">
            <Sparkles size={15} />
            YOUR HEALTH, OUR PRIORITY
          </div>

          <h1>Explore Our Services</h1>

          <p>
            Discover the right healthcare service for you.
            Browse our available services and book your
            appointment with ease.
          </p>
        </div>

        <div className="services-heading-icon">
          <HeartPulse size={55} strokeWidth={1.4} />
        </div>
      </section>

      {/* Information Banner */}
      <section className="services-info-banner">
        <div className="services-info-icon">
          <ShieldCheck size={25} />
        </div>

        <div>
          <h3>Care that puts you first</h3>
          <p>
            Choose a service, find an available appointment,
            and manage your bookings in one place.
          </p>
        </div>

        <div className="services-banner-decoration">
          <Activity size={65} />
        </div>
      </section>

      {/* Service Search and Filters */}
      <section className="services-toolbar">

        <div className="services-toolbar-heading">
          <div>
            <h2>Available Services</h2>
            <p>
              Find the healthcare service you need.
            </p>
          </div>

          <span className="services-count">
            {services.length} services
          </span>
        </div>

        <div className="services-controls">

          <div className="services-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search services"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="services-sort">
            <SlidersHorizontal size={17} />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort services"
            >
              <option value="default">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>

        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="services-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="service-skeleton" key={index}>
              <div className="skeleton-icon" />
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
              <div className="skeleton-button" />
            </div>
          ))}
        </section>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="services-message error-message">
          <div className="message-icon">
            <RefreshCw size={28} />
          </div>

          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button
            type="button"
            onClick={loadServices}
            className="services-retry-btn"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && services.length === 0 && (
        <div className="services-message">
          <div className="message-icon">
            <Stethoscope size={32} />
          </div>

          <h3>No services available</h3>

          <p>
            There are currently no active services.
            Please check again later.
          </p>
        </div>
      )}

      {/* No Search Results */}
      {!loading &&
        !error &&
        services.length > 0 &&
        filteredServices.length === 0 && (
          <div className="services-message">
            <div className="message-icon">
              <Search size={32} />
            </div>

            <h3>No matching services</h3>

            <p>
              We couldn't find any services matching "{search}".
            </p>

            <button
              type="button"
              className="services-retry-btn"
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          </div>
        )}

      {/* Service Cards */}
      {!loading && !error && filteredServices.length > 0 && (
        <section className="services-grid">

          {filteredServices.map((service) => {
            const ServiceIcon = getServiceIcon(service.name);

            return (
              <article
                className="service-card"
                key={service.id}
              >
                <div className="service-card-top">

                  <div className="service-icon">
                    <ServiceIcon size={26} />
                  </div>

                  <span className="service-available">
                    <span />
                    Available
                  </span>

                </div>

                <div className="service-card-content">
                  <h3>{service.name}</h3>

                  <p className="service-description">
                    {service.description ||
                      "Professional healthcare service designed to support your wellbeing."}
                  </p>
                </div>

                <div className="service-details">

                  <div className="service-detail-item">
                    <Clock size={17} />
                    <div>
                      <span>Duration</span>
                      <strong>
                        {service.duration_minutes} minutes
                      </strong>
                    </div>
                  </div>

                  <div className="service-detail-item price-detail">
                    <div>
                      <span>Consultation fee</span>
                      <strong>
                        {formatPrice(service.price)}
                      </strong>
                    </div>
                  </div>

                </div>

                <button
  type="button"
  className="service-book-btn"
  onClick={() => handleBooking(service)}
>
  Book Appointment
  <ArrowRight size={17} />
</button>

              </article>
            );
          })}

        </section>
      )}

      {/* Bottom Information */}
      {!loading && !error && services.length > 0 && (
        <section className="services-footer-note">
          <ShieldCheck size={19} />

          <p>
            Your appointments are managed securely.
            You can view and manage your bookings anytime.
          </p>
        </section>
      )}

    </main>
  );
};

export default ServicesPage;
