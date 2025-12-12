import React from "react";

export default function Filters({
  filters,
  setFilters,
  departments,
  positions,
  locations,
}) {
  return (
    <div className="filters">

      {/* Search by Name */}
      <input
        type="text"
        placeholder="Search by name..."
        value={filters.search}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value })
        }
      />

      {/* Department Filter */}
      <select
        value={filters.department}
        onChange={(e) =>
          setFilters({ ...filters, department: e.target.value })
        }
      >
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Position Filter */}
      <select
        value={filters.position}
        onChange={(e) =>
          setFilters({ ...filters, position: e.target.value })
        }
      >
        <option value="">All Positions</option>
        {positions.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Location Filter */}
      <select
        value={filters.location}
        onChange={(e) =>
          setFilters({ ...filters, location: e.target.value })
        }
      >
        <option value="">All Locations</option>
        {locations.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      {/* Start Date Filter */}
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) =>
          setFilters({ ...filters, startDate: e.target.value })
        }
      />

      {/* Reset button */}
      <button onClick={() =>
        setFilters({
          search: "",
          department: "",
          position: "",
          location: "",
          startDate: ""
        })
      }>
        Reset Filters
      </button>

    </div>
  );
}
