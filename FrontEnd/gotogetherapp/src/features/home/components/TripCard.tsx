import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Trip } from '../api';
import { useTranslation } from '../../../hooks/useTranslation';

interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const { t } = useTranslation();
  const isOwner = trip.members?.[0]?.role === 'OWNER';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return '#2196F3';
      case 'ONGOING':
        return '#4CAF50';
      case 'COMPLETED':
        return '#9E9E9E';
      case 'ARCHIVED':
        return '#757575';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return t('home.statusUpcoming');
      case 'ONGOING':
        return t('home.statusOngoing');
      case 'COMPLETED':
        return t('home.statusCompleted');
      case 'ARCHIVED':
        return t('home.statusArchived');
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(trip)}>
      <View style={styles.imageWrapper}>
        {trip.images ? (
          <Image
            source={{
              uri: trip.images,
            }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Không có ảnh</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.tripName} numberOfLines={1}>
              {trip.name}
            </Text>
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeIcon}>👑</Text>
                <Text style={styles.ownerBadgeText}>Chủ chuyến</Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(trip.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(trip.status) },
              ]}
            >
              {getStatusText(trip.status)}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.dateText}>
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </Text>
        </View>

        <View style={styles.footer}>
          {typeof trip.memberCount === 'number' && (
            <View style={styles.row}>
              <Text style={styles.icon}>👥</Text>
              <Text style={styles.infoText}>{trip.memberCount} thành viên</Text>
            </View>
          )}
          {trip.totalBudget && (
            <View style={styles.row}>
              <Text style={styles.icon}>💰</Text>
              <Text style={styles.infoText}>
                {Number(trip.totalBudget).toLocaleString('vi-VN')}{' '}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 116,
    height: 122,
    backgroundColor: '#EEF2EE',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleWrap: {
    flex: 1,
    marginRight: 8,
  },
  tripName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  ownerBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#FFF4D6',
  },
  ownerBadgeIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A5A00',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  icon: {
    fontSize: 13,
    marginRight: 6,
  },
  destination: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    columnGap: 12,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
});

export default TripCard;
