import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Member } from '../api';
import { useTranslation } from '../../../hooks/useTranslation';

interface MemberSectionProps {
  members: Member[];
  onAddMember?: () => void;
  onViewAll?: () => void;
}

const MemberSection: React.FC<MemberSectionProps> = ({
  members,
  onAddMember,
  onViewAll,
}) => {
  const { t } = useTranslation();
  const displayMembers = members.slice(0, 4);

  const getAvatarColor = (index: number) => {
    const colors = ['#FFB74D', '#64B5F6', '#81C784', '#E57373', '#9575CD'];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{t('trip.members')}</Text>
        {!!members.length && (
          <Text style={styles.countText}>{members.length} người</Text>
        )}
      </View>
      <View style={styles.membersRow}>
        {displayMembers.map((member, index) => (
          <View key={member.id} style={styles.memberItem}>
            <View style={styles.avatarContainer}>
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: getAvatarColor(index) },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {member.fullName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.memberName} numberOfLines={1}>
              {member.fullName || 'User'}
            </Text>
          </View>
        ))}

        {onAddMember && (
          <TouchableOpacity style={styles.memberItem} onPress={onAddMember}>
            <View style={styles.addButton}>
              <Text style={styles.addText}>+</Text>
            </View>
          </TouchableOpacity>
        )}

        {onViewAll && members.length > displayMembers.length && (
          <TouchableOpacity style={styles.viewAllLink} onPress={onViewAll}>
            <Text style={styles.viewText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B2332',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    minHeight: 56,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    color: '#8A96A8',
    fontWeight: '600',
  },
  viewAll: {},
  viewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1FB45C',
  },
  memberItem: {
    alignItems: 'center',
    marginRight: -10,
    width: 44,
    zIndex: 10,
  },
  avatarContainer: {
    marginBottom: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EAF1ED',
  },
  avatarText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  memberName: {
    display: 'none',
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#C2CEDC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: '#EBF1F6',
  },
  addText: {
    fontSize: 26,
    color: '#7D8A9D',
    marginTop: -1,
  },
  viewAllLink: {
    marginLeft: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});

export default MemberSection;
