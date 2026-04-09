import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { LOCATED } from '../../../assets';
import { useTranslation } from '../../../hooks/useTranslation';

interface EmptyTripsProps {
  onCreateTrip: () => void;
}

const EmptyTrips: React.FC<EmptyTripsProps> = ({ onCreateTrip }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image source={LOCATED.LOCATED} style={{ width: 100, height: 100 }} />
      </View>
      <Text style={styles.title}>{t('home.emptyTitle')}</Text>
      <Text style={styles.subtitle}>{t('home.emptySubtitle')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  plusIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SECONDARY_COLOR,
  },
});

export default EmptyTrips;
