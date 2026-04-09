import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers/store';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { Trip, tripApi } from './api';
import TripCard from './components/TripCard';
import EmptyTrips from './components/EmptyTrips';
import TripFilter from './components/TripFilter';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { HELLO } from '../../assets';
import { SCREEN_NAME } from '../../constants/screenName';
import AddTripScreen from './components/AddTripScreen';
import SimpleFloatingButton from '../../components/SimpleFloatingButton';
import NotificationButton from '../../components/NotificationButton';
import TripTimeFilterModal from './components/TripTimeFilterModal';
import { showErrorToast, showSuccessToast } from '../../utils/appToast';
import { useTranslation } from '../../hooks/useTranslation';

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.login.user);
  const { t, locale } = useTranslation();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [invitationActionTripId, setInvitationActionTripId] = useState<
    string | null
  >(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const params = selectedFilter !== 'ALL' ? { status: selectedFilter } : {};
      const response = await tripApi.getTrips(params);

      if (response.status) {
        setTrips(response.data.trips);
      }
    } catch (error: any) {
      console.error('Error fetching trips:', error);
      showErrorToast(
        t('common.error'),
        error?.error || t('home.loadTripsFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  }, [fetchTrips]);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips]),
  );

  const handleTripPress = (trip: Trip) => {
    (navigation as any).navigate(SCREEN_NAME.TRIP_DETAIL, { tripId: trip.id });
  };

  const handleCreateTrip = () => {
    setShowAddTrip(true);
  };

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TripCard trip={item} onPress={handleTripPress} />
  );

  const getCurrentInviteStatus = (trip: Trip) => {
    if (!trip.members || trip.members.length === 0) {
      return 'ACCEPTED';
    }
    return trip.members[0].inviteStatus;
  };

  const acceptedTrips = trips.filter(
    trip => getCurrentInviteStatus(trip) === 'ACCEPTED',
  );

  const availableTripYears = useMemo(() => {
    const years = new Set<number>();

    acceptedTrips.forEach(trip => {
      const startYear = new Date(trip.startDate).getFullYear();
      const endYear = new Date(trip.endDate).getFullYear();

      for (let year = startYear; year <= endYear; year += 1) {
        years.add(year);
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [acceptedTrips]);

  const filteredAcceptedTrips = useMemo(() => {
    const month = selectedMonthDate.getMonth();
    const year = selectedMonthDate.getFullYear();

    return acceptedTrips.filter(trip => {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);

      const rangeStart = new Date(year, month, 1);
      const rangeEnd = new Date(year, month + 1, 0);
      rangeEnd.setHours(23, 59, 59, 999);

      return tripStart <= rangeEnd && tripEnd >= rangeStart;
    });
  }, [acceptedTrips, selectedMonthDate]);

  const pendingTrips = trips.filter(
    trip => getCurrentInviteStatus(trip) === 'PENDING',
  );

  const handleRespondInvitation = async (
    tripId: string,
    status: 'ACCEPTED' | 'REJECTED',
  ) => {
    try {
      setInvitationActionTripId(tripId);
      const response = await tripApi.respondInvitation(tripId, { status });

      if (response.status) {
        showSuccessToast(
          t('common.success'),
          status === 'ACCEPTED'
            ? t('home.inviteAccepted')
            : t('home.inviteRejected'),
        );
      }

      await fetchTrips();
    } catch (error: any) {
      showErrorToast(
        t('common.error'),
        error?.error || error?.message || t('home.inviteActionFailed'),
      );
    } finally {
      setInvitationActionTripId(null);
    }
  };

  const renderEmptyState = () => {
    if (loading) return null;
    if (acceptedTrips.length && !filteredAcceptedTrips.length) {
      return (
        <View style={styles.noResultWrap}>
          <Text style={styles.noResultText}>{t('home.noTripsInMonth')}</Text>
        </View>
      );
    }
    return <EmptyTrips onCreateTrip={handleCreateTrip} />;
  };

  const now = new Date();
  const isTimeFilterActive =
    selectedMonthDate.getMonth() !== now.getMonth() ||
    selectedMonthDate.getFullYear() !== now.getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={{ uri: user?.avatar }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={styles.greetingText}>{t('common.hello')}</Text>
            <Image source={HELLO.HELLO} style={{ height: 15, width: 15 }} />
          </View>
          <Text style={styles.userName}>
            {user?.fullName || t('common.user')}
          </Text>
        </View>
        <NotificationButton />
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.tabBar}>
          <Text style={styles.sectionTitle}>{t('home.title')}</Text>
          <View
            style={[
              styles.calendarButton,
              isTimeFilterActive && styles.calendarButtonActive,
            ]}
          >
            <TripTimeFilterModal
              selectedDate={selectedMonthDate}
              onDateChange={setSelectedMonthDate}
              availableYears={availableTripYears}
            />
          </View>
        </View>
        <TripFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {pendingTrips.length > 0 && (
          <View style={styles.inviteSection}>
            <Text style={styles.inviteSectionTitle}>
              {t('home.tripInvites')}
            </Text>
            {pendingTrips.map(trip => {
              const isActing = invitationActionTripId === trip.id;
              return (
                <View key={trip.id} style={styles.inviteCard}>
                  <View>
                    {trip.images ? (
                      <View style={styles.inviteImageContainer}>
                        <Image
                          source={{ uri: trip.images }}
                          style={styles.inviteImage}
                          resizeMode="cover"
                        />
                      </View>
                    ) : null}
                    <Text style={styles.inviteTripName} numberOfLines={1}>
                      {trip.name}
                    </Text>
                    <Text style={styles.inviteDateText}>
                      {new Date(trip.startDate).toLocaleDateString(
                        locale === 'en' ? 'en-US' : 'vi-VN',
                      )}{' '}
                      -{' '}
                      {new Date(trip.endDate).toLocaleDateString(
                        locale === 'en' ? 'en-US' : 'vi-VN',
                      )}
                    </Text>
                  </View>

                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() =>
                        handleRespondInvitation(trip.id, 'REJECTED')
                      }
                      disabled={isActing}
                    >
                      <Text style={styles.rejectButtonText}>
                        {t('home.rejectInvite')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() =>
                        handleRespondInvitation(trip.id, 'ACCEPTED')
                      }
                      disabled={isActing}
                    >
                      {isActing ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.acceptButtonText}>
                          {t('home.acceptInvite')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : (
          <FlatList
            data={filteredAcceptedTrips}
            renderItem={renderTripItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[PRIMARY_COLOR]}
              />
            }
          />
        )}
      </View>
      <SimpleFloatingButton
        onPress={handleCreateTrip}
        icon="+"
        backgroundColor={SECONDARY_COLOR}
        size={56}
        bottom={20}
        right={20}
        position="right"
      />
      <AddTripScreen
        visible={showAddTrip}
        onClose={() => setShowAddTrip(false)}
        onSuccess={fetchTrips}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greetingText: {
    fontFamily: 'DancingScript-Regular',
    fontSize: 18,
    color: SECONDARY_COLOR,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  notificationIcon: {
    fontSize: 24,
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderRadius: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  calendarButton: {
    padding: 0,
    borderRadius: 8,
  },
  calendarButtonActive: {
    backgroundColor: '#D1FAE5',
  },
  calendarIcon: {
    fontSize: 20,
  },
  calendarIconActive: {
    color: '#047857',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  noResultWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  noResultText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  inviteSection: {
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
  },
  inviteSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  inviteCard: {
    backgroundColor: '#F6FAF7',
    borderWidth: 1,
    borderColor: '#DDE9DF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  inviteImageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E9EEF0',
    marginBottom: 8,
  },
  inviteTripName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  inviteImage: {
    width: '100%',
    height: '100%',
  },
  inviteDateText: {
    marginTop: 4,
    fontSize: 13,
    color: '#667085',
  },
  inviteActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  rejectButtonText: {
    color: '#344054',
    fontWeight: '700',
  },
});

export default HomeScreen;
