import { createBrowserRouter, Navigate } from 'react-router';

// Auth screens
import Welcome from './screens/auth/Welcome';
import RoleSelection from './screens/auth/RoleSelection';
import Login from './screens/auth/Login';

// Traveler screens
import TravelerHome from './screens/traveler/TravelerHome';
import CreateTrip from './screens/traveler/CreateTrip';
import DiscoverActivities from './screens/traveler/DiscoverActivities';
import ActivityDetails from './screens/traveler/ActivityDetails';
import PackageDetails from './screens/traveler/PackageDetails';
import TripPlan from './screens/traveler/TripPlan';
import TripDetails from './screens/traveler/TripDetails';
import Booking from './screens/traveler/Booking';
import MyTrips from './screens/traveler/MyTrips';
import BookingManagement from './screens/traveler/BookingManagement';
import ActiveTrip from './screens/traveler/ActiveTrip';
import TravelerActiveTrips from './screens/traveler/TravelerActiveTrips';
import ReviewTrip from './screens/traveler/ReviewTrip';
import TravelStories from './screens/traveler/TravelStories';
import TranslatorDiscovery from './screens/traveler/TranslatorDiscovery';

// Supplier screens
import SupplierHome from './screens/supplier/SupplierHome';
import SupplierVerification from './screens/supplier/SupplierVerification';
import SupplierTripDetails from './screens/supplier/SupplierTripDetails';
import SupplierDashboard from './screens/supplier/SupplierDashboard';
import SupplierBookings from './screens/supplier/SupplierBookings';
import SupplierOperations from './screens/supplier/SupplierOperations';
import SupplierManagement from './screens/supplier/SupplierManagement';
import SupplierNetwork from './screens/supplier/SupplierNetwork';
import SupplierAvailability from './screens/supplier/SupplierAvailability';
import CreatePackage from './screens/supplier/CreatePackage';
import SupplierPackages from './screens/supplier/SupplierPackages';
import SupplierActiveTrip from './screens/supplier/SupplierActiveTrip';
import SupplierGoTrip from './screens/supplier/SupplierGoTrip';

// Shared screens
import Chats from './screens/shared/Chats';
import Profile from './screens/shared/Profile';
import Notifications from './screens/shared/Notifications';
import Payment from './screens/shared/Payment';

export const router = createBrowserRouter([
  // Auth routes
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: '/auth/role-selection',
    element: <RoleSelection />,
  },
  {
    path: '/auth/login',
    element: <Login />,
  },

  // Traveler routes
  {
    path: '/traveler',
    element: <TravelerHome />,
  },
  {
    path: '/traveler/home',
    element: <TravelerHome />,
  },
  {
    path: '/traveler/package/:packageId',
    element: <PackageDetails />,
  },
  {
    path: '/traveler/discover/:cityId',
    element: <DiscoverActivities />,
  },
  {
    path: '/traveler/activity/:activityId',
    element: <ActivityDetails />,
  },
  {
    path: '/traveler/trip-plan',
    element: <TripPlan />,
  },
  {
    path: '/traveler/create-trip',
    element: <CreateTrip />,
  },
  {
    path: '/traveler/booking-management',
    element: <BookingManagement />,
  },
  {
    path: '/traveler/trip/:tripId',
    element: <TripDetails />,
  },
  {
    path: '/traveler/booking/:tripId/:offerId',
    element: <Booking />,
  },
  {
    path: '/traveler/payment/:bookingId',
    element: <Payment />,
  },
  {
    path: '/traveler/my-trips',
    element: <MyTrips />,
  },
  {
    path: '/traveler/active-trip',
    element: <TravelerActiveTrips />,
  },
  {
    path: '/traveler/active-trip/:bookingId',
    element: <ActiveTrip />,
  },
  {
    path: '/traveler/review/:tripId/:bookingId',
    element: <ReviewTrip />,
  },
  {
    path: '/traveler/chats',
    element: <Chats />,
  },
  {
    path: '/traveler/profile',
    element: <Profile />,
  },
  {
    path: '/traveler/stories',
    element: <TravelStories />,
  },
  {
    path: '/traveler/notifications',
    element: <Notifications />,
  },
  {
    path: '/traveler/translators',
    element: <TranslatorDiscovery />,
  },

  // Supplier routes
  {
    path: '/supplier',
    element: <SupplierHome />,
  },
  {
    path: '/supplier/verification',
    element: <SupplierVerification />,
  },
  {
    path: '/supplier/trip/:tripId',
    element: <SupplierTripDetails />,
  },
  {
    path: '/supplier/operations',
    element: <SupplierOperations />,
  },
  {
    path: '/supplier/management',
    element: <SupplierManagement />,
  },
  {
    path: '/supplier/dashboard',
    element: <SupplierDashboard />,
  },
  {
    path: '/supplier/bookings',
    element: <SupplierBookings />,
  },
  {
    path: '/supplier/active-trip/:bookingId',
    element: <SupplierActiveTrip />,
  },
  {
    path: '/supplier/go-trip',
    element: <SupplierGoTrip />,
  },
  {
    path: '/supplier/profile',
    element: <Profile />,
  },
  {
    path: '/supplier/network',
    element: <SupplierNetwork />,
  },
  {
    path: '/supplier/availability',
    element: <SupplierAvailability />,
  },
  {
    path: '/supplier/packages',
    element: <SupplierPackages />,
  },
  {
    path: '/supplier/create-package',
    element: <CreatePackage />,
  },
  {
    path: '/supplier/notifications',
    element: <Notifications />,
  },
  {
    path: '/supplier/chats',
    element: <Chats />,
  },

  // Logout
  {
    path: '/logout',
    element: <Navigate to="/" replace />,
  },

  // 404
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);