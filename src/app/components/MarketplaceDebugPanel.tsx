import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

type SortPair = { key: string; value: number };

const sortEntriesDesc = (entries: Array<[string, number]>): SortPair[] =>
  entries
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));

export default function MarketplaceDebugPanel() {
  const { activities, trips, users, offers, bookings } = useApp();
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const cityCounts = new Map<string, number>();
    const roleCounts = new Map<string, number>();
    const tripStatusCounts = new Map<string, number>();
    const requestTypeCounts = new Map<string, number>();

    activities.forEach((activity) => {
      cityCounts.set(activity.city, (cityCounts.get(activity.city) || 0) + 1);
    });

    users
      .filter((user) => user.role !== 'traveler')
      .forEach((user) => {
        roleCounts.set(user.role, (roleCounts.get(user.role) || 0) + 1);
      });

    trips.forEach((trip) => {
      tripStatusCounts.set(trip.status, (tripStatusCounts.get(trip.status) || 0) + 1);

      (trip.serviceRequests || trip.requiredServices.map((service) => ({ serviceType: service.type }))).forEach(
        (request) => {
          const normalized =
            request.serviceType === 'activity_operator' || request.serviceType === 'activity_provider'
              ? 'activity_operator'
              : request.serviceType;
          requestTypeCounts.set(normalized, (requestTypeCounts.get(normalized) || 0) + 1);
        }
      );
    });

    const topCities = sortEntriesDesc(Array.from(cityCounts.entries())).slice(0, 12);

    return {
      totalActivities: activities.length,
      totalTrips: trips.length,
      totalSuppliers: users.filter((user) => user.role !== 'traveler').length,
      totalOffers: offers.length,
      totalBookings: bookings.length,
      cities: topCities,
      roles: sortEntriesDesc(Array.from(roleCounts.entries())),
      statuses: sortEntriesDesc(Array.from(tripStatusCounts.entries())),
      requestTypes: sortEntriesDesc(Array.from(requestTypeCounts.entries())),
    };
  }, [activities, bookings.length, offers.length, trips, users]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] pointer-events-none">
      <div className="pointer-events-auto max-w-sm w-[min(94vw,380px)]">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors font-semibold text-sm"
        >
          {open ? 'Hide Marketplace Debug' : 'Show Marketplace Debug'}
        </button>

        {open && (
          <div className="mt-2 rounded-xl border border-slate-200 bg-white shadow-xl p-4 space-y-3 text-xs text-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Marketplace Snapshot</h3>
              <p className="text-slate-500">Live seeded data diagnostics</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Activities</p>
                <p className="text-sm font-bold text-slate-900">{stats.totalActivities}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Trips</p>
                <p className="text-sm font-bold text-slate-900">{stats.totalTrips}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Suppliers</p>
                <p className="text-sm font-bold text-slate-900">{stats.totalSuppliers}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Offers / Bookings</p>
                <p className="text-sm font-bold text-slate-900">{stats.totalOffers} / {stats.totalBookings}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-1">Cities (activities)</p>
              <div className="flex flex-wrap gap-1">
                {stats.cities.map((item) => (
                  <span key={item.key} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                    {item.key}: {item.value}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-1">Suppliers by role</p>
              <div className="flex flex-wrap gap-1">
                {stats.roles.map((item) => (
                  <span key={item.key} className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
                    {item.key}: {item.value}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-1">Trip statuses</p>
              <div className="flex flex-wrap gap-1">
                {stats.statuses.map((item) => (
                  <span key={item.key} className="px-2 py-1 rounded-md bg-amber-50 text-amber-700">
                    {item.key}: {item.value}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-1">Service request types</p>
              <div className="flex flex-wrap gap-1">
                {stats.requestTypes.map((item) => (
                  <span key={item.key} className="px-2 py-1 rounded-md bg-purple-50 text-purple-700">
                    {item.key}: {item.value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
