
import { useEffect, useState, useCallback } from "react";
import {
    CalendarDays,
    Plus,
    RefreshCw,
    Trash2,
    Edit,
    Clock,
    MapPin,
    X,
    Save
} from "lucide-react";

import { apiFetch } from "../api/apiFetch.js";
import "./GoogleCalendar.css";

const API_URL =
    "http://localhost:8080/api/auth/appUsers/calendar/events";

const emptyForm = {
    summary: "",
    description: "",
    location: "",
    startDateTime: "",
    endDateTime: ""
};

export default function GoogleCalendar() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    // Convert Google dateTime into datetime-local format
    const toLocalInput = (dateTime) => {
        if (!dateTime) return "";

        const date = new Date(dateTime);
        const offset = date.getTimezoneOffset() * 60000;

        return new Date(date.getTime() - offset)
            .toISOString()
            .slice(0, 16);
    };

    // Fetch All Events
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch(API_URL, {
                method: "GET",
                headers: { Accept: "application/json" }
            });

            const result = await response.json();

            if (!response.ok || result.code !== 1) {
                throw new Error(
                    result.message || "Unable to fetch events."
                );
            }

            setEvents(result.data || []);

        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to load events.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Handle Input
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Open Create Form
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setMessage("");
        setError("");
        setShowForm(true);
    };

    // Create / Update Event
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.summary.trim()) {
            setError("Event title is required.");
            return;
        }

        if (!form.startDateTime || !form.endDateTime) {
            setError("Start and end date are required.");
            return;
        }

        if (
            new Date(form.endDateTime) <=
            new Date(form.startDateTime)
        ) {
            setError("End time must be after start time.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const eventData = {
                summary: form.summary,
                description: form.description,
                location: form.location,
                start: {
                    dateTime: new Date(
                        form.startDateTime
                    ).toISOString(),
                    timeZone: Intl.DateTimeFormat()
                        .resolvedOptions().timeZone
                },
                end: {
                    dateTime: new Date(
                        form.endDateTime
                    ).toISOString(),
                    timeZone: Intl.DateTimeFormat()
                        .resolvedOptions().timeZone
                }
            };

            const isEditing = Boolean(editingId);

            const response = await apiFetch(
                isEditing
                    ? `${API_URL}/${encodeURIComponent(editingId)}`
                    : API_URL,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify(eventData)
                }
            );

            const result = await response.json();

            if (!response.ok || result.code !== 1) {
                throw new Error(
                    result.message || "Unable to save event."
                );
            }

            setMessage(
                isEditing
                    ? "Event updated successfully!"
                    : "Event created successfully!"
            );

            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);

            await fetchEvents();

        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to save event.");
        } finally {
            setSaving(false);
        }
    };

    // Edit Event
    const handleEdit = (event) => {
        setEditingId(event.id);

        setForm({
            summary: event.summary || "",
            description: event.description || "",
            location: event.location || "",
            startDateTime: toLocalInput(
                event.start?.dateTime
            ),
            endDateTime: toLocalInput(
                event.end?.dateTime
            )
        });

        setError("");
        setMessage("");
        setShowForm(true);
    };

    // Delete Event
    const handleDelete = async (event) => {
        if (!window.confirm(
            `Delete "${event.summary}" event?`
        )) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await apiFetch(
                `${API_URL}/${encodeURIComponent(event.id)}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok || result.code !== 1) {
                throw new Error(
                    result.message || "Unable to delete event."
                );
            }

            setEvents(prev =>
                prev.filter(item => item.id !== event.id)
            );

            setMessage("Event deleted successfully!");

        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to delete event.");
        }
    };

    // Format Event Date
    const formatDate = (dateTime) => {
        if (!dateTime) return "—";

        return new Date(dateTime).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    return (
        <div className="calendar-page">

            <header className="calendar-header">
                <div>
                    <span className="calendar-overline">
                        GOOGLE WORKSPACE
                    </span>

                    <h1>
                        <CalendarDays size={30} />
                        My Calendar
                    </h1>

                    <p>
                        Manage your Google Calendar events
                        in one place.
                    </p>
                </div>

                <div className="calendar-header-actions">
                    <button
                        className="calendar-refresh"
                        onClick={fetchEvents}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "calendar-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        className="calendar-create"
                        onClick={openCreateForm}
                    >
                        <Plus size={19} />
                        Create Event
                    </button>
                </div>
            </header>

            <div className="calendar-stats">
                <div className="calendar-stat-card">
                    <CalendarDays size={24} />
                    <div>
                        <span>Total Events</span>
                        <h2>{events.length}</h2>
                    </div>
                </div>
            </div>

            {message && (
                <div className="calendar-success">
                    {message}
                    <button onClick={() => setMessage("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            {error && (
                <div className="calendar-error">
                    {error}
                    <button onClick={() => setError("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            {showForm && (
                <div className="calendar-form-card">

                    <div className="calendar-form-heading">
                        <div>
                            <h2>
                                {editingId
                                    ? "Update Event"
                                    : "Create New Event"}
                            </h2>
                            <p>
                                Enter your event details below.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="calendar-close"
                            onClick={() => setShowForm(false)}
                        >
                            <X />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="calendar-form-grid">

                            <div className="calendar-field">
                                <label>Event Title *</label>
                                <input
                                    name="summary"
                                    value={form.summary}
                                    onChange={handleChange}
                                    placeholder="Enter event title"
                                    required
                                />
                            </div>

                            <div className="calendar-field">
                                <label>Location</label>
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="Enter location"
                                />
                            </div>

                            <div className="calendar-field">
                                <label>Start Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={form.startDateTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="calendar-field">
                                <label>End Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    value={form.endDateTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="calendar-field full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter event description"
                                    rows={3}
                                />
                            </div>

                        </div>

                        <div className="calendar-form-actions">
                            <button
                                type="button"
                                className="calendar-cancel"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="calendar-save"
                                disabled={saving}
                            >
                                <Save size={17} />
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Event"
                                        : "Create Event"}
                            </button>
                        </div>

                    </form>
                </div>
            )}

            <section className="calendar-events-section">

                <div className="calendar-section-heading">
                    <div>
                        <h2>Upcoming Events</h2>
                        <p>Your Google Calendar schedule</p>
                    </div>
                </div>

                {loading ? (
                    <div className="calendar-empty">
                        <RefreshCw className="calendar-spin" />
                        <p>Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="calendar-empty">
                        <CalendarDays size={45} />
                        <h3>No events found</h3>
                        <p>Create your first calendar event.</p>
                        <button
                            className="calendar-create"
                            onClick={openCreateForm}
                        >
                            <Plus size={18} />
                            Create Event
                        </button>
                    </div>
                ) : (
                    <div className="calendar-event-list">

                        {events.map(event => (

                            <article
                                className="calendar-event-card"
                                key={event.id}
                            >

                                <div className="calendar-event-icon">
                                    <CalendarDays size={25} />
                                </div>

                                <div className="calendar-event-info">
                                    <h3>{event.summary || "Untitled Event"}</h3>

                                    {event.description && (
                                        <p>{event.description}</p>
                                    )}

                                    <div className="calendar-event-meta">
                                        <span>
                                            <Clock size={15} />
                                            {formatDate(
                                                event.start?.dateTime ||
                                                event.start?.date
                                            )}
                                        </span>

                                        {event.location && (
                                            <span>
                                                <MapPin size={15} />
                                                {event.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="calendar-event-actions">
                                    <button
                                        title="Edit Event"
                                        onClick={() => handleEdit(event)}
                                    >
                                        <Edit size={17} />
                                    </button>

                                    <button
                                        className="calendar-delete"
                                        title="Delete Event"
                                        onClick={() => handleDelete(event)}
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}
